import { Modal, Tabs, TextInput, Loader } from "@mantine/core";
import { IconAbc } from "@tabler/icons-react";
import { useEffect, useState } from "react";
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
  const [period, setPeriod] = useState<ListPeriod>("today");
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
    <div className="col-span-12 lg:col-span-7 relative mb-4 mt-4 lg:mt-0">
      <Tabs value={period} onTabChange={(value) => setPeriod((value as ListPeriod) || "all")}>
        <div
          className="w-full bg-white rounded mt-4 lg:mt-0 min-h-[40px] flex justify-between items-center px-4"
          style={{ boxShadow: "rgba(33, 35, 38, 0.1) 0px 10px 10px -10px" }}
        >
          <h1 className="text-sm lg:text-base text-left">
            <span className="font-bold text-58b4d1">{t("pikList")}</span>
          </h1>
          <Tabs.List className="w-full justify-around border-b-0 tab-active">
            <Tabs.Tab value="today">{t("today")}</Tabs.Tab>
            <Tabs.Tab value="yesterday">{t("yesterday")}</Tabs.Tab>
            <Tabs.Tab value="all">{t("all")}</Tabs.Tab>
          </Tabs.List>
        </div>

        {(["today", "yesterday", "all"] as ListPeriod[]).map((tab) => (
          <Tabs.Panel key={tab} value={tab} pt="xs">
            <button
              type="button"
              className="font-bold text-58b4d1 text-base py-4 w-full text-center"
              onClick={() => setNewListModal(true)}
            >
              {t("createNewList")}
            </button>
            {createMessage && tab === period && (
              <p className="text-sm text-center text-gray-600 mb-2">{createMessage}</p>
            )}
            {isLoading ? (
              <div className="mt-4">
                <Skeleton />
              </div>
            ) : lists.length === 0 ? (
              <p className="text-sm text-center text-gray-500 py-8">{t("listEmpty")}</p>
            ) : (
              <section className="w-full flex flex-col gap-5">
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
        title={t("createList")}
      >
        <div className="mt-2">
          <TextInput
            icon={<IconAbc size={15} />}
            type="text"
            label={t("listName")}
            value={listName}
            onChange={(e) => setListName(e.currentTarget.value)}
          />
        </div>
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={handleCreate}
            disabled={!listName.trim() || isCreating}
            className={`w-full max-w-[120px] min-h-[36px] rounded font-bold text-white text-sm ${!listName.trim() || isCreating ? "bg-gray-300 pointer-events-none" : "bg-58b4d1"}`}
          >
            {isCreating ? <Loader size="sm" color="white" /> : t("create")}
          </button>
        </div>
      </Modal>
    </div>
  );
}
