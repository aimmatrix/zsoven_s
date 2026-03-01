"use client";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface MonthYearPickerProps {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
}

export default function MonthYearPicker({
  month,
  year,
  onChange,
}: MonthYearPickerProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <select
          value={month}
          onChange={(e) => onChange(Number(e.target.value), year)}
          className="pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none transition-colors hover:bg-white"
        >
          {MONTHS.map((name, i) => (
            <option key={i + 1} value={i + 1}>
              {name.substring(0, 3)}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>

      <div className="relative">
        <select
          value={year}
          onChange={(e) => onChange(month, Number(e.target.value))}
          className="pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none transition-colors hover:bg-white"
        >
          {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
    </div>
  );
}
