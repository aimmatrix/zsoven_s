"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useEmployees } from "@/hooks/useEmployees";
import { SalaryRecord } from "@/lib/types";
import SummaryTable from "@/components/SummaryTable";
import MonthYearPicker from "@/components/MonthYearPicker";

function SummaryContent() {
  const searchParams = useSearchParams();
  const now = new Date();
  const [month, setMonth] = useState(
    Number(searchParams.get("month")) || now.getMonth() + 1
  );
  const [year, setYear] = useState(
    Number(searchParams.get("year")) || now.getFullYear()
  );
  const [records, setRecords] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const { employees, loading: empLoading } = useEmployees();

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("salary_records")
        .select("*")
        .eq("month", month)
        .eq("year", year);

      if (data) {
        setRecords(
          data.map((r) => ({
            ...r,
            odt_days: Number(r.odt_days),
            ot_hours: Number(r.ot_hours),
            leave_pay_amount: Number(r.leave_pay_amount),
            bonus_amount: Number(r.bonus_amount),
            absent_days: Number(r.absent_days),
            loan_amount: Number(r.loan_amount),
            penalty_amount: Number(r.penalty_amount),
            sales_cred_amount: Number(r.sales_cred_amount),
            iou_amount: Number(r.iou_amount),
          }))
        );
      }
      setLoading(false);
    };

    fetchRecords();
  }, [month, year]);

  const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  if (empLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading summary...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <a href="/" className="text-sm text-blue-600 hover:text-blue-800">
              &larr; Home
            </a>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">
              Salary Summary
            </h1>
            <p className="text-sm text-gray-500">
              {MONTHS[month - 1]} {year}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <MonthYearPicker
              month={month}
              year={year}
              onChange={(m, y) => {
                setMonth(m);
                setYear(y);
              }}
            />
            <a
              href={`/salary?month=${month}&year=${year}`}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit Salaries
            </a>
          </div>
        </div>

        {/* Summary Table */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <SummaryTable employees={employees} records={records} />
        </div>
      </div>
    </div>
  );
}

export default function SummaryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      }
    >
      <SummaryContent />
    </Suspense>
  );
}
