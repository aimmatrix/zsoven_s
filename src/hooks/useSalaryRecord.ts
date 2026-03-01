"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { SalaryRecord, defaultSalaryRecord } from "@/lib/types";

export interface LogCounts {
  penalty: number;
  loan: number;
  sales_credit: number;
  iou: number;
}

export function useSalaryRecord(
  employeeId: string | null,
  month: number,
  year: number,
  defaultWorkingDays: number
) {
  const [record, setRecord] = useState<SalaryRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logCounts, setLogCounts] = useState<LogCounts>({ penalty: 0, loan: 0, sales_credit: 0, iou: 0 });
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch or create record
  useEffect(() => {
    if (!employeeId) return;

    const fetchRecord = async () => {
      setLoading(true);
      setSaved(false);

      const { data, error } = await supabase
        .from("salary_records")
        .select("*")
        .eq("employee_id", employeeId)
        .eq("month", month)
        .eq("year", year)
        .single();

      // Compute date range for this month
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const endDate = month === 12
        ? `${year + 1}-01-01`
        : `${year}-${String(month + 1).padStart(2, "0")}-01`;

      // Fetch deduction logs for this employee + month
      const { data: logs } = await supabase
        .from("deduction_logs")
        .select("type, amount, description")
        .eq("employee_id", employeeId)
        .gte("event_date", startDate)
        .lt("event_date", endDate);

      // Compute log counts
      const counts: LogCounts = { penalty: 0, loan: 0, sales_credit: 0, iou: 0 };
      if (logs) {
        for (const log of logs) {
          if (log.type in counts) {
            counts[log.type as keyof LogCounts]++;
          }
        }
      }
      setLogCounts(counts);

      // Sum log entries by type
      let penaltyTotal = 0, loanTotal = 0, salesCreditTotal = 0, iouTotal = 0;
      const penaltyDescs: string[] = [];
      const salesCreditDescs: string[] = [];

      if (logs && logs.length > 0) {
        for (const log of logs) {
          const amt = Number(log.amount) || 0;
          switch (log.type) {
            case "penalty":
              penaltyTotal += amt;
              if (log.description) penaltyDescs.push(log.description);
              break;
            case "loan":
              loanTotal += amt;
              break;
            case "sales_credit":
              salesCreditTotal += amt;
              if (log.description) salesCreditDescs.push(log.description);
              break;
            case "iou":
              iouTotal += amt;
              break;
          }
        }
      }

      if (error && error.code === "PGRST116") {
        // No record found — use defaults
        const rec = defaultSalaryRecord(employeeId, month, year, defaultWorkingDays);
        rec.penalty_amount = penaltyTotal;
        rec.penalty_description = penaltyDescs.join("; ");
        rec.loan_amount = loanTotal;
        rec.sales_cred_amount = salesCreditTotal;
        rec.sales_cred_item = salesCreditDescs.join("; ");
        rec.iou_amount = iouTotal;
        setRecord(rec);
      } else if (error) {
        console.error("Error fetching salary record:", error);
        setRecord(defaultSalaryRecord(employeeId, month, year, defaultWorkingDays));
      } else {
        // Existing record — always override deduction fields with log sums
        setRecord({
          ...data,
          holiday_days_taken: Number(data.holiday_days_taken ?? 0),
          odt_days: Number(data.odt_days),
          ot_hours: Number(data.ot_hours),
          leave_pay_amount: Number(data.leave_pay_amount),
          bonus_amount: Number(data.bonus_amount),
          absent_days: Number(data.absent_days),
          loan_amount: loanTotal,
          penalty_amount: penaltyTotal,
          penalty_description: penaltyDescs.length > 0 ? penaltyDescs.join("; ") : data.penalty_description,
          sales_cred_amount: salesCreditTotal,
          sales_cred_item: salesCreditDescs.length > 0 ? salesCreditDescs.join("; ") : data.sales_cred_item,
          iou_amount: iouTotal,
        });
      }
      setLoading(false);
    };

    fetchRecord();
  }, [employeeId, month, year, defaultWorkingDays]);

  // Save to Supabase
  const save = useCallback(
    async (recordToSave: SalaryRecord) => {
      if (!employeeId) return;
      setSaving(true);
      setSaved(false);

      const payload = {
        employee_id: recordToSave.employee_id,
        month: recordToSave.month,
        year: recordToSave.year,
        working_days: recordToSave.working_days,
        holiday_days_taken: recordToSave.holiday_days_taken,
        odt_days: recordToSave.odt_days,
        ot_hours: recordToSave.ot_hours,
        leave_pay_enabled: recordToSave.leave_pay_enabled,
        leave_pay_amount: recordToSave.leave_pay_amount,
        bonus_enabled: recordToSave.bonus_enabled,
        bonus_amount: recordToSave.bonus_amount,
        absent_days: recordToSave.absent_days,
        loan_amount: recordToSave.loan_amount,
        loan_paid: recordToSave.loan_paid,
        penalty_description: recordToSave.penalty_description,
        penalty_amount: recordToSave.penalty_amount,
        sales_cred_item: recordToSave.sales_cred_item,
        sales_cred_amount: recordToSave.sales_cred_amount,
        iou_amount: recordToSave.iou_amount,
        updated_at: new Date().toISOString(),
      };

      if (recordToSave.id) {
        await supabase
          .from("salary_records")
          .update(payload)
          .eq("id", recordToSave.id);
      } else {
        const { data } = await supabase
          .from("salary_records")
          .upsert(payload, {
            onConflict: "employee_id,month,year",
          })
          .select()
          .single();

        if (data) {
          setRecord((prev) => (prev ? { ...prev, id: data.id } : prev));
        }
      }

      setSaving(false);
      setSaved(true);
    },
    [employeeId]
  );

  // Debounced auto-save
  const updateRecord = useCallback(
    (updates: Partial<SalaryRecord>) => {
      setRecord((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, ...updates };

        // Debounce save
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
          save(updated);
        }, 1000);

        return updated;
      });
    },
    [save]
  );

  // Immediate save (for navigation)
  const saveNow = useCallback(async () => {
    if (record) {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      await save(record);
    }
  }, [record, save]);

  return { record, loading, saving, saved, updateRecord, saveNow, logCounts };
}
