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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-5 relative overflow-hidden">
      {/* Subtle indicator strip */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>

      {/* Employee Name + Position */}
      <div className="text-center pt-2">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{current.name}</h1>
        <div className="inline-flex items-center justify-center mt-1.5 px-3 py-1 bg-gray-50 border border-gray-200 rounded-full">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
            {currentIndex + 1} of {employees.length}
          </p>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-3 bg-gray-50 p-2 rounded-xl border border-gray-100">
        <button
          onClick={() => onNavigate(currentIndex - 1)}
          disabled={currentIndex === 0}
          className="flex-shrink-0 flex items-center justify-center h-10 w-10 sm:w-auto sm:px-4 text-sm font-bold rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
          title="Previous Employee"
        >
          <svg className="w-4 h-4 sm:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          <span className="hidden sm:inline">Prev</span>
        </button>

        <div className="relative flex-1 max-w-[200px]">
          <select
            value={currentIndex}
            onChange={(e) => onNavigate(Number(e.target.value))}
            className="w-full pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none outline-none shadow-sm"
          >
            {employees.map((emp, i) => (
              <option key={emp.id} value={i}>
                {emp.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
          </div>
        </div>

        <button
          onClick={() => onNavigate(currentIndex + 1)}
          disabled={currentIndex === employees.length - 1}
          className="flex-shrink-0 flex items-center justify-center h-10 w-10 sm:w-auto sm:px-4 text-sm font-bold rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
          title="Next Employee"
        >
          <span className="hidden sm:inline">Next</span>
          <svg className="w-4 h-4 sm:ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      {/* Save & Next Button */}
      <button
        onClick={onSaveAndNext}
        className={`w-full py-3.5 px-4 font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 ${isLast
            ? "bg-green-600 hover:bg-green-700 text-white focus:ring-4 focus:ring-green-100 shadow-green-200"
            : "bg-blue-600 hover:bg-blue-700 text-white focus:ring-4 focus:ring-blue-100 shadow-blue-200"
          }`}
      >
        <span>{isLast ? "Save & View Summary" : "Save & Next Employee"}</span>
        {!isLast && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
        {isLast && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
      </button>
    </div>
  );
}
