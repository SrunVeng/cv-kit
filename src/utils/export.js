export async function downloadResumePdf(element, fileName) {
  const exportPageWidth = 816;
  const exportPageMinHeight = 1120;
  const exportViewportWidth = 1440;
  const exportCanvasScale = 1.5;
  const jpegQuality = 0.84;
  const exportTarget = `resume-export-${Date.now()}`;

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  element.dataset.exportTarget = exportTarget;

  let canvas;
  try {
    canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: exportCanvasScale,
      useCORS: true,
      windowWidth: exportViewportWidth,
      windowHeight: Math.max(element.scrollHeight, exportPageMinHeight),
      onclone: (clonedDocument) => {
        clonedDocument.body.classList.add('resume-export-scope');

        const clonedElement = clonedDocument.querySelector(`[data-export-target="${exportTarget}"]`);
        if (!clonedElement) return;

        clonedElement.style.width = `${exportPageWidth}px`;
        clonedElement.style.maxWidth = 'none';
        clonedElement.style.minHeight = `${exportPageMinHeight}px`;
        clonedElement.style.height = 'auto';
        clonedElement.style.margin = '0';
        clonedElement.style.boxShadow = 'none';
      },
    });
  } finally {
    delete element.dataset.exportTarget;
  }

  const pdf = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imageScale = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
  const imageWidth = canvas.width * imageScale;
  const imageHeight = canvas.height * imageScale;
  const imageX = (pageWidth - imageWidth) / 2;
  const imageY = (pageHeight - imageHeight) / 2;
  const imageData = canvas.toDataURL('image/jpeg', jpegQuality);

  pdf.addImage(imageData, 'JPEG', imageX, imageY, imageWidth, imageHeight, undefined, 'FAST');

  await savePdfBlob(pdf.output('blob'), `${slugify(fileName)}.pdf`);
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') || 'resume';
}

async function savePdfBlob(blob, fileName) {
  const pdfFile =
    typeof File === 'function' ? new File([blob], fileName, { type: 'application/pdf' }) : null;

  if (shouldUseNativeFileShare(pdfFile)) {
    try {
      await navigator.share({
        files: [pdfFile],
        title: fileName,
      });
      return;
    } catch (error) {
      if (error?.name === 'AbortError') return;
    }
  }

  triggerBlobDownload(blob, fileName);
}

function shouldUseNativeFileShare(file) {
  if (
    !file ||
    typeof navigator === 'undefined' ||
    !isMobileBrowser() ||
    typeof navigator.share !== 'function' ||
    typeof navigator.canShare !== 'function'
  ) {
    return false;
  }

  try {
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

function isMobileBrowser() {
  const userAgent = navigator.userAgent || '';
  const isTouchMac = /Macintosh/i.test(userAgent) && navigator.maxTouchPoints > 1;

  return /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(userAgent) || isTouchMac;
}

function triggerBlobDownload(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  link.rel = 'noopener';
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  window.setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(url);
  }, 0);
}
