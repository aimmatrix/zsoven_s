"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Invoice, InvoiceItem, defaultInvoice, defaultInvoiceItem } from "@/lib/types";
import { generateInvoiceNumber, formatNaira } from "@/lib/invoiceUtils";

function InvoiceFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [invoice, setInvoice] = useState<Invoice>(defaultInvoice());
  const [items, setItems] = useState<InvoiceItem[]>([defaultInvoiceItem(0)]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!editId);

  // Load existing invoice for editing
  useEffect(() => {
    if (!editId) {
      generateInvoiceNumber().then((num) =>
        setInvoice((prev) => ({ ...prev, invoice_number: num }))
      );
      return;
    }

    const fetchInvoice = async () => {
      setLoading(true);
      const [{ data: inv }, { data: itms }] = await Promise.all([
        supabase.from("invoices").select("*").eq("id", editId).single(),
        supabase.from("invoice_items").select("*").eq("invoice_id", editId).order("sort_order"),
      ]);
      if (inv) {
        setInvoice({
          ...inv,
          subtotal: Number(inv.subtotal),
          tax_percent: Number(inv.tax_percent),
          tax_amount: Number(inv.tax_amount),
          total: Number(inv.total),
          amount_paid: Number(inv.amount_paid),
          balance_due: Number(inv.balance_due),
        });
      }
      if (itms && itms.length > 0) {
        setItems(
          itms.map((item: InvoiceItem) => ({
            ...item,
            qty: Number(item.qty),
            unit_cost: Number(item.unit_cost),
            total: Number(item.total),
          }))
        );
      }
      setLoading(false);
    };
    fetchInvoice();
  }, [editId]);

  // Auto-recalculate totals
  useEffect(() => {
    const subtotal = items.reduce((sum, item) => sum + item.qty * item.unit_cost, 0);
    const taxAmount = subtotal * (invoice.tax_percent / 100);
    const total = subtotal + taxAmount;
    const balanceDue = total - invoice.amount_paid;
    setInvoice((prev) => ({
      ...prev,
      subtotal,
      tax_amount: taxAmount,
      total,
      balance_due: balanceDue,
    }));
  }, [items, invoice.tax_percent, invoice.amount_paid]);

  const updateInvoice = (field: keyof Invoice, value: string | number) => {
    setInvoice((prev) => ({ ...prev, [field]: value }));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };
      if (field === "qty" || field === "unit_cost") {
        item.total = Number(item.qty) * Number(item.unit_cost);
      }
      updated[index] = item;
      return updated;
    });
  };

  const addItem = (dayLabel: string | null = null) => {
    setItems((prev) => [...prev, defaultInvoiceItem(prev.length, dayLabel)]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Multi-day helpers
  const getDays = (): string[] => {
    const days = new Set<string>();
    items.forEach((item) => {
      if (item.day_label) days.add(item.day_label);
    });
    return Array.from(days);
  };

  const addDay = () => {
    const dayNum = getDays().length + 1;
    const label = `Day ${dayNum}`;
    addItem(label);
  };

  const removeDay = (dayLabel: string) => {
    setItems((prev) => {
      const filtered = prev.filter((item) => item.day_label !== dayLabel);
      return filtered.length > 0 ? filtered : [defaultInvoiceItem(0, "Day 1")];
    });
  };

  const switchType = (type: "single" | "multi_day") => {
    setInvoice((prev) => ({ ...prev, type }));
    if (type === "multi_day" && getDays().length === 0) {
      setItems([defaultInvoiceItem(0, "Day 1")]);
    } else if (type === "single") {
      setItems((prev) => prev.map((item) => ({ ...item, day_label: null })));
    }
  };

  const handleSave = async () => {
    if (!invoice.bill_to_name.trim()) {
      alert("Please enter a client name (Bill To).");
      return;
    }
    if (items.every((item) => !item.item_name.trim())) {
      alert("Please add at least one item.");
      return;
    }

    setSaving(true);

    try {
      const invoiceData = {
        invoice_number: invoice.invoice_number,
        type: invoice.type,
        business_name: invoice.business_name,
        business_address: invoice.business_address,
        business_phone: invoice.business_phone,
        business_email: invoice.business_email,
        bill_to_name: invoice.bill_to_name,
        bill_to_address: invoice.bill_to_address,
        bill_to_phone: invoice.bill_to_phone,
        po_number: invoice.po_number,
        invoice_date: invoice.invoice_date,
        due_date: invoice.due_date || null,
        subtotal: invoice.subtotal,
        tax_percent: invoice.tax_percent,
        tax_amount: invoice.tax_amount,
        total: invoice.total,
        amount_paid: invoice.amount_paid,
        balance_due: invoice.balance_due,
        payment_bank_name: invoice.payment_bank_name,
        payment_account_number: invoice.payment_account_number,
        payment_account_name: invoice.payment_account_name,
        notes: invoice.notes,
        signature_name: invoice.signature_name,
      };

      let invoiceId = editId;

      if (editId) {
        const { error: updateError } = await supabase.from("invoices").update(invoiceData).eq("id", editId);
        if (updateError) throw new Error(`Update failed: ${updateError.message}`);
        const { error: deleteError } = await supabase.from("invoice_items").delete().eq("invoice_id", editId);
        if (deleteError) throw new Error(`Delete items failed: ${deleteError.message}`);
      } else {
        const { data, error: insertError } = await supabase.from("invoices").insert(invoiceData).select("id").single();
        if (insertError) throw new Error(`Insert failed: ${insertError.message}`);
        invoiceId = data?.id;
      }

      if (!invoiceId) {
        throw new Error("No invoice ID returned after save.");
      }

      const itemsData = items
        .filter((item) => item.item_name.trim())
        .map((item, i) => ({
          invoice_id: invoiceId,
          sort_order: i,
          day_label: item.day_label,
          item_name: item.item_name,
          description: item.description,
          qty: item.qty,
          unit_cost: item.unit_cost,
          total: item.qty * item.unit_cost,
        }));

      if (itemsData.length > 0) {
        const { error: itemsError } = await supabase.from("invoice_items").insert(itemsData);
        if (itemsError) throw new Error(`Insert items failed: ${itemsError.message}`);
      }

      router.push(`/invoice/${invoiceId}`);
    } catch (err) {
      console.error("Save error:", err);
      alert(err instanceof Error ? err.message : "Failed to save invoice. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 font-medium">Loading invoice...</p>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none text-sm";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-12">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <a href="/invoice" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors mb-3">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Invoices
          </a>
          <h1 className="text-2xl font-extrabold text-gray-900">{editId ? "Edit Invoice" : "Create Invoice"}</h1>
        </div>

        {/* Invoice Type Toggle */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
          <label className={labelClass}>Invoice Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => switchType("single")}
              className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${invoice.type === "single" ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200" : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"}`}
            >
              One-time
            </button>
            <button
              onClick={() => switchType("multi_day")}
              className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${invoice.type === "multi_day" ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200" : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"}`}
            >
              Multi-day
            </button>
          </div>
        </div>

        {/* Business Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
          <h2 className="text-base font-bold text-gray-900 mb-4">Business Details</h2>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Business Name</label>
              <input className={inputClass} value={invoice.business_name} onChange={(e) => updateInvoice("business_name", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Address</label>
              <input className={inputClass} value={invoice.business_address} onChange={(e) => updateInvoice("business_address", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Phone</label>
                <input className={inputClass} value={invoice.business_phone} onChange={(e) => updateInvoice("business_phone", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input className={inputClass} value={invoice.business_email} onChange={(e) => updateInvoice("business_email", e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <h2 className="text-base font-bold text-gray-900 mb-4">Invoice Details</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Invoice #</label>
                <input className={`${inputClass} bg-gray-100`} value={invoice.invoice_number} readOnly />
              </div>
              <div>
                <label className={labelClass}>PO Number</label>
                <input className={inputClass} value={invoice.po_number} onChange={(e) => updateInvoice("po_number", e.target.value)} placeholder="Optional" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Invoice Date</label>
                <input type="date" className={inputClass} value={invoice.invoice_date} onChange={(e) => updateInvoice("invoice_date", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Due Date</label>
                <input type="date" className={inputClass} value={invoice.due_date} onChange={(e) => updateInvoice("due_date", e.target.value)} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Bill To (Client Name)</label>
              <input className={inputClass} value={invoice.bill_to_name} onChange={(e) => updateInvoice("bill_to_name", e.target.value)} placeholder="Client or company name" />
            </div>
            <div>
              <label className={labelClass}>Client Address</label>
              <input className={inputClass} value={invoice.bill_to_address} onChange={(e) => updateInvoice("bill_to_address", e.target.value)} placeholder="Optional" />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
          <h2 className="text-base font-bold text-gray-900 mb-4">Items</h2>

          {invoice.type === "single" ? (
            // Single invoice items
            <div className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100 relative">
                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(i)}
                      className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                  <div className="space-y-2">
                    <input className={inputClass} placeholder="Item name" value={item.item_name} onChange={(e) => updateItem(i, "item_name", e.target.value)} />
                    <input className={inputClass} placeholder="Description (optional)" value={item.description} onChange={(e) => updateItem(i, "description", e.target.value)} />
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs font-semibold text-gray-500">Qty</label>
                        <input type="number" className={inputClass} value={item.qty || ""} onChange={(e) => updateItem(i, "qty", Number(e.target.value) || 0)} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500">Unit Cost</label>
                        <input type="number" className={inputClass} value={item.unit_cost || ""} onChange={(e) => updateItem(i, "unit_cost", Number(e.target.value) || 0)} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500">Total</label>
                        <div className="px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-700">
                          {formatNaira(item.qty * item.unit_cost)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={() => addItem()}
                className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm font-bold text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                + Add Item
              </button>
            </div>
          ) : (
            // Multi-day items
            <div className="space-y-4">
              {getDays().map((dayLabel) => {
                const dayItems = items.filter((item) => item.day_label === dayLabel);
                return (
                  <div key={dayLabel} className="border border-blue-200 rounded-xl overflow-hidden">
                    <div className="bg-blue-50 px-3 py-2 flex items-center justify-between">
                      <span className="font-bold text-sm text-blue-800">{dayLabel}</span>
                      <button
                        onClick={() => removeDay(dayLabel)}
                        className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                      >
                        Remove Day
                      </button>
                    </div>
                    <div className="p-3 space-y-3">
                      {dayItems.map((item) => {
                        const globalIdx = items.indexOf(item);
                        return (
                          <div key={globalIdx} className="bg-gray-50 rounded-xl p-3 border border-gray-100 relative">
                            {dayItems.length > 1 && (
                              <button
                                onClick={() => removeItem(globalIdx)}
                                className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            )}
                            <div className="space-y-2">
                              <input className={inputClass} placeholder="Item name" value={item.item_name} onChange={(e) => updateItem(globalIdx, "item_name", e.target.value)} />
                              <input className={inputClass} placeholder="Description (optional)" value={item.description} onChange={(e) => updateItem(globalIdx, "description", e.target.value)} />
                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <label className="text-xs font-semibold text-gray-500">Qty</label>
                                  <input type="number" className={inputClass} value={item.qty || ""} onChange={(e) => updateItem(globalIdx, "qty", Number(e.target.value) || 0)} />
                                </div>
                                <div>
                                  <label className="text-xs font-semibold text-gray-500">Unit Cost</label>
                                  <input type="number" className={inputClass} value={item.unit_cost || ""} onChange={(e) => updateItem(globalIdx, "unit_cost", Number(e.target.value) || 0)} />
                                </div>
                                <div>
                                  <label className="text-xs font-semibold text-gray-500">Total</label>
                                  <div className="px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-700">
                                    {formatNaira(item.qty * item.unit_cost)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <button
                        onClick={() => addItem(dayLabel)}
                        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-xs font-bold text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
                      >
                        + Add Item to {dayLabel}
                      </button>
                    </div>
                  </div>
                );
              })}
              <button
                onClick={addDay}
                className="w-full py-2.5 border-2 border-dashed border-blue-300 rounded-xl text-sm font-bold text-blue-600 hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                + Add Day
              </button>
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
          <h2 className="text-base font-bold text-gray-900 mb-4">Totals</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Subtotal</span>
              <span className="text-sm font-bold">{formatNaira(invoice.subtotal)}</span>
            </div>
            <div>
              <label className={labelClass}>Service Charge / Tax (%)</label>
              <input type="number" className={inputClass} value={invoice.tax_percent || ""} onChange={(e) => updateInvoice("tax_percent", Number(e.target.value) || 0)} placeholder="0" />
            </div>
            {invoice.tax_percent > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Tax Amount ({invoice.tax_percent}%)</span>
                <span className="text-sm font-bold">{formatNaira(invoice.tax_amount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="font-bold text-gray-900">Total</span>
              <span className="text-lg font-bold text-gray-900">{formatNaira(invoice.total)}</span>
            </div>
            <div>
              <label className={labelClass}>Amount Paid</label>
              <input type="number" className={inputClass} value={invoice.amount_paid || ""} onChange={(e) => updateInvoice("amount_paid", Number(e.target.value) || 0)} placeholder="0" />
            </div>
            <div className="flex justify-between items-center py-3 bg-blue-600 text-white rounded-xl px-4">
              <span className="font-bold">Balance Due</span>
              <span className="text-lg font-bold">{formatNaira(invoice.balance_due)}</span>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gray-400"></div>
          <h2 className="text-base font-bold text-gray-900 mb-4">Payment Info</h2>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Bank Name</label>
              <input className={inputClass} value={invoice.payment_bank_name} onChange={(e) => updateInvoice("payment_bank_name", e.target.value)} placeholder="e.g. GTBank" />
            </div>
            <div>
              <label className={labelClass}>Account Number</label>
              <input className={inputClass} value={invoice.payment_account_number} onChange={(e) => updateInvoice("payment_account_number", e.target.value)} placeholder="e.g. 0168059024" />
            </div>
            <div>
              <label className={labelClass}>Account Name</label>
              <input className={inputClass} value={invoice.payment_account_name} onChange={(e) => updateInvoice("payment_account_name", e.target.value)} placeholder="e.g. Z's Oven" />
            </div>
          </div>
        </div>

        {/* Signature & Notes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 relative overflow-hidden">
          <h2 className="text-base font-bold text-gray-900 mb-4">Additional</h2>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Notes</label>
              <input className={inputClass} value={invoice.notes} onChange={(e) => updateInvoice("notes", e.target.value)} placeholder="Thank you for the patronage" />
            </div>
            <div>
              <label className={labelClass}>Signature Name</label>
              <input className={inputClass} value={invoice.signature_name} onChange={(e) => updateInvoice("signature_name", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3.5 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            <>
              Save & Preview
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function InvoiceCreatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      }
    >
      <InvoiceFormContent />
    </Suspense>
  );
}
