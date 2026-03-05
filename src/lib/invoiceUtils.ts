import { supabase } from './supabase';

export async function generateInvoiceNumber(): Promise<string> {
  const now = new Date();
  const prefix = `INV${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}`;

  const { count } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .like('invoice_number', `${prefix}%`);

  const sequence = String((count ?? 0) + 1).padStart(2, '0');
  return `${prefix}${sequence}`;
}

export function formatNaira(amount: number): string {
  return '\u20A6' + new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
