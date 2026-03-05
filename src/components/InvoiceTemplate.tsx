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
        style={{ width: '800px', fontFamily: 'Arial, Helvetica, sans-serif' }}
        className="bg-white mx-auto p-8 text-gray-900"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-start gap-4">
            {/* Logo placeholder */}
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              Z
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">{invoice.business_name}</h1>
              <p className="text-sm text-gray-600">{invoice.business_address}</p>
              <p className="text-sm text-gray-600">{invoice.business_phone}</p>
              <p className="text-sm text-gray-600">{invoice.business_email}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-extrabold text-blue-600 mb-2">INVOICE</h2>
            <p className="text-sm text-gray-600">#{invoice.invoice_number}</p>
            {invoice.po_number && (
              <p className="text-sm text-gray-600">PO Number: {invoice.po_number}</p>
            )}
            <p className="text-sm text-gray-600">Date: {formatDate(invoice.invoice_date)}</p>
            {invoice.due_date && (
              <p className="text-sm text-gray-600">Due Date: {formatDate(invoice.due_date)}</p>
            )}
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-6">
          <p className="text-sm font-bold text-gray-700 mb-1">Bill To: {invoice.bill_to_name}</p>
          {invoice.bill_to_address && (
            <p className="text-sm text-gray-600">{invoice.bill_to_address}</p>
          )}
          {invoice.bill_to_phone && (
            <p className="text-sm text-gray-600">{invoice.bill_to_phone}</p>
          )}
        </div>

        {/* Items Table */}
        <table className="w-full mb-6 border-collapse">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="py-2 px-3 text-left text-xs font-bold uppercase w-10">#</th>
              <th className="py-2 px-3 text-left text-xs font-bold uppercase">Items</th>
              <th className="py-2 px-3 text-center text-xs font-bold uppercase w-20">Qty</th>
              <th className="py-2 px-3 text-right text-xs font-bold uppercase w-28">Unit cost</th>
              <th className="py-2 px-3 text-right text-xs font-bold uppercase w-32">Total</th>
            </tr>
          </thead>
          <tbody>
            {groupedItems.map((group, gi) => (
              <React.Fragment key={gi}>
                {group.label && invoice.type === 'multi_day' && (
                  <tr className="bg-blue-50">
                    <td colSpan={5} className="py-2 px-3 font-bold text-blue-800 text-sm border-b border-blue-100">
                      {group.label}
                    </td>
                  </tr>
                )}
                {group.items.map((item, i) => {
                  globalIndex++;
                  return (
                    <tr
                      key={item.id || `${gi}-${i}`}
                      className={globalIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                    >
                      <td className="py-2 px-3 text-sm border-b border-gray-100">{globalIndex}</td>
                      <td className="py-2 px-3 border-b border-gray-100">
                        <p className="text-sm font-medium">{item.item_name}</p>
                        {item.description && (
                          <p className="text-xs text-gray-500">{item.description}</p>
                        )}
                      </td>
                      <td className="py-2 px-3 text-center text-sm border-b border-gray-100">{item.qty}</td>
                      <td className="py-2 px-3 text-right text-sm border-b border-gray-100">{formatNaira(item.unit_cost)}</td>
                      <td className="py-2 px-3 text-right text-sm font-medium border-b border-gray-100">{formatNaira(item.total)}</td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {/* Totals + Payment Info */}
        <div className="flex justify-between items-start gap-8">
          {/* Payment Info & Notes */}
          <div className="flex-1">
            {invoice.notes && (
              <p className="text-sm italic text-gray-600 mb-4">{invoice.notes}</p>
            )}
            {(invoice.payment_bank_name || invoice.payment_account_number) && (
              <div className="text-sm text-gray-700">
                <p className="font-bold mb-1">Payment Info</p>
                {invoice.payment_bank_name && invoice.payment_account_number && (
                  <p>{invoice.payment_account_name} {invoice.payment_bank_name} {invoice.payment_account_number}</p>
                )}
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="w-72">
            <div className="flex justify-between py-1.5 text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatNaira(invoice.subtotal)}</span>
            </div>
            {invoice.tax_percent > 0 && (
              <div className="flex justify-between py-1.5 text-sm">
                <span className="text-gray-600">Service charge and tax({invoice.tax_percent}%)</span>
                <span className="font-medium">{formatNaira(invoice.tax_amount)}</span>
              </div>
            )}
            <div className="flex justify-between py-1.5 text-sm border-t border-gray-200 mt-1">
              <span className="font-bold">Total</span>
              <span className="font-bold">{formatNaira(invoice.total)}</span>
            </div>
            <div className="flex justify-between py-2 mt-1 bg-blue-600 text-white rounded px-3">
              <span className="font-bold">Balance Due</span>
              <span className="font-bold">{formatNaira(invoice.balance_due)}</span>
            </div>
          </div>
        </div>

        {/* Signature */}
        <div className="mt-12 flex justify-end">
          <div className="text-center">
            <div className="w-40 border-b border-gray-400 mb-1 h-8"></div>
            <p className="text-sm font-bold text-gray-700">{invoice.signature_name}</p>
            <p className="text-xs text-gray-500">{formatDate(invoice.invoice_date)}</p>
          </div>
        </div>
      </div>
    );
  }
);

InvoiceTemplate.displayName = 'InvoiceTemplate';
export default InvoiceTemplate;
