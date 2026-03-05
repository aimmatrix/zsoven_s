export interface Employee {
  id: string;
  name: string;
  basic_pay: number;
  working_days: number;
  ot_divisor: number;
  holiday_entitlement: number;
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

  // Holiday tracking
  holiday_days_taken: number;

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

// ===== Invoice Types =====

export interface Invoice {
  id?: string;
  invoice_number: string;
  type: 'single' | 'multi_day';
  business_name: string;
  business_address: string;
  business_phone: string;
  business_email: string;
  bill_to_name: string;
  bill_to_address: string;
  bill_to_phone: string;
  po_number: string;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  tax_percent: number;
  tax_amount: number;
  total: number;
  amount_paid: number;
  balance_due: number;
  payment_bank_name: string;
  payment_account_number: string;
  payment_account_name: string;
  notes: string;
  signature_name: string;
  created_at?: string;
  updated_at?: string;
}

export interface InvoiceItem {
  id?: string;
  invoice_id?: string;
  sort_order: number;
  day_label: string | null;
  item_name: string;
  description: string;
  qty: number;
  unit_cost: number;
  total: number;
}

export function defaultInvoice(): Invoice {
  return {
    invoice_number: '',
    type: 'single',
    business_name: "Z's Oven",
    business_address: '7 b rimi drive unguwar rimi',
    business_phone: '07037050919',
    business_email: 'zsoven22@gmail.com',
    bill_to_name: '',
    bill_to_address: '',
    bill_to_phone: '',
    po_number: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    subtotal: 0,
    tax_percent: 0,
    tax_amount: 0,
    total: 0,
    amount_paid: 0,
    balance_due: 0,
    payment_bank_name: '',
    payment_account_number: '',
    payment_account_name: '',
    notes: 'Thank you for the patronage',
    signature_name: "Z's Oven",
  };
}

export function defaultInvoiceItem(sortOrder: number, dayLabel: string | null = null): InvoiceItem {
  return {
    sort_order: sortOrder,
    day_label: dayLabel,
    item_name: '',
    description: '',
    qty: 1,
    unit_cost: 0,
    total: 0,
  };
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
    holiday_days_taken: 0,
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
