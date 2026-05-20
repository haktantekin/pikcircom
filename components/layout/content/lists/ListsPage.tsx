import { Modal, Tabs, TextInput, Loader } from "@mantine/core";
import { IconAbc } from "@tabler/icons-react";
import { useEffect, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import ListItem from "./ListItem";
import { createList, getLists } from "@/configs/client-services";
import type { ListPeriod } from "@/src/listPaths";
import Skeleton from "@/components/Skeleton";

export interface ListSummary {
  id: string;
  name: string;
  slug: string;
  postCount: number;
  previewImages: string[];
}

export default function ListsPage() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<ListPeriod>("all");
  const [lists, setLists] = useState<ListSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newListModal, setNewListModal] = useState(false);
  const [listName, setListName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createMessage, setCreateMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const response = await getLists({ period });
        if (!cancelled) {
          setLists(response.data.lists ?? []);
        }
      } catch {
        if (!cancelled) {
          setLists([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [period]);

  const handleCreate = async () => {
    const name = listName.trim();
    if (!name || isCreating) {
      return;
    }

    try {
      setIsCreating(true);
      setCreateMessage("");
      await createList(name);
      setListName("");
      setNewListModal(false);
      setCreateMessage(t("listPendingMessage"));
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : t("listCreateFailed");
      setCreateMessage(message || t("listCreateFailed"));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="relative col-span-12 mb-4 mt-4 lg:col-span-7 lg:mt-0">
      <Tabs
        value={period}
        onTabChange={(value) => setPeriod((value as ListPeriod) || "all")}
        styles={
          {
            tab: {
              border: "none",
              borderBottom: "none",
              fontWeight: 500,
            },
            list: {
              border: "none",
              gap: 4,
              backgroundColor: "transparent",
            },
          } as Record<string, CSSProperties>
        }
      >
        <div className="mb-4 flex min-h-[52px] w-full flex-col gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-card sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <h1 className="shrink-0 text-sm font-bold text-58b4d1 lg:text-base">
            {t("pikList")}
          </h1>
          <Tabs.List className="hide-scrollbar flex w-full flex-nowrap justify-stretch gap-1 overflow-x-auto rounded-xl bg-gray-100/75 p-1 sm:w-auto sm:justify-end">
            <Tabs.Tab
              value="today"
              className="min-w-[4.5rem] flex-1 rounded-lg border-0 px-3 py-2 text-center text-xs text-gray-600 transition-colors hover:bg-white/60 hover:text-202124 data-[active]:bg-white data-[active]:font-semibold data-[active]:text-58b4d1 data-[active]:shadow-sm sm:min-w-0 sm:flex-none sm:text-sm"
            >
              {t("today")}
            </Tabs.Tab>
            <Tabs.Tab
              value="yesterday"
              className="min-w-[4.5rem] flex-1 rounded-lg border-0 px-3 py-2 text-center text-xs text-gray-600 transition-colors hover:bg-white/60 hover:text-202124 data-[active]:bg-white data-[active]:font-semibold data-[active]:text-58b4d1 data-[active]:shadow-sm sm:min-w-0 sm:flex-none sm:text-sm"
            >
              {t("yesterday")}
            </Tabs.Tab>
            <Tabs.Tab
              value="all"
              className="min-w-[4.5rem] flex-1 rounded-lg border-0 px-3 py-2 text-center text-xs text-gray-600 transition-colors hover:bg-white/60 hover:text-202124 data-[active]:bg-white data-[active]:font-semibold data-[active]:text-58b4d1 data-[active]:shadow-sm sm:min-w-0 sm:flex-none sm:text-sm"
            >
              {t("all")}
            </Tabs.Tab>
          </Tabs.List>
        </div>

        {(["today", "yesterday", "all"] as ListPeriod[]).map((tab) => (
          <Tabs.Panel key={tab} value={tab} pt="xs">
            <div className="mb-4 flex flex-col items-stretch gap-3">
              <button
                type="button"
                className="w-full rounded-xl border border-58b4d1/40 bg-white px-4 py-3 text-center text-sm font-bold text-58b4d1 shadow-sm transition-all hover:border-58b4d1 hover:bg-58b4d1/5 hover:shadow-card"
                onClick={() => setNewListModal(true)}
              >
                {t("createNewList")}
              </button>
            </div>
            {createMessage && tab === period && (
              <p className="mb-3 rounded-xl border border-gray-100 bg-white px-4 py-3 text-center text-sm text-gray-600 shadow-sm">
                {createMessage}
              </p>
            )}
            {isLoading ? (
              <div className="mt-2">
                <Skeleton />
              </div>
            ) : lists.length === 0 ? (
              <p className="rounded-xl border border-gray-100 bg-white px-6 py-10 text-center text-sm text-gray-500 shadow-card">
                {t("listEmpty")}
              </p>
            ) : (
              <section className="flex w-full flex-col gap-4">
                {lists.map((list) => (
                  <ListItem
                    key={list.id}
                    slug={list.slug}
                    name={list.name}
                    postCount={list.postCount}
                    previewImages={list.previewImages}
                  />
                ))}
              </section>
            )}
          </Tabs.Panel>
        ))}
      </Tabs>

      <Modal
        opened={newListModal}
        onClose={() => {
          setNewListModal(false);
          setListName("");
        }}
        centered
        radius="md"
        title={t("createList")}
      >
        <div className="mt-1">
          <TextInput
            icon={<IconAbc size={15} />}
            type="text"
            label={t("listName")}
            value={listName}
            onChange={(e) => setListName(e.currentTarget.value)}
          />
        </div>
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={handleCreate}
            disabled={!listName.trim() || isCreating}
            className={`min-h-[40px] w-full max-w-[200px] rounded-lg text-sm font-bold text-white shadow-sm transition-opacity ${
              !listName.trim() || isCreating
                ? "cursor-not-allowed bg-gray-300"
                : "bg-58b4d1 hover:bg-58b4d1/90"
            }`}
          >
            {isCreating ? <Loader size="sm" color="white" /> : t("create")}
          </button>
        </div>
      </Modal>
    </div>
  );
}
