"use client";

import { Employee, SalaryRecord, CalculatedSalary } from "@/lib/types";
import { calculateSalary, formatCurrency } from "@/lib/calculations";

interface SummaryTableProps {
  employees: Employee[];
  records: SalaryRecord[];
}

export default function SummaryTable({ employees, records }: SummaryTableProps) {
  const getRecord = (empId: string) =>
    records.find((r) => r.employee_id === empId);

  let totalNet = 0;
  let totalGross = 0;

  const rows = employees.map((emp) => {
    const record = getRecord(emp.id);
    if (!record) {
      return { employee: emp, calculated: null };
    }
    const calculated = calculateSalary(emp, record);
    totalNet += calculated.net_pay;
    totalGross += calculated.gross_pay;
    return { employee: emp, calculated };
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-700 font-semibold uppercase tracking-wider text-xs border-b border-gray-200">
          <tr>
            <th className="py-4 px-4 whitespace-nowrap">#</th>
            <th className="py-4 px-4 whitespace-nowrap">Name</th>
            <th className="py-4 px-4 text-right whitespace-nowrap">Basic Pay</th>
            <th className="py-4 px-4 text-right whitespace-nowrap">O/TIME</th>
            <th className="py-4 px-4 text-right whitespace-nowrap">O/D Pay</th>
            <th className="py-4 px-4 text-right whitespace-nowrap text-gray-900 font-bold">Gross Pay</th>
            <th className="py-4 px-4 text-right whitespace-nowrap">Deductions</th>
            <th className="py-4 px-4 text-right whitespace-nowrap text-blue-900 font-bold">Net Pay</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map(({ employee, calculated }, i) => (
            <tr
              key={employee.id}
              className="hover:bg-blue-50/50 transition-colors duration-150 group"
            >
              <td className="py-3.5 px-4 text-gray-400 font-medium">{i + 1}</td>
              <td className="py-3.5 px-4 font-bold text-gray-900">
                {employee.name}
              </td>
              {calculated ? (
                <>
                  <td className="py-3.5 px-4 text-right font-mono text-gray-600">
                    {formatCurrency(employee.basic_pay)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-gray-600">
                    {formatCurrency(calculated.ot_pay)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-gray-600">
                    {formatCurrency(calculated.od_pay)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900">
                    {formatCurrency(calculated.gross_pay)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-medium text-red-600">
                    {formatCurrency(calculated.total_deductions)}
                  </td>
                  <td
                    className={`py-3.5 px-4 text-right font-mono font-bold ${calculated.net_pay >= 0 ? "text-green-700 bg-green-50/30 group-hover:bg-green-100/50" : "text-red-700 bg-red-50/30 group-hover:bg-red-100/50"
                      }`}
                  >
                    {formatCurrency(calculated.net_pay)}
                  </td>
                </>
              ) : (
                <td colSpan={6} className="py-3.5 px-4 text-center text-gray-400 italic">
                  No salary record
                </td>
              )}
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-200">
          <tr>
            <td colSpan={5} className="py-4 px-4 text-right font-extrabold text-gray-900 uppercase tracking-widest text-xs">
              Total Payroll
            </td>
            <td className="py-4 px-4 text-right font-mono font-bold text-gray-900 bg-gray-200/50">
              {formatCurrency(totalGross)}
            </td>
            <td className="bg-gray-200/50"></td>
            <td className="py-4 px-4 text-right font-mono font-black text-blue-700 bg-blue-100/30 text-base">
              {formatCurrency(totalNet)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
