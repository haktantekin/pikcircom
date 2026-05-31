import FeedMasonryGrid from "@/components/FeedMasonryGrid";
import { profilePostToMasonryCard } from "@/src/feedMasonryHelpers";
import { useEffect, useState } from "react";
import { entryList } from "@/configs/client-services";
import Skeleton from "@/components/Skeleton";
import { useTranslation } from "react-i18next";

interface EntryProps {
  category: number;
  categoryName?: string;
  commentCount: number;
  id: string;
  subject: string;
  userName: string;
  createDate: string;
}

export default function MixData() {
  const [entryListing, setEntryListing] = useState<EntryProps[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    entryList()
      .then((res) => {
        if (res.status === 200) {
          setEntryListing(res.data);
        }
      })
      .catch(() => {
        alert("Bir hata oldu.");
      });
  }, []);

  return (
    <>
      <button className="relative left-1/2 mb-2 w-full -translate-x-1/2 cursor-pointer rounded border border-gray-200 bg-white p-2 text-xs font-bold text-gray-400 lg:text-sm">
        32 {t("newPost")}
      </button>
      <div className={`${entryListing.length > 0 && "hidden"} mt-4`}>
        <Skeleton />
      </div>
      <FeedMasonryGrid
        posts={entryListing.map((x) =>
          profilePostToMasonryCard({
            id: x.id,
            subject: x.subject,
            userName: x.userName,
            categoryName: x.categoryName,
          }),
        )}
        resetKey="mix-data"
      />
    </>
  );
}
