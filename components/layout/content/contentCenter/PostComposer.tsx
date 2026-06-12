import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { FileButton } from "@mantine/core";
import PostComposerInline from "./PostComposerInline";
import TagsInput from "./TagsInput";
import { useTranslation } from "react-i18next";
import { IconPhoto, IconX } from "@tabler/icons-react";
import {
  addPostToCollection,
  addPostToList,
  createPost,
} from "@/configs/client-services";
import { dispatchPostCreated } from "@/src/postCreatedEvent";
import { buildCreatedExplorePost } from "@/src/buildCreatedExplorePost";
import { pickAvatarUrlFromMap } from "@/src/avatarUrl";
import { fileToImageDataUrl } from "@/src/imageDataUrl";
import { fetchAuthProfile } from "@/src/fetchAuthProfile";
import { pickComposerImageFile } from "@/src/composerImageFile";
import { useComposerImageDrop } from "@/src/useComposerImageDrop";

export interface CreatedPostPayload {
  id: string;
}

interface PostComposerProps {
  onCreated?: (post?: CreatedPostPayload) => void;
  variant?: "modal" | "inline";
  fixedList?: { id: string; name: string };
  showOnMobile?: boolean;
}

export default function PostComposer({
  onCreated,
  variant = "modal",
  fixedList,
  showOnMobile = false,
}: PostComposerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [collectionIds, setCollectionIds] = useState<string[]>([]);
  const [listIds, setListIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("/logo.png");
  const resetRef = useRef<() => void>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const { t } = useTranslation();

  const isInline = variant === "inline";

  const {
    isDragActive: modalIsDragActive,
    dropZoneProps: modalDropZoneProps,
  } = useComposerImageDrop({
    onFile: setFile,
    onInvalidFile: () => alert(t("composeDropInvalid")),
    disabled: isSubmitting || isInline,
    globalPaste: !isInline,
  });
  const isDragActive = modalIsDragActive;

  useEffect(() => {
    if (fixedList?.id) {
      setListIds([fixedList.id]);
    }
  }, [fixedList?.id]);

  useEffect(() => {
    if (!isInline) {
      return;
    }

    let cancelled = false;

    fetchAuthProfile()
      .then((result) => {
        if (!cancelled && result.ok && result.data?.avatarUrls) {
          setAvatarUrl(pickAvatarUrlFromMap(result.data.avatarUrls));
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [isInline]);

  const clearFile = () => {
    setFile(null);
    setDescription("");
    setTags([]);
    setCollectionIds([]);
    setListIds(fixedList?.id ? [fixedList.id] : []);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    resetRef.current?.();
  };

  const onModalFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = pickComposerImageFile(event.target.files);
    if (selected) {
      setFile(selected);
    } else if (event.target.files && event.target.files.length > 0) {
      alert(t("composeDropInvalid"));
    }
    event.target.value = "";
  };

  const openModalFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!file || tags.length === 0 || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);

      const profileRes = await fetchAuthProfile();
      if (!profileRes.ok) {
        alert(t("followedFeedLoginHint"));
        return;
      }
      const imageData = await fileToImageDataUrl(file);

      const response = await createPost({
        params: {
          description,
          tags,
          imageData,
        },
      });

      const postId = response.data?.post?.id;
      if (!postId) {
        throw new Error("Post olusturulamadi");
      }

      const associationErrors: string[] = [];

      await Promise.all(
        collectionIds.map(async (collectionId) => {
          try {
            await addPostToCollection(collectionId, postId);
          } catch {
            associationErrors.push("collection");
          }
        }),
      );

      await Promise.all(
        listIds.map(async (listId) => {
          try {
            await addPostToList(listId, postId);
          } catch {
            associationErrors.push("list");
          }
        }),
      );

      if (associationErrors.length > 0) {
        alert(t("postAssociationPartialError"));
      }

      const payload = { id: String(postId) };
      const explorePost = buildCreatedExplorePost({
        postId: payload.id,
        apiPost: response.data?.post,
        profile: profileRes.data!,
        description,
        tagNames: tags,
      });
      dispatchPostCreated({ postId: payload.id, post: explorePost });
      clearFile();
      onCreated?.(payload);
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response
          ?.data?.message === "string"
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : t("postCreateFailed");

      alert(message || t("postCreateFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const canShare = Boolean(file) && tags.length > 0 && !isSubmitting;

  const renderFileButton = (children: ReactNode, className?: string) => (
    <FileButton
      resetRef={resetRef}
      onChange={setFile}
      accept="image/png,image/jpeg"
    >
      {(props) => (
        <button type="button" className={className} {...props}>
          {children}
        </button>
      )}
    </FileButton>
  );

  if (isInline) {
    return (
      <PostComposerInline
        showOnMobile={showOnMobile}
        avatarUrl={avatarUrl}
        previewUrl={previewUrl}
        file={file}
        description={description}
        tags={tags}
        collectionIds={collectionIds}
        listIds={listIds}
        isSubmitting={isSubmitting}
        canShare={canShare}
        fixedList={fixedList}
        onDescriptionChange={setDescription}
        onTagsChange={setTags}
        onCollectionIdsChange={setCollectionIds}
        onListIdsChange={setListIds}
        onFileSelect={setFile}
        onClearFile={clearFile}
        onSubmit={handleSubmit}
      />
    );
  }


  return (
    <div
      data-composer-dropzone
      className={`flex w-full max-w-full flex-col items-stretch rounded-2xl border border-gray-200/80 bg-white p-3 shadow-card sm:p-4 ${
        isDragActive ? "border-58b4d1 ring-2 ring-58b4d1/30" : ""
      }`}
      {...modalDropZoneProps}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={onModalFileChange}
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

      {file ? (
        // === Paket A: iki sütunlu düzen ===
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.1fr_1fr]">
          {/* SOL — görsel */}
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={clearFile}
              disabled={isSubmitting}
              className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-500 shadow-md transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-60"
              aria-label={t("hide")}
            >
              <IconX size={18} stroke={2} />
            </button>
            <Image
              className="max-h-[min(360px,55vh)] w-full object-cover"
              width={600}
              height={400}
              src={previewUrl || "/profile.jpg"}
              alt=""
              unoptimized
            />
          </div>

          {/* SAĞ — form */}
          <div className="flex min-w-0 flex-col gap-3">
            <TagsInput
              description={description}
              onDescriptionChange={setDescription}
              tags={tags}
              onTagsChange={setTags}
              collectionIds={collectionIds}
              onCollectionIdsChange={setCollectionIds}
              listIds={listIds}
              onListIdsChange={setListIds}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              lockedList={fixedList}
            />
          </div>
        </div>
      ) : (
        <div className="w-full py-6 text-center">
          <p className="mb-3 text-sm font-medium text-58b4d1">
            {t("uploadTitle")}
          </p>
          <button
            type="button"
            onClick={openModalFilePicker}
            className="mx-auto flex items-center gap-2 rounded-full border border-58b4d1 px-5 py-2 text-sm font-semibold text-58b4d1 transition-colors hover:bg-58b4d1 hover:text-white"
          >
            <IconPhoto size={20} stroke={1.5} />
            <span>{t("loadPikcir")}</span>
          </button>
          <p className="mt-2 text-xs text-gray-400">{t("composeDropOverlay")}</p>
        </div>
      )}
    </div>
  );
}
