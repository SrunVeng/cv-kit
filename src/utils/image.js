const supportedPhotoTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const maxPhotoDimension = 960;
const photoQuality = 0.86;

export async function prepareProfilePhoto(file) {
  if (!file) return '';
  if (!supportedPhotoTypes.has(file.type)) {
    throw new Error('Choose a JPG, PNG, or WebP image.');
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(objectUrl);
    const largestDimension = Math.max(image.naturalWidth, image.naturalHeight);
    const scale = Math.min(1, maxPhotoDimension / largestDimension);
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('This browser could not prepare the image.');
    }

    canvas.width = width;
    canvas.height = height;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(image, 0, 0, width, height);

    const webpBlob = await tryCanvasToBlob(canvas, 'image/webp', photoQuality);
    const blob =
      webpBlob?.type === 'image/webp'
        ? webpBlob
        : await canvasToBlob(canvas, 'image/jpeg', photoQuality);
    return readBlobAsDataUrl(blob);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('The selected image could not be opened.'));
    image.src = src;
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('The selected image could not be optimized.'));
        }
      },
      type,
      quality,
    );
  });
}

function tryCanvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
}

function readBlobAsDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('The selected image could not be read.'));
    reader.readAsDataURL(blob);
  });
}
