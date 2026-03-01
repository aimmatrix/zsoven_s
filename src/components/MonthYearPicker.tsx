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
    <div className="flex items-center gap-3">
      <select
        value={month}
        onChange={(e) => onChange(Number(e.target.value), year)}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
      >
        {MONTHS.map((name, i) => (
          <option key={i + 1} value={i + 1}>
            {name}
          </option>
        ))}
      </select>

      <select
        value={year}
        onChange={(e) => onChange(month, Number(e.target.value))}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
      >
        {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
