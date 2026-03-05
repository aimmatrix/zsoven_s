"use client";

import { useRef, useState, useEffect } from "react";
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
  const [scale, setScale] = useState(1);
  const [wrapperHeight, setWrapperHeight] = useState<number | null>(null);
  const scalingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const availableWidth = window.innerWidth - 48;
      setScale(Math.min(1, availableWidth / 800));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (!scalingRef.current || !invoice) return;
    setWrapperHeight(scalingRef.current.scrollHeight * scale);
  }, [scale, invoice, items]);

  const handleDownload = async () => {
    if (!templateRef.current || !invoice) return;
    setGenerating(true);
    try {
      await generatePdf(templateRef.current, `Invoice_${invoice.invoice_number}`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      // Fallback to browser print
      window.print();
    } finally {
      setGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!templateRef.current || !invoice) return;
    setGenerating(true);
    try {
      await sharePdf(templateRef.current, `Invoice_${invoice.invoice_number}`);
    } catch (err) {
      console.error("Share failed:", err);
      alert("Could not share. Please try downloading instead.");
    } finally {
      setGenerating(false);
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

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Invoice not found</h2>
        <a href="/invoice" className="text-blue-600 font-medium hover:underline">Back to Invoices</a>
      </div>
    );
  }

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; margin: 0 !important; padding: 0 !important; }
          .print-hide { display: none !important; }
          .print-invoice-outer { padding: 0 !important; margin: 0 !important; background: white !important; }
          .print-invoice-card { box-shadow: none !important; border-radius: 0 !important; border: none !important; overflow: visible !important; height: auto !important; }
          .print-invoice-scale { transform: none !important; width: 100% !important; }
        }
      `}</style>

      <div className="min-h-screen bg-gray-100 pb-12 print-invoice-outer">
        {/* Action Bar */}
        <div className="print-hide bg-white border-b border-gray-200 sticky top-0 z-10">
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
              onClick={handleShare}
              disabled={generating}
              className="px-4 py-2 bg-green-600 text-white font-bold text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {generating ? "Processing..." : "Share"}
            </button>
            <button
              onClick={handleDownload}
              disabled={generating}
              className="px-4 py-2 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {generating ? "Processing..." : "Download PDF"}
            </button>
          </div>
        </div>

        {/* Invoice Preview */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div
            className="bg-white rounded-2xl shadow-lg overflow-hidden print-invoice-card"
            style={{ height: wrapperHeight != null && scale < 1 ? wrapperHeight : undefined }}
          >
            <div
              ref={scalingRef}
              className="print-invoice-scale"
              style={{
                transform: scale < 1 ? `scale(${scale})` : undefined,
                transformOrigin: "top left",
                width: "800px",
              }}
            >
              <InvoiceTemplate ref={templateRef} invoice={invoice} items={items} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
