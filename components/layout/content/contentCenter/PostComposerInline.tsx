import Image from "next/image";
import { useRef, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { IconPhoto, IconX } from "@tabler/icons-react";
import TagsInput from "./TagsInput";
import {
  COMPOSER_IMAGE_ACCEPT,
  pickComposerImageFile,
} from "@/src/composerImageFile";
import { useComposerImageDrop } from "@/src/useComposerImageDrop";

interface PostComposerInlineProps {
  showOnMobile?: boolean;
  avatarUrl: string;
  previewUrl: string | null;
  file: File | null;
  description: string;
  tags: string[];
  collectionIds: string[];
  listIds: string[];
  isSubmitting: boolean;
  canShare: boolean;
  fixedList?: { id: string; name: string };
  onDescriptionChange: (value: string) => void;
  onTagsChange: (value: string[]) => void;
  onCollectionIdsChange: (value: string[]) => void;
  onListIdsChange: (value: string[]) => void;
  onFileSelect: (file: File) => void;
  onClearFile: () => void;
  onSubmit: () => void;
}

export default function PostComposerInline({
  showOnMobile = false,
  avatarUrl,
  previewUrl,
  file,
  description,
  tags,
  collectionIds,
  listIds,
  isSubmitting,
  canShare,
  fixedList,
  onDescriptionChange,
  onTagsChange,
  onCollectionIdsChange,
  onListIdsChange,
  onFileSelect,
  onClearFile,
  onSubmit,
}: PostComposerInlineProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isDragActive, dropZoneProps } = useComposerImageDrop({
    onFile: onFileSelect,
    onInvalidFile: () => alert(t("composeDropInvalid")),
    disabled: isSubmitting,
  });

  const openFilePicker = () => {
    if (!isSubmitting) {
      fileInputRef.current?.click();
    }
  };

  const onFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = pickComposerImageFile(event.target.files);
    if (picked) {
      onFileSelect(picked);
    } else if (event.target.files && event.target.files.length > 0) {
      alert(t("composeDropInvalid"));
    }
    event.target.value = "";
  };

  return (
    <section
      className={`relative mb-4 overflow-hidden rounded-2xl border border-gray-200/80 bg-white ${showOnMobile ? "block" : "hidden lg:block"} ${
        isDragActive ? "border-58b4d1 ring-2 ring-58b4d1/20" : ""
      }`}
      {...dropZoneProps}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={COMPOSER_IMAGE_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={onFileInputChange}
      />

      {isDragActive ? (
        <div
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-2xl border-2 border-dashed border-58b4d1 bg-58b4d1/10"
          aria-live="polite"
        >
          <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-58b4d1 shadow-sm">
            {t("composeDropOverlay")}
          </span>
        </div>
      ) : null}

      <div className="flex gap-3 px-3 pb-2 pt-3 sm:px-4 sm:pt-4">
        <div className="shrink-0">
          <Image
            src={avatarUrl}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
            unoptimized
          />
        </div>

        <div className="min-w-0 flex-1">
          {!file ? (
            <button
              type="button"
              onClick={openFilePicker}
              disabled={isSubmitting}
              className="block w-full rounded-lg py-2.5 text-left text-lg leading-snug text-gray-500 transition-colors hover:text-58b4d1 disabled:opacity-60"
            >
              {t("composePlaceholder")}
            </button>
          ) : (
            <div className="space-y-3">
              <textarea
                value={description}
                onChange={(event) => onDescriptionChange(event.target.value)}
                placeholder={t("enterDescription")}
                maxLength={80}
                rows={2}
                disabled={isSubmitting}
                className="w-full resize-none border-0 bg-transparent p-0 text-base leading-relaxed text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0"
              />

              <div className="relative overflow-hidden rounded-2xl border border-gray-100">
                <button
                  type="button"
                  onClick={onClearFile}
                  disabled={isSubmitting}
                  className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/65 text-white transition hover:bg-black/80 disabled:opacity-60"
                  aria-label={t("hide")}
                >
                  <IconX size={18} stroke={2} />
                </button>
                <Image
                  src={previewUrl || "/profile.jpg"}
                  alt=""
                  width={600}
                  height={400}
                  className="max-h-[min(320px,50vh)] w-full object-cover"
                  unoptimized
                />
              </div>

              <TagsInput
                description={description}
                onDescriptionChange={onDescriptionChange}
                tags={tags}
                onTagsChange={onTagsChange}
                collectionIds={collectionIds}
                onCollectionIdsChange={onCollectionIdsChange}
                listIds={listIds}
                onListIdsChange={onListIdsChange}
                onSubmit={onSubmit}
                isSubmitting={isSubmitting}
                compact
                hideSubmit
                hideDescription
                lockedList={fixedList}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2 sm:px-4">
        <button
          type="button"
          onClick={openFilePicker}
          disabled={isSubmitting}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-58b4d1 transition-colors hover:bg-58b4d1/10 disabled:opacity-50"
          aria-label={t("uploadTitle")}
        >
          <IconPhoto size={22} stroke={1.5} />
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!canShare}
          className={`rounded-full px-5 py-1.5 text-sm font-bold text-white transition-colors ${
            canShare
              ? "bg-58b4d1 hover:bg-[#4aa3c4]"
              : "pointer-events-none bg-58b4d1/40"
          }`}
        >
          {isSubmitting ? "..." : t("share")}
        </button>
      </div>
    </section>
  );
}
