export interface Employee {
  id: string;
  name: string;
  basic_pay: number;
  working_days: number;
  ot_divisor: number;
  sort_order: number;
  is_active: boolean;
}

export interface SalaryRecord {
  id?: string;
  employee_id: string;
  month: number;
  year: number;
  working_days: number;

  // Earnings inputs
  odt_days: number;
  ot_hours: number;
  leave_pay_enabled: boolean;
  leave_pay_amount: number;
  bonus_enabled: boolean;
  bonus_amount: number;

  // Deduction inputs
  absent_days: number;
  loan_amount: number;
  loan_paid: boolean;
  penalty_description: string;
  penalty_amount: number;
  sales_cred_item: string;
  sales_cred_amount: number;
  iou_amount: number;
}

export interface CalculatedSalary {
  daily_pay: number;
  ot_pay: number;
  od_pay: number;
  leave_pay: number;
  bonus: number;
  gross_pay: number;
  absent_amount: number;
  total_deductions: number;
  net_pay: number;
}

export function defaultSalaryRecord(
  employeeId: string,
  month: number,
  year: number,
  workingDays: number
): SalaryRecord {
  return {
    employee_id: employeeId,
    month,
    year,
    working_days: workingDays,
    odt_days: 0,
    ot_hours: 0,
    leave_pay_enabled: false,
    leave_pay_amount: 5000,
    bonus_enabled: false,
    bonus_amount: 0,
    absent_days: 0,
    loan_amount: 0,
    loan_paid: false,
    penalty_description: "",
    penalty_amount: 0,
    sales_cred_item: "",
    sales_cred_amount: 0,
    iou_amount: 0,
  };
}
