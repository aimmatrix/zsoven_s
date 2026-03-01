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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading employees...</p>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No employees found.</p>
          <p className="text-sm text-gray-400">
            Run the seed SQL in your Supabase dashboard first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <a
            href="/"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            &larr; Home
          </a>
          <MonthYearPicker
            month={month}
            year={year}
            onChange={handleMonthYearChange}
          />
        </div>

        {/* Employee Navigation */}
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
            <div className="text-center py-12 text-gray-400">
              Loading salary data...
            </div>
          ) : currentEmployee && record && calculated ? (
            <SalaryForm
              employee={currentEmployee}
              record={record}
              calculated={calculated}
              saving={saving}
              saved={saved}
              onUpdate={updateRecord}
            />
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
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      }
    >
      <SalaryPageContent />
    </Suspense>
  );
}
