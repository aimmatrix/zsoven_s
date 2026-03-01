import { Employee, SalaryRecord, CalculatedSalary } from "./types";

export function calculateSalary(
  employee: Employee,
  record: SalaryRecord
): CalculatedSalary {
  const workingDays = record.working_days;
  const basicPay = employee.basic_pay;

  // Daily Pay = Basic Pay / Working Days
  const daily_pay = workingDays > 0 ? basicPay / workingDays : 0;

  // O/TIME = (Basic Pay / Working Days / OT Divisor) * OT Hours
  // OT Divisor = hours per shift (varies per employee)
  const ot_rate =
    workingDays > 0 && employee.ot_divisor > 0
      ? basicPay / workingDays / employee.ot_divisor
      : 0;
  const ot_pay = ot_rate * record.ot_hours;

  // O/D = ODT Days * Daily Pay
  const od_pay = record.odt_days * daily_pay;

  // Leave Pay: if enabled, use the amount; otherwise 0
  const leave_pay = record.leave_pay_enabled ? record.leave_pay_amount : 0;

  // Bonus: if enabled, use the amount; otherwise 0
  const bonus = record.bonus_enabled ? record.bonus_amount : 0;

  // Gross Pay = Basic + OT + Leave + O/D + Bonus
  const gross_pay = basicPay + ot_pay + leave_pay + od_pay + bonus;

  // Absent Amount = Absent Days * Daily Pay
  const absent_amount = record.absent_days * daily_pay;

  // Loan: only deduct if NOT marked as paid
  const loan_deduction = record.loan_paid ? 0 : record.loan_amount;

  // Total Deductions = Absent Amount + Loan + Penalty + Sales Cred + IOU
  const total_deductions =
    absent_amount +
    loan_deduction +
    record.penalty_amount +
    record.sales_cred_amount +
    record.iou_amount;

  // Net Pay = Gross - Deductions
  const net_pay = gross_pay - total_deductions;

  return {
    daily_pay: round2(daily_pay),
    ot_pay: round2(ot_pay),
    od_pay: round2(od_pay),
    leave_pay: round2(leave_pay),
    bonus: round2(bonus),
    gross_pay: round2(gross_pay),
    absent_amount: round2(absent_amount),
    total_deductions: round2(total_deductions),
    net_pay: round2(net_pay),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
