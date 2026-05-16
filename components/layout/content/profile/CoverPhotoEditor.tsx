import { FileButton } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconPhotoEdit } from "@tabler/icons-react";
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
} from "react";
import { useTranslation } from "react-i18next";
import {
  centerCoverOffset,
  clampCoverOffset,
  computeCoverLayout,
  exportCoverCrop,
  loadImageElement,
  type CoverLayout,
  type CoverOffset,
} from "@/src/coverPhotoCrop";
import { optimizeProfileImage } from "@/src/profileImage";

export interface CoverPhotoEditorHandle {
  getCroppedDataUrl: () => Promise<string | null>;
  hasPendingChanges: () => boolean;
}

interface CoverPhotoEditorProps {
  imageUrl: string;
  minHeight?: number;
  className?: string;
}

const CoverPhotoEditor = forwardRef<CoverPhotoEditorHandle, CoverPhotoEditorProps>(
  function CoverPhotoEditor({ imageUrl, minHeight = 200, className = "" }, ref) {
    const { t } = useTranslation();
    const viewportRef = useRef<HTMLDivElement>(null);
    const fileResetRef = useRef<() => void>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);

    const [viewportSize, setViewportSize] = useState({ w: 0, h: minHeight });
    const [layout, setLayout] = useState<CoverLayout | null>(null);
    const [offset, setOffset] = useState<CoverOffset>({ x: 0, y: 0 });
    const [displaySrc, setDisplaySrc] = useState(imageUrl);
    const [dirty, setDirty] = useState(false);
    const [dragging, setDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0, ox: 0, oy: 0 });

    const measureViewport = useCallback(() => {
      const el = viewportRef.current;
      if (!el) return { w: 0, h: minHeight };
      const rect = el.getBoundingClientRect();
      return {
        w: Math.max(1, Math.round(rect.width)),
        h: Math.max(minHeight, Math.round(rect.height)),
      };
    }, [minHeight]);

    const syncLayout = useCallback(
      (img: HTMLImageElement, vw: number, vh: number, resetPosition: boolean) => {
        const nextLayout = computeCoverLayout(
          img.naturalWidth,
          img.naturalHeight,
          vw,
          vh,
        );
        imageRef.current = img;
        setLayout(nextLayout);
        setOffset((prev) =>
          resetPosition
            ? centerCoverOffset(nextLayout)
            : clampCoverOffset(prev.x, prev.y, nextLayout),
        );
      },
      [],
    );

    useEffect(() => {
      const el = viewportRef.current;
      if (!el) return undefined;

      const update = () => setViewportSize(measureViewport());
      update();
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => ro.disconnect();
    }, [measureViewport]);

    useEffect(() => {
      let cancelled = false;

      const load = async () => {
        try {
          const img = await loadImageElement(imageUrl);
          if (cancelled) return;
          const size = measureViewport();
          const vw = size.w > 0 ? size.w : 600;
          const vh = size.h > 0 ? size.h : minHeight;
          setDisplaySrc(imageUrl);
          syncLayout(img, vw, vh, true);
          setDirty(false);
        } catch {
          if (!cancelled) {
            setDisplaySrc(imageUrl);
            imageRef.current = null;
            setLayout(null);
          }
        }
      };

      void load();

      return () => {
        cancelled = true;
      };
    }, [imageUrl, measureViewport, minHeight, syncLayout]);

    useEffect(() => {
      const img = imageRef.current;
      if (!img || viewportSize.w <= 0) return;
      syncLayout(img, viewportSize.w, viewportSize.h, false);
    }, [viewportSize.w, viewportSize.h, syncLayout]);

    const handleFile = async (file: File | null) => {
      if (!file) return;

      try {
        const optimized = await optimizeProfileImage(file, {
          maxDimension: 2400,
          maxBytes: 3 * 1024 * 1024,
        });
        const img = await loadImageElement(optimized);
        const size = measureViewport();
        const vw = size.w > 0 ? size.w : 600;
        const vh = size.h > 0 ? size.h : minHeight;
        setDisplaySrc(optimized);
        syncLayout(img, vw, vh, true);
        setDirty(true);
      } catch {
        showNotification({
          title: "Hata",
          message: "Kapak fotografi islenemedi.",
          color: "red",
        });
      }
    };

    const onPointerDown = (event: React.PointerEvent) => {
      if (!layout) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
      dragStartRef.current = {
        x: event.clientX,
        y: event.clientY,
        ox: offset.x,
        oy: offset.y,
      };
    };

    const onPointerMove = (event: React.PointerEvent) => {
      if (!dragging || !layout) return;
      const dx = event.clientX - dragStartRef.current.x;
      const dy = event.clientY - dragStartRef.current.y;
      setOffset(
        clampCoverOffset(
          dragStartRef.current.ox + dx,
          dragStartRef.current.oy + dy,
          layout,
        ),
      );
      setDirty(true);
    };

    const onPointerUp = (event: React.PointerEvent) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      setDragging(false);
    };

    useImperativeHandle(ref, () => ({
      hasPendingChanges: () => dirty,
      getCroppedDataUrl: async () => {
        if (!dirty || !imageRef.current || !layout || viewportSize.w <= 0) {
          return null;
        }
        return exportCoverCrop(
          imageRef.current,
          offset,
          layout,
          viewportSize.w,
          viewportSize.h,
        );
      },
    }));

    return (
      <div
        ref={viewportRef}
        className={`group relative z-0 w-full overflow-hidden rounded-t-xl bg-gray-900 shadow-inner ${className}`}
        style={{ minHeight }}
        onPointerMove={layout ? onPointerMove : undefined}
        onPointerUp={layout ? onPointerUp : undefined}
        onPointerCancel={layout ? onPointerUp : undefined}
      >
        {layout && displaySrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displaySrc}
            alt=""
            draggable={false}
            className={`absolute left-0 top-0 max-w-none select-none touch-none ${
              dragging ? "cursor-grabbing" : "cursor-grab"
            }`}
            style={{
              width: layout.displayWidth,
              height: layout.displayHeight,
              transform: `translate(${offset.x}px, ${offset.y}px)`,
            }}
            onPointerDown={onPointerDown}
          />
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url("${displaySrc}")` }}
            aria-hidden
          />
        )}

        <div className="pointer-events-none absolute inset-0 z-[1] bg-black/30 opacity-0 transition-opacity group-hover:opacity-100" />

        <div className="pointer-events-none absolute inset-0 z-[2] flex flex-col items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <p className="px-4 text-center text-xs font-semibold text-white drop-shadow">
            {t("coverPhotoDragHint")}
          </p>
          <FileButton
            resetRef={fileResetRef}
            onChange={handleFile}
            accept="image/png,image/jpeg,image/webp"
          >
            {(props) => (
              <button
                type="button"
                className="pointer-events-auto rounded-full bg-white p-3 text-126782 shadow-card transition-shadow hover:shadow-card-hover"
                title={t("coverPhotoChange")}
                {...props}
              >
                <IconPhotoEdit color="#58b4d1" size={28} />
              </button>
            )}
          </FileButton>
        </div>
      </div>
    );
  },
);

export default CoverPhotoEditor;
