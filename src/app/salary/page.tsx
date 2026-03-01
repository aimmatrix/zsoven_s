"use client";

import { useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEmployees } from "@/hooks/useEmployees";
import { useSalaryRecord } from "@/hooks/useSalaryRecord";
import { calculateSalary } from "@/lib/calculations";
import SalaryForm from "@/components/SalaryForm";
import EmployeeNav from "@/components/EmployeeNav";
import MonthYearPicker from "@/components/MonthYearPicker";
import { Suspense } from "react";

function SalaryPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const now = new Date();
  const [month, setMonth] = useState(
    Number(searchParams.get("month")) || now.getMonth() + 1
  );
  const [year, setYear] = useState(
    Number(searchParams.get("year")) || now.getFullYear()
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  const { employees, loading: empLoading } = useEmployees();
  const currentEmployee = employees[currentIndex] || null;

  const { record, loading: recLoading, saving, saved, updateRecord, saveNow } =
    useSalaryRecord(
      currentEmployee?.id || null,
      month,
      year,
      currentEmployee?.working_days || 26
    );

  const calculated =
    currentEmployee && record
      ? calculateSalary(currentEmployee, record)
      : null;

  const handleNavigate = useCallback(
    async (newIndex: number) => {
      if (newIndex < 0 || newIndex >= employees.length) return;
      await saveNow();
      setCurrentIndex(newIndex);
    },
    [employees.length, saveNow]
  );

  const handleSaveAndNext = useCallback(async () => {
    await saveNow();
    if (currentIndex < employees.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      router.push(`/summary?month=${month}&year=${year}`);
    }
  }, [saveNow, currentIndex, employees.length, router, month, year]);

  const handleMonthYearChange = useCallback(
    async (newMonth: number, newYear: number) => {
      await saveNow();
      setMonth(newMonth);
      setYear(newYear);
      setCurrentIndex(0);
    },
    [saveNow]
  );

  if (empLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 font-medium">Loading employee data...</p>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-sm bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <p className="text-xl font-bold text-gray-900 mb-2">No employees found</p>
          <p className="text-sm text-gray-500 mb-6">
            You need to add employees before calculating salaries.
          </p>
          <button
            onClick={() => router.push("/employees")}
            className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Go to Manage Staff
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-12">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <a
            href="/"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg w-fit"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Dashboard
          </a>
          <div className="hidden sm:block">
            <MonthYearPicker
              month={month}
              year={year}
              onChange={handleMonthYearChange}
            />
          </div>
          <div className="block sm:hidden grid grid-cols-2 gap-2 mt-2">
            <div className="w-full">
              <MonthYearPicker
                month={month}
                year={year}
                onChange={handleMonthYearChange}
              />
            </div>
          </div>
        </div>

        {/* Top Navigation */}
        <EmployeeNav
          employees={employees}
          currentIndex={currentIndex}
          onNavigate={handleNavigate}
          onSaveAndNext={handleSaveAndNext}
          isLast={currentIndex === employees.length - 1}
        />

        {/* Salary Form */}
        <div className="mt-6">
          {recLoading ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center animate-pulse">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500 font-medium">Loading records...</p>
            </div>
          ) : currentEmployee && record && calculated ? (
            <div className="transition-all duration-300">
              <SalaryForm
                employee={currentEmployee}
                record={record}
                calculated={calculated}
                saving={saving}
                saved={saved}
                onUpdate={updateRecord}
              />
            </div>
          ) : null}
        </div>

        {/* Bottom Navigation */}
        <div className="mt-6 pb-8">
          <EmployeeNav
            employees={employees}
            currentIndex={currentIndex}
            onNavigate={handleNavigate}
            onSaveAndNext={handleSaveAndNext}
            isLast={currentIndex === employees.length - 1}
          />
        </div>
      </div>
    </div>
  );
}

export default function SalaryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Initializing...</p>
        </div>
      }
    >
      <SalaryPageContent />
    </Suspense>
  );
}
