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
    <div className="flex items-center justify-between py-2 border-b border-gray-100">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        step={step}
        min={min}
        className="w-40 text-right px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
      className={`flex items-center justify-between py-2 border-b border-gray-100 ${
        highlight ? "bg-gray-50" : ""
      }`}
    >
      <span
        className={`text-sm ${highlight ? "font-bold text-gray-900" : "font-medium text-gray-500"}`}
      >
        {label}
      </span>
      <span
        className={`text-sm font-mono ${
          highlight
            ? "font-bold text-lg"
            : "text-gray-600"
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
}: SalaryFormProps) {
  return (
    <div className="space-y-6">
      {/* Save Status */}
      <div className="flex justify-end">
        {saving && (
          <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
            Saving...
          </span>
        )}
        {saved && !saving && (
          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
            Saved
          </span>
        )}
      </div>

      {/* Employee Info */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-blue-600 uppercase tracking-wide">
              Basic Pay
            </p>
            <p className="text-xl font-bold text-blue-900">
              {formatCurrency(employee.basic_pay)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-blue-600 uppercase tracking-wide">
              Shift Hours (OT Divisor)
            </p>
            <p className="text-xl font-bold text-blue-900">
              {employee.ot_divisor}h
            </p>
          </div>
        </div>
      </div>

      {/* EARNINGS SECTION */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-green-700 uppercase tracking-wide mb-3">
          Earnings
        </h3>

        <NumberInput
          label="Working Days"
          value={record.working_days}
          onChange={(v) => onUpdate({ working_days: v })}
        />

        <CalculatedField label="Daily Pay" value={calculated.daily_pay} />

        <CalculatedField
          label="Total Basic"
          value={employee.basic_pay}
        />

        <NumberInput
          label="ODT (Off-Duty Days Worked)"
          value={record.odt_days}
          onChange={(v) => onUpdate({ odt_days: v })}
          step="0.5"
        />

        <NumberInput
          label="O/T (Overtime Hours)"
          value={record.ot_hours}
          onChange={(v) => onUpdate({ ot_hours: v })}
          step="0.5"
        />

        <CalculatedField label="O/TIME (Overtime Pay)" value={calculated.ot_pay} />

        {/* Leave Pay Toggle */}
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <label className="text-sm font-medium text-gray-700">Leave Pay</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                onUpdate({ leave_pay_enabled: !record.leave_pay_enabled })
              }
              className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                record.leave_pay_enabled
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-gray-100 text-gray-500 border border-gray-300"
              }`}
            >
              {record.leave_pay_enabled ? "YES" : "NO"}
            </button>
            {record.leave_pay_enabled && (
              <input
                type="number"
                value={record.leave_pay_amount || ""}
                onChange={(e) =>
                  onUpdate({ leave_pay_amount: Number(e.target.value) || 0 })
                }
                className="w-28 text-right px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        </div>

        <CalculatedField label="O/D (Off-Duty Pay)" value={calculated.od_pay} />

        {/* Bonus Toggle */}
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <label className="text-sm font-medium text-gray-700">Bonus</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                onUpdate({ bonus_enabled: !record.bonus_enabled })
              }
              className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                record.bonus_enabled
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-gray-100 text-gray-500 border border-gray-300"
              }`}
            >
              {record.bonus_enabled ? "YES" : "NO"}
            </button>
            {record.bonus_enabled && (
              <input
                type="number"
                value={record.bonus_amount || ""}
                onChange={(e) =>
                  onUpdate({ bonus_amount: Number(e.target.value) || 0 })
                }
                className="w-28 text-right px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        </div>

        <CalculatedField
          label="GROSS PAY"
          value={calculated.gross_pay}
          highlight
        />
      </div>

      {/* DEDUCTIONS SECTION */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-red-700 uppercase tracking-wide mb-3">
          Deductions
        </h3>

        <NumberInput
          label="Absent (Days)"
          value={record.absent_days}
          onChange={(v) => onUpdate({ absent_days: v })}
          step="0.5"
        />

        <CalculatedField label="Absent Amount" value={calculated.absent_amount} />

        {/* Loan with paid toggle */}
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <label className="text-sm font-medium text-gray-700">Loan</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdate({ loan_paid: !record.loan_paid })}
              className={`px-2 py-1 text-xs rounded-full font-medium transition-colors ${
                record.loan_paid
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-red-50 text-red-600 border border-red-200"
              }`}
            >
              {record.loan_paid ? "PAID" : "UNPAID"}
            </button>
            <input
              type="number"
              value={record.loan_amount || ""}
              onChange={(e) =>
                onUpdate({ loan_amount: Number(e.target.value) || 0 })
              }
              className={`w-28 text-right px-3 py-1.5 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 ${
                record.loan_paid
                  ? "border-gray-200 bg-gray-50 text-gray-400 line-through"
                  : "border-gray-300"
              }`}
            />
          </div>
        </div>

        {/* Penalty with description */}
        <div className="py-2 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Penalty</label>
            <input
              type="number"
              value={record.penalty_amount || ""}
              onChange={(e) =>
                onUpdate({ penalty_amount: Number(e.target.value) || 0 })
              }
              placeholder="Amount"
              className="w-28 text-right px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {(record.penalty_amount > 0 || record.penalty_description) && (
            <input
              type="text"
              value={record.penalty_description}
              onChange={(e) =>
                onUpdate({ penalty_description: e.target.value })
              }
              placeholder="Reason for penalty..."
              className="mt-1 w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>

        {/* Sales Credit with item */}
        <div className="py-2 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Sales Cred
            </label>
            <input
              type="number"
              value={record.sales_cred_amount || ""}
              onChange={(e) =>
                onUpdate({ sales_cred_amount: Number(e.target.value) || 0 })
              }
              placeholder="Amount"
              className="w-28 text-right px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {(record.sales_cred_amount > 0 || record.sales_cred_item) && (
            <input
              type="text"
              value={record.sales_cred_item}
              onChange={(e) =>
                onUpdate({ sales_cred_item: e.target.value })
              }
              placeholder="Item name..."
              className="mt-1 w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>

        <NumberInput
          label="I.O.U"
          value={record.iou_amount}
          onChange={(v) => onUpdate({ iou_amount: v })}
        />

        <CalculatedField
          label="TOTAL DEDUCTIONS"
          value={calculated.total_deductions}
          highlight
        />
      </div>

      {/* NET PAY */}
      <div
        className={`rounded-lg p-6 text-center ${
          calculated.net_pay >= 0
            ? "bg-green-50 border-2 border-green-200"
            : "bg-red-50 border-2 border-red-200"
        }`}
      >
        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
          Net Pay
        </p>
        <p
          className={`text-3xl font-bold font-mono ${
            calculated.net_pay >= 0 ? "text-green-700" : "text-red-700"
          }`}
        >
          {formatCurrency(calculated.net_pay)}
        </p>
      </div>
    </div>
  );
}
