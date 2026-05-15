const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

const SUPPORTED_IMAGE_MIME = /^image\/(png|jpe?g|webp|gif)$/i;

function normalizeMime(mime: string): string {
  const lower = mime.toLowerCase();
  if (lower === "image/jpg") {
    return "image/jpeg";
  }
  return lower;
}

function mimeFromMagicBytes(base64: string): string | null {
  try {
    const sample = base64.slice(0, 32);
    const binary = atob(sample);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      return "image/jpeg";
    }
    if (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    ) {
      return "image/png";
    }
    if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
      return "image/gif";
    }
    if (
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46
    ) {
      return "image/webp";
    }
  } catch {
    return null;
  }
  return null;
}

/** FileReader bazen JPEG/PNG icin application/octet-stream dondurur; WP data:image/ bekler. */
export function normalizeImageDataUrl(dataUrl: string, file: File): string {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    return dataUrl;
  }

  const [, declaredMime, base64] = match;
  if (SUPPORTED_IMAGE_MIME.test(declaredMime)) {
    return `data:${normalizeMime(declaredMime)};base64,${base64}`;
  }

  let mime = file.type && SUPPORTED_IMAGE_MIME.test(file.type) ? file.type : "";
  if (mime) {
    mime = normalizeMime(mime);
  }

  if (!mime) {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext && EXT_TO_MIME[ext]) {
      mime = EXT_TO_MIME[ext];
    }
  }

  if (!mime) {
    mime = mimeFromMagicBytes(base64) ?? "";
  }

  if (!mime || !SUPPORTED_IMAGE_MIME.test(mime)) {
    return dataUrl;
  }

  return `data:${normalizeMime(mime)};base64,${base64}`;
}

export const fileToImageDataUrl = (selectedFile: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Gorsel okunamadi"));
        return;
      }
      resolve(normalizeImageDataUrl(reader.result, selectedFile));
    };
    reader.onerror = () => reject(new Error("Gorsel okunamadi"));
    reader.readAsDataURL(selectedFile);
  });
