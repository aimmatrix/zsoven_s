import React from 'react';
import { Invoice, InvoiceItem } from '@/lib/types';
import { formatNaira } from '@/lib/invoiceUtils';

interface InvoiceTemplateProps {
  invoice: Invoice;
  items: InvoiceItem[];
}

const InvoiceTemplate = React.forwardRef<HTMLDivElement, InvoiceTemplateProps>(
  ({ invoice, items }, ref) => {
    // Group items by day for multi-day invoices
    const groupedItems: { label: string | null; items: InvoiceItem[] }[] = [];
    if (invoice.type === 'multi_day') {
      const dayMap = new Map<string, InvoiceItem[]>();
      items.forEach((item) => {
        const key = item.day_label || 'Items';
        if (!dayMap.has(key)) dayMap.set(key, []);
        dayMap.get(key)!.push(item);
      });
      dayMap.forEach((dayItems, label) => {
        groupedItems.push({ label, items: dayItems });
      });
    } else {
      groupedItems.push({ label: null, items });
    }

    let globalIndex = 0;

    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
      <div
        ref={ref}
        style={{ width: '800px' }}
        className="bg-white mx-auto p-12 text-gray-900 font-sans shadow-2xl ring-1 ring-gray-100"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-10 pb-8 border-b border-gray-100">
          <div className="flex items-center gap-5">
            {/* Logo */}
            <img
              src="/logo.jpeg"
              alt={invoice.business_name || "Logo"}
              className="w-20 h-20 rounded-2xl object-cover shadow-lg"
            />
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">{invoice.business_name}</h1>
              <div className="text-sm text-gray-500 mt-1 space-y-0.5">
                {invoice.business_address && <p>{invoice.business_address}</p>}
                {invoice.business_phone && <p>{invoice.business_phone}</p>}
                {invoice.business_email && <p>{invoice.business_email}</p>}
              </div>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-black text-gray-200 tracking-widest uppercase mb-4">Invoice</h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm bg-gray-50 p-3 rounded-xl border border-gray-100">
              <span className="text-gray-500 uppercase tracking-wider text-xs font-semibold text-right flex items-center justify-end">Invoice No</span>
              <span className="font-bold text-gray-900 text-right">#{invoice.invoice_number}</span>

              {invoice.po_number && (
                <>
                  <span className="text-gray-500 uppercase tracking-wider text-xs font-semibold text-right flex items-center justify-end">PO Number</span>
                  <span className="font-bold text-gray-900 text-right">{invoice.po_number}</span>
                </>
              )}

              <span className="text-gray-500 uppercase tracking-wider text-xs font-semibold text-right flex items-center justify-end">Date</span>
              <span className="font-medium text-gray-900 text-right">{formatDate(invoice.invoice_date)}</span>

              {invoice.due_date && (
                <>
                  <span className="text-gray-500 uppercase tracking-wider text-xs font-semibold text-right flex items-center justify-end">Due Date</span>
                  <span className="font-medium text-gray-900 text-right">{formatDate(invoice.due_date)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-10 p-6 bg-blue-50/30 rounded-2xl border border-blue-50">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Billed To</p>
          <p className="text-lg font-bold text-gray-900 mb-1">{invoice.bill_to_name}</p>
          <div className="text-sm text-gray-600 space-y-0.5">
            {invoice.bill_to_address && <p>{invoice.bill_to_address}</p>}
            {invoice.bill_to_phone && <p>{invoice.bill_to_phone}</p>}
          </div>
        </div>

        {/* Items Table */}
        <div className="border border-gray-200 rounded-2xl overflow-hidden mb-10">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-4 px-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-12 border-b border-gray-200">#</th>
                <th className="py-4 px-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Description</th>
                <th className="py-4 px-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-20 border-b border-gray-200">Qty</th>
                <th className="py-4 px-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-32 border-b border-gray-200">Unit Price</th>
                <th className="py-4 px-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-36 border-b border-gray-200">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {groupedItems.map((group, gi) => (
                <React.Fragment key={gi}>
                  {group.label && invoice.type === 'multi_day' && (
                    <tr className="bg-gray-50/50">
                      <td colSpan={5} className="py-3 px-4 font-bold text-gray-700 text-xs uppercase tracking-wider">
                        {group.label}
                      </td>
                    </tr>
                  )}
                  {group.items.map((item, i) => {
                    globalIndex++;
                    return (
                      <tr
                        key={item.id || `${gi}-${i}`}
                        className="bg-white hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="py-4 px-4 text-sm text-gray-400 font-medium">{globalIndex}</td>
                        <td className="py-4 px-4">
                          <p className="text-sm font-bold text-gray-900">{item.item_name}</p>
                          {item.description && (
                            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center text-sm font-medium text-gray-700">{item.qty}</td>
                        <td className="py-4 px-4 text-right text-sm font-medium text-gray-600">{formatNaira(item.unit_cost)}</td>
                        <td className="py-4 px-4 text-right text-sm font-bold text-gray-900">{formatNaira(item.total)}</td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals + Payment Info */}
        <div className="flex justify-between items-start gap-12 mt-8">
          {/* Payment Info & Notes */}
          <div className="flex-1">
            {(invoice.payment_bank_name || invoice.payment_account_number) && (
              <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 mb-6">
                <p className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-3">Payment Details</p>
                {invoice.payment_bank_name && invoice.payment_account_number && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600"><span className="font-semibold text-gray-900">Bank:</span> {invoice.payment_bank_name}</p>
                    {invoice.payment_account_name && <p className="text-sm text-gray-600"><span className="font-semibold text-gray-900">Account Name:</span> {invoice.payment_account_name}</p>}
                    <p className="text-sm text-gray-600"><span className="font-semibold text-gray-900">Account No:</span> {invoice.payment_account_number}</p>
                  </div>
                )}
              </div>
            )}

            {invoice.notes && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Notes & Terms</p>
                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">{invoice.notes}</p>
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="w-80">
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div className="flex justify-between py-2 text-sm">
                <span className="text-gray-500 font-medium">Subtotal</span>
                <span className="font-bold text-gray-900">{formatNaira(invoice.subtotal)}</span>
              </div>
              {invoice.tax_percent > 0 && (
                <div className="flex justify-between py-2 text-sm border-t border-gray-200/60 mt-2 pt-3">
                  <span className="text-gray-500 font-medium">Tax ({invoice.tax_percent}%)</span>
                  <span className="font-bold text-gray-900">{formatNaira(invoice.tax_amount)}</span>
                </div>
              )}
              <div className="flex justify-between py-3 text-base border-t-2 border-gray-900 mt-2 pt-3">
                <span className="font-black text-gray-900 uppercase tracking-wider">Total</span>
                <span className="font-black text-gray-900">{formatNaira(invoice.total)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center py-4 px-6 mt-4 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-600/20">
              <span className="font-bold tracking-wider uppercase text-sm">Balance Due</span>
              <span className="text-xl font-black">{formatNaira(invoice.balance_due)}</span>
            </div>
          </div>
        </div>

        {/* Signature */}
        <div className="mt-16 flex justify-end">
          <div className="text-center">
            <div className="w-48 border-b-2 border-gray-300 mb-3 mx-auto"></div>
            <p className="text-base font-bold text-gray-900">{invoice.signature_name}</p>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">Authorized Signature</p>
            <p className="text-xs text-gray-400 mt-1">{formatDate(invoice.invoice_date)}</p>
          </div>
        </div>
      </div>
    );
  }
);

InvoiceTemplate.displayName = 'InvoiceTemplate';
export default InvoiceTemplate;
