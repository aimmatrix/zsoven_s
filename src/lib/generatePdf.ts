import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

async function captureElement(element: HTMLElement): Promise<HTMLCanvasElement> {
  // Clone the element and render off-screen at full 800px width
  // This avoids issues with CSS transforms, scaling, and viewport constraints
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.position = 'fixed';
  clone.style.left = '0';
  clone.style.top = '0';
  clone.style.width = '800px';
  clone.style.transform = 'none';
  clone.style.zIndex = '-9999';
  clone.style.opacity = '0.01';
  document.body.appendChild(clone);

  // Wait for styles to settle
  await new Promise(resolve => setTimeout(resolve, 100));

  try {
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: 800,
      windowWidth: 800,
    });

    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas capture produced empty result');
    }

    return canvas;
  } finally {
    document.body.removeChild(clone);
  }
}

export async function generatePdf(
  element: HTMLElement,
  filename: string = 'invoice'
): Promise<void> {
  const canvas = await captureElement(element);

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;
  const contentHeight = (canvas.height / canvas.width) * contentWidth;

  if (contentHeight <= pageHeight - margin * 2) {
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margin, margin, contentWidth, contentHeight);
  } else {
    // Multi-page: slice canvas into page-sized chunks
    const pageContentHeight = pageHeight - margin * 2;
    const pxPerMm = canvas.width / contentWidth;
    const sliceHeightPx = pageContentHeight * pxPerMm;
    let offsetY = 0;
    let first = true;

    while (offsetY < canvas.height) {
      if (!first) pdf.addPage();
      first = false;

      const remaining = canvas.height - offsetY;
      const currentSlicePx = Math.min(sliceHeightPx, remaining);
      const currentSliceMm = currentSlicePx / pxPerMm;

      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = currentSlicePx;
      const ctx = pageCanvas.getContext('2d')!;
      ctx.drawImage(canvas, 0, offsetY, canvas.width, currentSlicePx, 0, 0, canvas.width, currentSlicePx);

      pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', margin, margin, contentWidth, currentSliceMm);
      offsetY += sliceHeightPx;
    }
  }

  pdf.save(`${filename}.pdf`);
}

export async function sharePdf(
  element: HTMLElement,
  filename: string = 'invoice'
): Promise<void> {
  // Try sharing as image first (better mobile compatibility)
  const canvas = await captureElement(element);

  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png')
  );

  const file = new File([blob], `${filename}.png`, { type: 'image/png' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({ title: filename, files: [file] });
  } else {
    // Fallback: download as image
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
}
