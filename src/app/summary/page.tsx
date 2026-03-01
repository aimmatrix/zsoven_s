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
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 font-medium">Generating payroll summary...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 mt-2 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <a href="/" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 mb-2 transition-colors">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Dashboard
            </a>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              Payroll Summary
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800 tracking-normal">
                {MONTHS[month - 1]} {year}
              </span>
            </h1>
            <p className="text-gray-500 mt-1.5 text-sm">Overview of all calculated salaries and deductions.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-gray-50 p-2 rounded-xl border border-gray-100">
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
              className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm whitespace-nowrap"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              Edit Salaries
            </a>
          </div>
        </div>

        {/* Summary Table Content */}
        {records.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No records found for this period</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto p-2">We couldn't find any calculated salaries for {MONTHS[month - 1]} {year}. Start entering salaries first.</p>
            <a
              href={`/salary?month=${month}&year=${year}`}
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-sm"
            >
              Start Salary Entry
            </a>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SummaryTable employees={employees} records={records} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function SummaryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Initializing summary...</p>
        </div>
      }
    >
      <SummaryContent />
    </Suspense>
  );
}
