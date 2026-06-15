export async function downloadResumePdf(element, fileName) {
  const exportPageWidth = 816;
  const exportPageMinHeight = 1120;
  const exportViewportWidth = 1440;
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
      scale: Math.min(window.devicePixelRatio || 2, 2),
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

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imageScale = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
  const imageWidth = canvas.width * imageScale;
  const imageHeight = canvas.height * imageScale;
  const imageX = (pageWidth - imageWidth) / 2;
  const imageY = (pageHeight - imageHeight) / 2;

  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', imageX, imageY, imageWidth, imageHeight);

  pdf.save(`${slugify(fileName)}.pdf`);
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') || 'resume';
}
