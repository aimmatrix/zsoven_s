"use client";

import { Employee } from "@/lib/types";

interface EmployeeNavProps {
  employees: Employee[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  onSaveAndNext: () => void;
  isLast: boolean;
}

export default function EmployeeNav({
  employees,
  currentIndex,
  onNavigate,
  onSaveAndNext,
  isLast,
}: EmployeeNavProps) {
  const current = employees[currentIndex];
  if (!current) return null;

  return (
    <div className="space-y-4">
      {/* Employee Name + Position */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">{current.name}</h1>
        <p className="text-sm text-gray-500">
          {currentIndex + 1} of {employees.length}
        </p>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => onNavigate(currentIndex - 1)}
          disabled={currentIndex === 0}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          &larr; Prev
        </button>

        <select
          value={currentIndex}
          onChange={(e) => onNavigate(Number(e.target.value))}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {employees.map((emp, i) => (
            <option key={emp.id} value={i}>
              {emp.name}
            </option>
          ))}
        </select>

        <button
          onClick={() => onNavigate(currentIndex + 1)}
          disabled={currentIndex === employees.length - 1}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Next &rarr;
        </button>
      </div>

      {/* Save & Next Button */}
      <button
        onClick={onSaveAndNext}
        className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm"
      >
        {isLast ? "Save & View Summary" : "Save & Next Employee \u2192"}
      </button>
    </div>
  );
}
