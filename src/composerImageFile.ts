export const COMPOSER_IMAGE_ACCEPT =
  "image/png,image/jpeg,image/jpg,image/webp";

export function pickComposerImageFile(files: FileList | null): File | null {
  if (!files || files.length === 0) {
    return null;
  }

  for (let i = 0; i < files.length; i += 1) {
    const file = files.item(i);
    if (!file || file.size === 0) {
      continue;
    }
    if (file.type.startsWith("image/")) {
      return file;
    }
  }

  return null;
}
