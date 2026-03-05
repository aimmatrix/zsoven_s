import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function generatePdf(
  element: HTMLElement,
  filename: string = 'invoice'
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    imageTimeout: 15000,
    windowWidth: 800,
  });

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;
  const imgHeightPx = canvas.height;
  const imgWidthPx = canvas.width;
  const contentHeightMm = (imgHeightPx / imgWidthPx) * contentWidth;

  // Multi-page support
  const singlePageContentHeightPx = (imgWidthPx / contentWidth) * (pageHeight - margin * 2);
  let offsetY = 0;
  let isFirstPage = true;

  while (offsetY < imgHeightPx) {
    if (!isFirstPage) pdf.addPage();
    isFirstPage = false;

    const pageCanvas = document.createElement('canvas');
    const sliceHeight = Math.min(singlePageContentHeightPx, imgHeightPx - offsetY);
    pageCanvas.width = imgWidthPx;
    pageCanvas.height = sliceHeight;
    const ctx = pageCanvas.getContext('2d')!;
    ctx.drawImage(canvas, 0, -offsetY);

    const sliceHeightMm = (sliceHeight / imgWidthPx) * contentWidth;
    pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', margin, margin, contentWidth, sliceHeightMm);
    offsetY += singlePageContentHeightPx;
  }

  pdf.save(`${filename}.pdf`);
}

export async function sharePdf(
  element: HTMLElement,
  filename: string = 'invoice'
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: 800,
  });

  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = 210;
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;
  const contentHeight = (canvas.height / canvas.width) * contentWidth;

  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margin, margin, contentWidth, Math.min(contentHeight, 277));

  const blob = pdf.output('blob');
  const file = new File([blob], `${filename}.pdf`, { type: 'application/pdf' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({ title: filename, files: [file] });
  } else {
    // Fallback: trigger download
    pdf.save(`${filename}.pdf`);
  }
}
