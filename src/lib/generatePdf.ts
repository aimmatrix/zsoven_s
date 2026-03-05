import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function generatePdf(
  element: HTMLElement,
  filename: string = 'invoice'
): Promise<Blob> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdfWidth = 210;
  const pdfHeight = 297;
  const contentWidth = pdfWidth - 20;
  const ratio = canvas.width / canvas.height;
  const contentHeight = contentWidth / ratio;

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  if (contentHeight > pdfHeight - 20) {
    const scaledHeight = pdfHeight - 20;
    const scaledWidth = scaledHeight * ratio;
    const xOffset = (pdfWidth - scaledWidth) / 2;
    pdf.addImage(imgData, 'PNG', xOffset, 10, scaledWidth, scaledHeight);
  } else {
    pdf.addImage(imgData, 'PNG', 10, 10, contentWidth, contentHeight);
  }

  const blob = pdf.output('blob');
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.pdf`;
  link.click();
  URL.revokeObjectURL(url);

  return blob;
}

export async function sharePdf(
  element: HTMLElement,
  filename: string = 'invoice'
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdfWidth = 210;
  const contentWidth = pdfWidth - 20;
  const ratio = canvas.width / canvas.height;
  const contentHeight = contentWidth / ratio;

  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  pdf.addImage(imgData, 'PNG', 10, 10, contentWidth, Math.min(contentHeight, 277));

  const blob = pdf.output('blob');
  const file = new File([blob], `${filename}.pdf`, { type: 'application/pdf' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({ title: filename, files: [file] });
  } else {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
