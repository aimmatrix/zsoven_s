"use client";

import { useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useInvoice } from "@/hooks/useInvoice";
import InvoiceTemplate from "@/components/InvoiceTemplate";
import { generatePdf, sharePdf } from "@/lib/generatePdf";

export default function InvoicePreviewPage() {
  const params = useParams();
  const invoiceId = params.id as string;
  const { invoice, items, loading } = useInvoice(invoiceId);
  const templateRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const handleDownload = async () => {
    if (!templateRef.current || !invoice) return;
    setGenerating(true);
    try {
      await generatePdf(templateRef.current, `Invoice_${invoice.invoice_number}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!templateRef.current || !invoice) return;
    setGenerating(true);
    try {
      await sharePdf(templateRef.current, `Invoice_${invoice.invoice_number}`);
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 font-medium">Loading invoice...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Invoice not found</h2>
        <a href="/invoice" className="text-blue-600 font-medium hover:underline">Back to Invoices</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      {/* Action Bar */}
      <div className="print:hidden bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-3">
          <a
            href="/invoice"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors mr-auto"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back
          </a>
          <a
            href={`/invoice/create?id=${invoiceId}`}
            className="px-4 py-2 bg-gray-100 text-gray-700 font-bold text-sm rounded-lg hover:bg-gray-200 transition-colors"
          >
            Edit
          </a>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-gray-100 text-gray-700 font-bold text-sm rounded-lg hover:bg-gray-200 transition-colors"
          >
            Print
          </button>
          <button
            onClick={handleShare}
            disabled={generating}
            className="px-4 py-2 bg-green-600 text-white font-bold text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {generating ? 'Processing...' : 'Share'}
          </button>
          <button
            onClick={handleDownload}
            disabled={generating}
            className="px-4 py-2 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {generating ? 'Processing...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <InvoiceTemplate ref={templateRef} invoice={invoice} items={items} />
        </div>
      </div>
    </div>
  );
}
