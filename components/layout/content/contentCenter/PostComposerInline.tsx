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

const DESCRIPTION_MAX = 160;

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
    globalPaste: true,
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

  const descriptionLength = description.length;
  const descriptionOver = descriptionLength > DESCRIPTION_MAX;
  const remaining = Math.max(0, DESCRIPTION_MAX - descriptionLength);

  return (
    <section
      data-composer-dropzone
      className={`relative mb-4 rounded-2xl border border-gray-200 bg-white shadow-card ${showOnMobile ? "block" : "hidden lg:block"} ${
        isDragActive ? "border-58b4d1 ring-2 ring-58b4d1/30" : ""
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

      <div className="px-3 pb-2 pt-3 sm:px-4 sm:pt-4">
        <div className="min-w-0">
          {!file ? (
            <button
              type="button"
              onClick={openFilePicker}
              disabled={isSubmitting}
              className="block w-full rounded-xl bg-transparent px-1 py-2 text-left text-[20px] font-light leading-tight text-gray-400 transition-colors hover:bg-gray-50/80 hover:text-gray-500 disabled:opacity-60 sm:text-[24px]"
            >
              {t("composePlaceholder")}
            </button>
          ) : (
            <div className="flex min-w-0 flex-col gap-3">
              <div className="relative">
                <Image
                  src={avatarUrl}
                  alt=""
                  width={40}
                  height={40}
                  className="pointer-events-none absolute left-3 top-2.5 h-10 w-10 rounded-full object-cover"
                  unoptimized
                />
                <textarea
                  value={description}
                  onChange={(event) =>
                    onDescriptionChange(
                      event.target.value.slice(0, DESCRIPTION_MAX),
                    )
                  }
                  placeholder={t("enterDescription")}
                  maxLength={DESCRIPTION_MAX}
                  rows={2}
                  disabled={isSubmitting}
                  className={`peer w-full resize-none rounded-lg border bg-white pb-6 pl-14 pr-3 pt-3 text-[15px] leading-relaxed text-gray-900 placeholder:text-gray-400 focus:border-58b4d1 focus:outline-none focus:ring-2 focus:ring-58b4d1/30 disabled:opacity-60 ${
                    descriptionOver ? "border-red-300" : "border-gray-200"
                  }`}
                />
                <div
                  className={`pointer-events-none absolute bottom-1.5 right-2 flex items-center gap-2 text-[10px] transition-opacity ${
                    descriptionOver || remaining <= 10
                      ? "opacity-100"
                      : "opacity-0 peer-hover:opacity-100 peer-focus:opacity-100"
                  }`}
                >
                  {descriptionOver ? (
                    <span className="font-semibold text-red-500">
                      {t("charLimitHint", { count: DESCRIPTION_MAX })}
                    </span>
                  ) : null}
                  <span
                    className={
                      descriptionOver
                        ? "font-semibold text-red-500"
                        : remaining <= 10
                          ? "text-orange-500"
                          : "text-gray-400"
                    }
                  >
                    {descriptionLength}/{DESCRIPTION_MAX}
                  </span>
                </div>
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
                hideLists
                hideCollections
                sideBySideTaxonomy
                tagPickerAsChips
                lockedList={fixedList}
              />

              <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                <button
                  type="button"
                  onClick={onClearFile}
                  disabled={isSubmitting}
                  className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-500 shadow-md transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-60"
                  aria-label={t("hide")}
                >
                  <IconX size={18} stroke={2} />
                </button>
                <Image
                  src={previewUrl || "/profile.jpg"}
                  alt=""
                  width={600}
                  height={400}
                  className="max-h-[min(360px,55vh)] w-full object-cover"
                  unoptimized
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer: dosya seçildikten sonra sadece Paylaş, tek satır */}
      {file ? (
        <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-white px-3 py-2 sm:px-4">
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canShare}
            className={`min-w-[140px] rounded-full px-5 py-2 text-sm font-bold transition-colors ${
              canShare
                ? "bg-58b4d1 text-white hover:bg-[#4aa3c4] active:scale-[0.98]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? (
              <span className="inline-flex items-center justify-center gap-2">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                {t("feedLoadingMore")}
              </span>
            ) : (
              t("share")
            )}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2 sm:px-4">
          <button
            type="button"
            onClick={openFilePicker}
            disabled={isSubmitting}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-58b4d1 transition-colors hover:bg-58b4d1/10 disabled:opacity-50"
            aria-label={t("loadPikcir")}
          >
            <IconPhoto size={18} stroke={1.7} />
          </button>
          <button
            type="button"
            disabled
            className="rounded-full bg-gray-200 px-5 py-2 text-sm font-bold text-gray-400 cursor-not-allowed"
          >
            {t("share")}
          </button>
        </div>
      )}
    </section>
  );
}
