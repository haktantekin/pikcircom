import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { FileButton } from "@mantine/core";
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
  const { t } = useTranslation();

  const isInline = variant === "inline";

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
    const selected = event.target.files?.[0];
    if (selected) {
      setFile(selected);
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
        previewImageUrl: previewUrl,
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
      <section
        className={`mb-4 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-card ${showOnMobile ? "block" : "hidden lg:block"}`}
        style={{ boxShadow: "rgba(33, 35, 38, 0.06) 0px 4px 12px -4px" }}
      >
        <div className="flex gap-3 p-3 sm:p-4">
          <div className="shrink-0 pt-0.5">
            <Image
              src={avatarUrl}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 rounded-full border border-gray-100 object-cover"
              unoptimized
            />
          </div>

          <div className="min-w-0 flex-1">
            {!file ? (
              renderFileButton(
                <span className="block w-full py-2.5 text-left text-base leading-snug text-gray-500 transition-colors hover:text-58b4d1">
                  {t("composePlaceholder")}
                </span>,
                "w-full",
              )
            ) : (
              <div className="space-y-3">
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
                  compact
                  hideSubmit
                  lockedList={fixedList}
                />

                <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                  <button
                    type="button"
                    onClick={clearFile}
                    className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                    aria-label={t("hide")}
                  >
                    <IconX size={16} stroke={2} />
                  </button>
                  <Image
                    src={previewUrl || "/profile.jpg"}
                    alt=""
                    width={600}
                    height={400}
                    className="max-h-[280px] w-full object-cover"
                    unoptimized
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2 sm:px-4">
          <div className="flex items-center gap-1">
            {renderFileButton(
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full text-58b4d1 transition-colors hover:bg-58b4d1/10">
                <IconPhoto size={22} stroke={1.5} />
              </span>,
            )}
          </div>

          {file && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canShare}
              className={`rounded-full px-5 py-1.5 text-sm font-bold text-white transition-colors ${
                canShare
                  ? "bg-58b4d1 hover:bg-[#4aa3c4]"
                  : "pointer-events-none bg-gray-300"
              }`}
            >
              {isSubmitting ? "..." : t("share")}
            </button>
          )}
        </div>
      </section>
    );
  }

  return (
    <div className="flex w-full max-w-full flex-col items-center">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={onModalFileChange}
      />
      {file && (
        <div className="relative w-full">
          <div className="absolute left-2 top-2 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-58b4d1 text-white">
            <button type="button" onClick={clearFile} className="leading-0">
              <span className="relative -top-px text-white">&times;</span>
            </button>
          </div>
          <Image
            className="max-h-[320px] max-w-full object-cover"
            width={300}
            height={200}
            src={previewUrl || "/profile.jpg"}
            alt=""
            unoptimized
          />
        </div>
      )}
      {!file && (
        <div className="w-full py-2 text-center">
          <p className="mb-3 text-sm text-58b4d1">{t("uploadTitle")}</p>
          <button
            type="button"
            onClick={openModalFilePicker}
            className="mx-auto flex rounded border border-58b4d1 px-4 py-2 text-58b4d1 transition-colors hover:bg-58b4d1 hover:text-white"
          >
            <IconPhoto size={22} />
          </button>
        </div>
      )}
      {file && (
        <div className="mt-4 flex w-full max-w-[700px] flex-col gap-4">
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
      )}
    </div>
  );
}
