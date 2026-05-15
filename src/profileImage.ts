const MAX_PROFILE_IMAGE_DIMENSION = 1024;
const MAX_PROFILE_IMAGE_BYTES = 750 * 1024;

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Profil resmi okunamadi"));
    };
    reader.onerror = () => reject(new Error("Profil resmi okunamadi"));
    reader.readAsDataURL(blob);
  });

const canvasToBlob = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error("Profil resmi olusturulamadi"));
      },
      "image/jpeg",
      quality,
    );
  });

export async function optimizeProfileImage(
  file: File,
  opts?: {
    maxDimension?: number;
    maxBytes?: number;
  },
) {
  const maxDimension = opts?.maxDimension ?? MAX_PROFILE_IMAGE_DIMENSION;
  const maxBytes = opts?.maxBytes ?? MAX_PROFILE_IMAGE_BYTES;
  const objectUrl = URL.createObjectURL(file);

  try {
    const optimizedDataUrl = await new Promise<string>((resolve, reject) => {
      const image = new window.Image();

      image.onload = async () => {
        try {
          const scale = Math.min(
            1,
            maxDimension / Math.max(image.width, image.height),
          );
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(image.width * scale));
          canvas.height = Math.max(1, Math.round(image.height * scale));

          const context = canvas.getContext("2d");
          if (!context) {
            reject(new Error("Profil resmi islenemedi"));
            return;
          }

          context.drawImage(image, 0, 0, canvas.width, canvas.height);

          const qualityLevels = [0.85, 0.75, 0.65, 0.55];
          let selectedBlob: Blob | null = null;

          for (const quality of qualityLevels) {
            const blob = await canvasToBlob(canvas, quality);
            selectedBlob = blob;

            if (blob.size <= maxBytes) {
              break;
            }
          }

          if (!selectedBlob) {
            reject(new Error("Profil resmi islenemedi"));
            return;
          }

          resolve(await blobToDataUrl(selectedBlob));
        } catch (imageError) {
          reject(imageError);
        }
      };

      image.onerror = () => reject(new Error("Profil resmi yuklenemedi"));
      image.src = objectUrl;
    });

    return optimizedDataUrl;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
