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

export function pickComposerImageFromClipboard(
  clipboardData: DataTransfer | null,
): File | null {
  if (!clipboardData) {
    return null;
  }

  const fromItems = clipboardData.items;
  if (fromItems && fromItems.length > 0) {
    for (let i = 0; i < fromItems.length; i += 1) {
      const item = fromItems[i];
      if (item.kind !== "file" || !item.type.startsWith("image/")) {
        continue;
      }
      const file = item.getAsFile();
      if (file && file.size > 0) {
        return file;
      }
    }
  }

  return pickComposerImageFile(clipboardData.files);
}

export function isExternalComposerPasteTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.closest("[data-composer-dropzone]")) {
    return false;
  }

  return target.closest("input, textarea, [contenteditable='true']") !== null;
}
