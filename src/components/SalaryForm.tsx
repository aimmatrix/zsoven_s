"use client";

import { Employee, SalaryRecord, CalculatedSalary } from "@/lib/types";
import { calculateSalary, formatCurrency } from "@/lib/calculations";

interface SalaryFormProps {
  employee: Employee;
  record: SalaryRecord;
  calculated: CalculatedSalary;
  saving: boolean;
  saved: boolean;
  onUpdate: (updates: Partial<SalaryRecord>) => void;
  holidayUsedThisYear: number;
}

function NumberInput({
  label,
  value,
  onChange,
  step = "1",
  min = "0",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: string;
  min?: string;
}) {
  return (
    <div className="flex sm:items-center justify-between py-3 border-b border-gray-100 flex-col sm:flex-row gap-2 sm:gap-4">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        step={step}
        min={min}
        className="w-full sm:w-32 text-right px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
      />
    </div>
  );
}

function CalculatedField({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between py-3 border-b border-gray-100 ${highlight ? "bg-gray-50/80 -mx-4 px-4 rounded-lg my-1" : ""
        }`}
    >
      <span
        className={`text-sm ${highlight ? "font-bold text-gray-900 uppercase tracking-wide" : "font-medium text-gray-500"}`}
      >
        {label}
      </span>
      <span
        className={`text-sm font-mono ${highlight
            ? "font-bold text-lg"
            : "font-semibold text-gray-700"
          } ${value < 0 ? "text-red-600" : ""}`}
      >
        {formatCurrency(value)}
      </span>
    </div>
  );
}

export default function SalaryForm({
  employee,
  record,
  calculated,
  saving,
  saved,
  onUpdate,
  holidayUsedThisYear,
}: SalaryFormProps) {
  const holidayRemaining = employee.holiday_entitlement - holidayUsedThisYear;
  return (
    <div className="space-y-6">
      {/* Save Status Strip */}
      <div className="flex justify-end h-6">
        <div className="transition-opacity duration-300">
          {saving && (
            <span className="inline-flex items-center text-xs font-semibold text-yellow-700 bg-yellow-100 px-2.5 py-1 rounded-full">
              <svg className="animate-spin -ml-0.5 mr-1.5 h-3 w-3 text-yellow-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Auto-saving...
            </span>
          )}
          {saved && !saving && (
            <span className="inline-flex items-center text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              Saved
            </span>
          )}
        </div>
      </div>

      {/* Employee Context Widget */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">
              Base Salary
            </p>
            <p className="text-2xl font-extrabold text-blue-900 tracking-tight font-mono">
              {formatCurrency(employee.basic_pay)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">
              Standard Shift
            </p>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-sm font-bold">
              <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {employee.ot_divisor} hrs
            </div>
          </div>
        </div>
      </div>

      {/* EARNINGS SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
        <div className="p-5 sm:p-6">
          <div className="flex items-center mb-4">
            <div className="p-1.5 bg-green-100 rounded-lg mr-2.5">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            </div>
            <h3 className="text-base font-bold text-gray-900 tracking-tight">
              Earnings
            </h3>
          </div>

          <div className="space-y-1">
            <NumberInput
              label="Working Days"
              value={record.working_days}
              onChange={(v) => onUpdate({ working_days: v })}
            />

            <CalculatedField label="Daily Pay Rate" value={calculated.daily_pay} />
            <CalculatedField label="Total Basic Earnings" value={employee.basic_pay} />

            <NumberInput
              label="ODT (Off-Duty Days)"
              value={record.odt_days}
              onChange={(v) => onUpdate({ odt_days: v })}
              step="0.5"
            />

            <NumberInput
              label="Overtime (Hours)"
              value={record.ot_hours}
              onChange={(v) => onUpdate({ ot_hours: v })}
              step="0.5"
            />

            <CalculatedField label="Overtime Pay" value={calculated.ot_pay} />

            {/* Leave Pay Toggle */}
            <div className="flex sm:items-center justify-between py-3 border-b border-gray-100 flex-col sm:flex-row gap-3">
              <label className="text-sm font-semibold text-gray-700">Leave Pay</label>
              <div className="flex items-center justify-end w-full sm:w-auto gap-3">
                <button
                  onClick={() => onUpdate({ leave_pay_enabled: !record.leave_pay_enabled })}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${record.leave_pay_enabled ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  role="switch"
                  aria-checked={record.leave_pay_enabled}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${record.leave_pay_enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                  />
                </button>
                {record.leave_pay_enabled && (
                  <input
                    type="number"
                    value={record.leave_pay_amount || ""}
                    onChange={(e) => onUpdate({ leave_pay_amount: Number(e.target.value) || 0 })}
                    className="w-24 sm:w-28 text-right px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-sm font-semibold text-green-900 focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="0.00"
                  />
                )}
              </div>
            </div>

            <CalculatedField label="Off-Duty Pay" value={calculated.od_pay} />

            {/* Bonus Toggle */}
            <div className="flex sm:items-center justify-between py-3 border-b border-gray-100 flex-col sm:flex-row gap-3">
              <label className="text-sm font-semibold text-gray-700">Bonus</label>
              <div className="flex items-center justify-end w-full sm:w-auto gap-3">
                <button
                  onClick={() => onUpdate({ bonus_enabled: !record.bonus_enabled })}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${record.bonus_enabled ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  role="switch"
                  aria-checked={record.bonus_enabled}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${record.bonus_enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                  />
                </button>
                {record.bonus_enabled && (
                  <input
                    type="number"
                    value={record.bonus_amount || ""}
                    onChange={(e) => onUpdate({ bonus_amount: Number(e.target.value) || 0 })}
                    className="w-24 sm:w-28 text-right px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-sm font-semibold text-green-900 focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="0.00"
                  />
                )}
              </div>
            </div>

            <div className="pt-2">
              <CalculatedField label="GROSS PAY" value={calculated.gross_pay} highlight />
            </div>
          </div>
        </div>
      </div>

      {/* HOLIDAY TRACKING SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
        <div className="p-5 sm:p-6">
          <div className="flex items-center mb-4">
            <div className="p-1.5 bg-purple-100 rounded-lg mr-2.5">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="text-base font-bold text-gray-900 tracking-tight">
              Holiday Tracking
            </h3>
          </div>

          <div className="space-y-1">
            <NumberInput
              label="Holiday Days This Month"
              value={record.holiday_days_taken}
              onChange={(v) => onUpdate({ holiday_days_taken: v })}
              step="0.5"
            />

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-500">Used This Year</span>
              <span className="text-sm font-mono font-semibold text-purple-700">
                {holidayUsedThisYear} / {employee.holiday_entitlement} days
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-500">Remaining</span>
              <span className={`text-sm font-mono font-bold ${holidayRemaining > 0 ? "text-green-700" : holidayRemaining === 0 ? "text-gray-700" : "text-red-600"}`}>
                {holidayRemaining} days
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* DEDUCTIONS SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
        <div className="p-5 sm:p-6">
          <div className="flex items-center mb-4">
            <div className="p-1.5 bg-red-100 rounded-lg mr-2.5">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" /></svg>
            </div>
            <h3 className="text-base font-bold text-gray-900 tracking-tight">
              Deductions
            </h3>
          </div>

          <div className="space-y-1">
            <NumberInput
              label="Absent (Days)"
              value={record.absent_days}
              onChange={(v) => onUpdate({ absent_days: v })}
              step="0.5"
            />

            <CalculatedField label="Absent Deduction" value={calculated.absent_amount} />

            {/* Loan Toggle */}
            <div className="flex sm:items-center justify-between py-3 border-b border-gray-100 flex-col sm:flex-row gap-3">
              <label className="text-sm font-semibold text-gray-700">Loan Repayment</label>
              <div className="flex items-center justify-end w-full sm:w-auto gap-3">
                <button
                  onClick={() => onUpdate({ loan_paid: !record.loan_paid })}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${record.loan_paid
                      ? "bg-gray-100 text-gray-400 border border-gray-200"
                      : "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                    }`}
                >
                  {record.loan_paid ? "PAID" : "UNPAID"}
                </button>
                <input
                  type="number"
                  value={record.loan_amount || ""}
                  onChange={(e) => onUpdate({ loan_amount: Number(e.target.value) || 0 })}
                  className={`w-28 text-right px-3 py-1.5 border rounded-lg text-sm font-semibold transition-colors focus:ring-2 focus:ring-blue-500 outline-none ${record.loan_paid
                      ? "border-gray-100 bg-gray-50 text-gray-400 line-through"
                      : "border-gray-200 bg-gray-50 text-gray-900"
                    }`}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Penalty */}
            <div className="py-3 border-b border-gray-100">
              <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-2">
                <label className="text-sm font-semibold text-gray-700">Penalty</label>
                <input
                  type="number"
                  value={record.penalty_amount || ""}
                  onChange={(e) => onUpdate({ penalty_amount: Number(e.target.value) || 0 })}
                  placeholder="0.00"
                  className="w-full sm:w-32 text-right px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              {(record.penalty_amount > 0 || record.penalty_description) && (
                <div className="mt-2.5 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </span>
                  <input
                    type="text"
                    value={record.penalty_description || ""}
                    onChange={(e) => onUpdate({ penalty_description: e.target.value })}
                    placeholder="Reason for penalty..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              )}
            </div>

            {/* Sales Credit */}
            <div className="py-3 border-b border-gray-100">
              <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-2">
                <label className="text-sm font-semibold text-gray-700">Sales Credit</label>
                <input
                  type="number"
                  value={record.sales_cred_amount || ""}
                  onChange={(e) => onUpdate({ sales_cred_amount: Number(e.target.value) || 0 })}
                  placeholder="0.00"
                  className="w-full sm:w-32 text-right px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              {(record.sales_cred_amount > 0 || record.sales_cred_item) && (
                <div className="mt-2.5 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                  </span>
                  <input
                    type="text"
                    value={record.sales_cred_item || ""}
                    onChange={(e) => onUpdate({ sales_cred_item: e.target.value })}
                    placeholder="Item purchased..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              )}
            </div>

            <NumberInput
              label="I.O.U"
              value={record.iou_amount}
              onChange={(v) => onUpdate({ iou_amount: v })}
            />

            <div className="pt-2">
              <CalculatedField
                label="TOTAL DEDUCTIONS"
                value={calculated.total_deductions}
                highlight
              />
            </div>
          </div>
        </div>
      </div>

      {/* NET PAY */}
      <div
        className={`rounded-2xl p-6 sm:p-8 text-center shadow-lg relative overflow-hidden ${calculated.net_pay >= 0
            ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white border-none"
            : "bg-gradient-to-br from-red-500 to-rose-600 text-white border-none"
          }`}
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>

        <p className="text-sm uppercase tracking-widest text-white/80 mb-2 font-bold font-sans">
          Final Net Pay
        </p>
        <p className="text-4xl sm:text-5xl font-black font-mono tracking-tight drop-shadow-md">
          {formatCurrency(calculated.net_pay)}
        </p>
      </div>
    </div>
  );
}
