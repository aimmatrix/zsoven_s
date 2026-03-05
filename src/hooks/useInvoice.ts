import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Invoice, InvoiceItem } from '@/lib/types';

export function useInvoice(invoiceId: string | null) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!invoiceId) { setLoading(false); return; }

    const fetchData = async () => {
      setLoading(true);
      const [{ data: inv }, { data: itms }] = await Promise.all([
        supabase.from('invoices').select('*').eq('id', invoiceId).single(),
        supabase.from('invoice_items').select('*').eq('invoice_id', invoiceId).order('sort_order'),
      ]);
      if (inv) setInvoice({
        ...inv,
        subtotal: Number(inv.subtotal),
        tax_percent: Number(inv.tax_percent),
        tax_amount: Number(inv.tax_amount),
        total: Number(inv.total),
        amount_paid: Number(inv.amount_paid),
        balance_due: Number(inv.balance_due),
      });
      if (itms) setItems(itms.map((item: InvoiceItem) => ({
        ...item,
        qty: Number(item.qty),
        unit_cost: Number(item.unit_cost),
        total: Number(item.total),
      })));
      setLoading(false);
    };
    fetchData();
  }, [invoiceId]);

  return { invoice, items, loading };
}

export function useInvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });
    setInvoices((data || []).map((inv: Invoice) => ({
      ...inv,
      subtotal: Number(inv.subtotal),
      tax_percent: Number(inv.tax_percent),
      tax_amount: Number(inv.tax_amount),
      total: Number(inv.total),
      amount_paid: Number(inv.amount_paid),
      balance_due: Number(inv.balance_due),
    })));
    setLoading(false);
  };

  useEffect(() => { fetchInvoices(); }, []);

  return { invoices, loading, refetch: fetchInvoices };
}
