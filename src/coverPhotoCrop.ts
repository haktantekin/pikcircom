export type CoverOffset = { x: number; y: number };

export type CoverLayout = {
  scale: number;
  displayWidth: number;
  displayHeight: number;
  minX: number;
  minY: number;
};

/** Görüntüyü viewport'u tamamen kaplayacak şekilde ölçekler. */
export function computeCoverLayout(
  imageWidth: number,
  imageHeight: number,
  viewportWidth: number,
  viewportHeight: number,
): CoverLayout {
  const scale = Math.max(
    viewportWidth / imageWidth,
    viewportHeight / imageHeight,
  );
  const displayWidth = imageWidth * scale;
  const displayHeight = imageHeight * scale;
  const minX = viewportWidth - displayWidth;
  const minY = viewportHeight - displayHeight;

  return { scale, displayWidth, displayHeight, minX, minY };
}

export function clampCoverOffset(
  x: number,
  y: number,
  layout: CoverLayout,
): CoverOffset {
  return {
    x: Math.min(0, Math.max(layout.minX, x)),
    y: Math.min(0, Math.max(layout.minY, y)),
  };
}

export function centerCoverOffset(layout: CoverLayout): CoverOffset {
  return clampCoverOffset(layout.minX / 2, layout.minY / 2, layout);
}

export async function loadImageElement(
  src: string,
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    if (!src.startsWith("data:") && !src.startsWith("blob:")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Kapak fotografi yuklenemedi"));
    img.src = src;
  });
}

/** Viewport'ta görünen alanı JPEG data URL olarak dışa aktarır. */
export async function exportCoverCrop(
  image: HTMLImageElement,
  offset: CoverOffset,
  layout: CoverLayout,
  viewportWidth: number,
  viewportHeight: number,
  outputWidth = 1200,
): Promise<string> {
  const outputHeight = Math.max(
    1,
    Math.round((outputWidth * viewportHeight) / viewportWidth),
  );

  const sx = -offset.x / layout.scale;
  const sy = -offset.y / layout.scale;
  const sw = viewportWidth / layout.scale;
  const sh = viewportHeight / layout.scale;

  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Kapak kırpılamadı");
  }

  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, outputWidth, outputHeight);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Kapak kırpılamadı"))),
      "image/jpeg",
      0.88,
    );
  });

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Kapak kırpılamadı"));
    };
    reader.onerror = () => reject(new Error("Kapak kırpılamadı"));
    reader.readAsDataURL(blob);
  });
}
