import Link from "next/link";
import { ScrollArea } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useState } from "react";
import { addPostToList, getLists } from "@/configs/client-services";
interface ListSummary {
  id: string;
  name: string;
  slug: string;
  postCount: number;
  previewImages: string[];
}

interface AddToListDrawerProps {
  postId?: string;
  opened?: boolean;
}

export default function AddToListDrawer({ postId, opened = true }: AddToListDrawerProps) {
  const { t } = useTranslation();
  const [lists, setLists] = useState<ListSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submittingListId, setSubmittingListId] = useState<string | null>(null);
  const [addedListIds, setAddedListIds] = useState<Set<string>>(new Set());

  const loadLists = useCallback(async () => {
    if (isLoading) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await getLists({ period: "all" });
      setLists(response.data?.lists ?? []);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  useEffect(() => {
    if (!opened) {
      return;
    }

    loadLists().catch(() => {
      return;
    });
  }, [loadLists, opened]);

  const handleAddPost = async (listId: string) => {
    if (!postId || submittingListId || addedListIds.has(listId)) {
      return;
    }

    try {
      setSubmittingListId(listId);
      await addPostToList(listId, postId);
      setAddedListIds((prev) => new Set(prev).add(listId));
    } catch (error: unknown) {
      const status =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { status?: number } }).response?.status === "number"
          ? (error as { response?: { status?: number } }).response?.status
          : undefined;

      if (status === 409) {
        setAddedListIds((prev) => new Set(prev).add(listId));
      }
    } finally {
      setSubmittingListId(null);
    }
  };

  return (
    <ScrollArea h={700}>
      {opened && isLoading && lists.length === 0 && (
        <p className="text-sm text-gray-500 py-4">...</p>
      )}
      {opened && !isLoading && lists.length === 0 && (
        <p className="text-sm text-343a40 py-4">{t("listEmpty")}</p>
      )}
      <ul>
        {lists.map((list) => {
          const alreadyAdded = addedListIds.has(list.id);

          return (
            <li className="flex justify-between border-b items-center min-h-[50px] gap-2" key={list.id}>
              <span className="text-sm font-bold text-202124 truncate">{list.name}</span>
              <button
                type="button"
                onClick={() => handleAddPost(list.id)}
                disabled={!postId || alreadyAdded || submittingListId === list.id}
                className={`${alreadyAdded ? "bg-003049" : "bg-58b4d1"} p-2 rounded font-bold text-white text-xs disabled:opacity-70 shrink-0`}
              >
                {alreadyAdded
                  ? t("alreadyAdded")
                  : submittingListId === list.id
                    ? "..."
                    : t("add")}
              </button>
            </li>
          );
        })}
      </ul>
      <Link href="/lists" className="font-bold text-58b4d1 text-sm mt-4 w-full text-center block">
        {t("pikList")}
      </Link>
    </ScrollArea>
  );
}
