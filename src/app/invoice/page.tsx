"use client";

import { useInvoiceList } from "@/hooks/useInvoice";
import { formatNaira } from "@/lib/invoiceUtils";
import { supabase } from "@/lib/supabase";

export default function InvoiceListPage() {
  const { invoices, loading, refetch } = useInvoiceList();

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this invoice?")) return;
    await supabase.from("invoices").delete().eq("id", id);
    refetch();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 font-medium">Loading invoices...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <a href="/" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 mb-2 transition-colors">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to Dashboard
              </a>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Invoices</h1>
              <p className="text-gray-500 mt-1 text-sm">Create and manage your invoices.</p>
            </div>
            <a
              href="/invoice/create"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all shadow-md shadow-blue-200 whitespace-nowrap"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Create Invoice
            </a>
          </div>
        </div>

        {/* Invoice List */}
        {invoices.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No invoices yet</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">Create your first invoice to get started.</p>
            <a
              href="/invoice/create"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-sm"
            >
              Create Invoice
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-md transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900">#{inv.invoice_number}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${inv.type === 'multi_day' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                      {inv.type === 'multi_day' ? 'Multi-day' : 'One-time'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{inv.bill_to_name || 'No client name'}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(inv.invoice_date + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{formatNaira(inv.total)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`/invoice/${inv.id}`}
                    className="px-3 py-2 bg-blue-50 text-blue-600 font-bold text-xs rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    View
                  </a>
                  <a
                    href={`/invoice/create?id=${inv.id}`}
                    className="px-3 py-2 bg-gray-50 text-gray-600 font-bold text-xs rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Edit
                  </a>
                  <button
                    onClick={() => handleDelete(inv.id!)}
                    className="px-3 py-2 bg-red-50 text-red-600 font-bold text-xs rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
