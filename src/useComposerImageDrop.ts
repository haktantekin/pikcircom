import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ClipboardEvent as ReactClipboardEvent,
  type DragEvent,
} from "react";
import {
  isExternalComposerPasteTarget,
  pickComposerImageFile,
  pickComposerImageFromClipboard,
} from "@/src/composerImageFile";

type UseComposerImageDropOptions = {
  onFile: (file: File) => void;
  onInvalidFile?: () => void;
  disabled?: boolean;
  /** Sayfa genelinde Ctrl+V ile görsel yapıştırma (Twitter tarzı) */
  globalPaste?: boolean;
};

export function useComposerImageDrop({
  onFile,
  onInvalidFile,
  disabled = false,
  globalPaste = false,
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

  const handlePaste = useCallback(
    (event: globalThis.ClipboardEvent) => {
      if (disabled) {
        return;
      }

      if (isExternalComposerPasteTarget(event.target)) {
        return;
      }

      const picked = pickComposerImageFromClipboard(event.clipboardData);
      if (picked) {
        event.preventDefault();
        onFile(picked);
        return;
      }

      if (event.clipboardData?.files && event.clipboardData.files.length > 0) {
        onInvalidFile?.();
      }
    },
    [disabled, onFile, onInvalidFile],
  );

  const onPaste = useCallback(
    (event: ReactClipboardEvent) => {
      handlePaste(event.nativeEvent);
    },
    [handlePaste],
  );

  useEffect(() => {
    if (disabled || !globalPaste) {
      return undefined;
    }

    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [disabled, globalPaste, handlePaste]);

  return {
    isDragActive,
    dropZoneProps: {
      onDragEnter,
      onDragLeave,
      onDragOver,
      onDrop,
      onPaste,
    },
  };
}
