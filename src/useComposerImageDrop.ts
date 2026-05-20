import { useCallback, useRef, useState, type DragEvent } from "react";
import { pickComposerImageFile } from "@/src/composerImageFile";

type UseComposerImageDropOptions = {
  onFile: (file: File) => void;
  onInvalidFile?: () => void;
  disabled?: boolean;
};

export function useComposerImageDrop({
  onFile,
  onInvalidFile,
  disabled = false,
}: UseComposerImageDropOptions) {
  const [isDragActive, setIsDragActive] = useState(false);
  const dragDepthRef = useRef(0);

  const onDragEnter = useCallback(
    (event: DragEvent) => {
      if (disabled) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      dragDepthRef.current += 1;
      setIsDragActive(true);
    },
    [disabled],
  );

  const onDragLeave = useCallback(
    (event: DragEvent) => {
      if (disabled) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
      if (dragDepthRef.current === 0) {
        setIsDragActive(false);
      }
    },
    [disabled],
  );

  const onDragOver = useCallback(
    (event: DragEvent) => {
      if (disabled) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
    },
    [disabled],
  );

  const onDrop = useCallback(
    (event: DragEvent) => {
      if (disabled) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      dragDepthRef.current = 0;
      setIsDragActive(false);

      const picked = pickComposerImageFile(event.dataTransfer.files);
      if (picked) {
        onFile(picked);
        return;
      }

      if (event.dataTransfer.files.length > 0) {
        onInvalidFile?.();
      }
    },
    [disabled, onFile, onInvalidFile],
  );

  return {
    isDragActive,
    dropZoneProps: {
      onDragEnter,
      onDragLeave,
      onDragOver,
      onDrop,
    },
  };
}
