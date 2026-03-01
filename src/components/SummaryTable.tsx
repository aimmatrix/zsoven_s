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
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-3 px-2 font-medium text-gray-500">#</th>
            <th className="text-left py-3 px-2 font-medium text-gray-500">Name</th>
            <th className="text-right py-3 px-2 font-medium text-gray-500">Basic</th>
            <th className="text-right py-3 px-2 font-medium text-gray-500">O/TIME</th>
            <th className="text-right py-3 px-2 font-medium text-gray-500">O/D</th>
            <th className="text-right py-3 px-2 font-medium text-gray-500">Gross</th>
            <th className="text-right py-3 px-2 font-medium text-gray-500">Deductions</th>
            <th className="text-right py-3 px-2 font-medium text-gray-500">Net Pay</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ employee, calculated }, i) => (
            <tr
              key={employee.id}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              <td className="py-2 px-2 text-gray-400">{i + 1}</td>
              <td className="py-2 px-2 font-medium text-gray-900">
                {employee.name}
              </td>
              {calculated ? (
                <>
                  <td className="py-2 px-2 text-right font-mono">
                    {formatCurrency(employee.basic_pay)}
                  </td>
                  <td className="py-2 px-2 text-right font-mono">
                    {formatCurrency(calculated.ot_pay)}
                  </td>
                  <td className="py-2 px-2 text-right font-mono">
                    {formatCurrency(calculated.od_pay)}
                  </td>
                  <td className="py-2 px-2 text-right font-mono">
                    {formatCurrency(calculated.gross_pay)}
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-red-600">
                    {formatCurrency(calculated.total_deductions)}
                  </td>
                  <td
                    className={`py-2 px-2 text-right font-mono font-bold ${
                      calculated.net_pay >= 0 ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {formatCurrency(calculated.net_pay)}
                  </td>
                </>
              ) : (
                <td colSpan={6} className="py-2 px-2 text-center text-gray-400">
                  No data
                </td>
              )}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-300 bg-gray-50">
            <td colSpan={5} className="py-3 px-2 font-bold text-gray-700">
              TOTAL
            </td>
            <td className="py-3 px-2 text-right font-mono font-bold">
              {formatCurrency(totalGross)}
            </td>
            <td></td>
            <td className="py-3 px-2 text-right font-mono font-bold text-green-700">
              {formatCurrency(totalNet)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
