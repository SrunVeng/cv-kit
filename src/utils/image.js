const supportedPhotoTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const maxPhotoDimension = 960;
const photoQuality = 0.86;

export async function prepareProfilePhoto(file) {
  if (!file) return null;
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

    const framing = await findSmartFraming(image);

    const webpBlob = await tryCanvasToBlob(canvas, 'image/webp', photoQuality);
    const blob =
      webpBlob?.type === 'image/webp'
        ? webpBlob
        : await canvasToBlob(canvas, 'image/jpeg', photoQuality);
    return {
      src: await readBlobAsDataUrl(blob),
      width,
      height,
      ...framing,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function cropProfilePhoto(src, framing, outputSize = 720) {
  if (!src) return '';

  const image = await loadImage(src);
  const sourceWidth = image.naturalWidth;
  const sourceHeight = image.naturalHeight;
  const { sourceX, sourceY, cropSize } = calculateSquareCrop(sourceWidth, sourceHeight, framing);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('This browser could not crop the image.');
  }

  canvas.width = outputSize;
  canvas.height = outputSize;
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(
    image,
    sourceX,
    sourceY,
    cropSize,
    cropSize,
    0,
    0,
    outputSize,
    outputSize,
  );

  const webpBlob = await tryCanvasToBlob(canvas, 'image/webp', photoQuality);
  const blob = webpBlob?.type === 'image/webp'
    ? webpBlob
    : await canvasToBlob(canvas, 'image/jpeg', photoQuality);

  return readBlobAsDataUrl(blob);
}

export function calculateSquareCrop(sourceWidth, sourceHeight, framing) {
  const safeWidth = Math.max(1, Number(sourceWidth) || 1);
  const safeHeight = Math.max(1, Number(sourceHeight) || 1);
  const shortestSide = Math.min(safeWidth, safeHeight);
  const requestedZoom = Number(framing?.zoom);
  const requestedPositionX = Number(framing?.positionX);
  const requestedPositionY = Number(framing?.positionY);
  const zoom = clamp(Number.isFinite(requestedZoom) ? requestedZoom : 1, 1, 2.5);
  const cropSize = shortestSide / zoom;
  const positionX = clamp(Number.isFinite(requestedPositionX) ? requestedPositionX : 50, 0, 100);
  const positionY = clamp(Number.isFinite(requestedPositionY) ? requestedPositionY : 40, 0, 100);
  const requestedCenterX = safeWidth * positionX / 100;
  const requestedCenterY = safeHeight * positionY / 100;

  return {
    sourceX: clamp(requestedCenterX - cropSize / 2, 0, safeWidth - cropSize),
    sourceY: clamp(requestedCenterY - cropSize / 2, 0, safeHeight - cropSize),
    cropSize,
  };
}

async function findSmartFraming(image) {
  const fallback = getAspectAwareFraming(image.naturalWidth, image.naturalHeight);

  if (typeof window === 'undefined' || !('FaceDetector' in window)) {
    return fallback;
  }

  try {
    const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 4 });
    const faces = await detector.detect(image);
    if (!faces.length) return fallback;

    const face = faces.reduce((largest, candidate) => {
      const area = candidate.boundingBox.width * candidate.boundingBox.height;
      const largestArea = largest.boundingBox.width * largest.boundingBox.height;
      return area > largestArea ? candidate : largest;
    });
    const box = face.boundingBox;
    const faceCenterX = box.x + box.width / 2;
    const portraitCenterY = box.y + box.height * 1.05;
    const faceRatio = box.height / image.naturalHeight;

    return {
      positionX: clamp((faceCenterX / image.naturalWidth) * 100, 12, 88),
      positionY: clamp((portraitCenterY / image.naturalHeight) * 100, 18, 72),
      zoom: clamp(0.44 / faceRatio, 1, 1.65),
      smartPositioned: true,
    };
  } catch {
    return fallback;
  }
}

function getAspectAwareFraming(width, height) {
  const aspectRatio = width / height;

  return {
    positionX: 50,
    positionY: aspectRatio < 0.82 ? 38 : aspectRatio > 1.25 ? 43 : 40,
    zoom: aspectRatio > 1.35 ? 1.12 : 1,
    smartPositioned: false,
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
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
