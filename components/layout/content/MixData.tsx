import PostList from "./contentCenter/post/PostList";
import { useState, useEffect } from "react";
import { entryList } from "@/configs/client-services";
import Skeleton from "@/components/Skeleton";
import { DEFAULT_AVATAR_SRC } from "@/src/avatarUrl";
import { useTranslation } from "react-i18next";

interface EntryProps {
  category: number,
  categoryName?: string,
  commentCount: number,
  id: string,
  subject: string,
  userName: string,
  createDate: string
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
      .catch((x) => {
        alert("Bir hata oldu.");
      });
  }, []);

  return (
    <>
      <button className='relative mb-2 left-1/2 -translate-x-1/2  rounded p-2 text-gray-400 border border-gray-200 bg-white cursor-pointer text-xs lg:text-sm font-bold w-full'>
        32 {t("newPost")}
      </button>
      <div className={`${entryListing.length > 0 && 'hidden'} mt-4`}> <Skeleton /></div>
      {entryListing.map((x) => {
        return (
          <>
            <PostList
              postId={x.id}
              userName={x.userName}
              userLink={`/${x.userName}`}
              postLink={`/${x.userName}/posts/${x.id}`}
              profileImage={DEFAULT_AVATAR_SRC}
              time={x.createDate}
              image={`/postExample/F5Z00CEaEAAFPgi.jpg`}
              commentCount={x.commentCount}
              pikCount={3}
              key={x.id}
              admin={false}
              postTitle={x.subject}
              profile={false}
              collectionItem={false}
              onDeleted={() =>
                setEntryListing((prev) => prev.filter((e) => e.id !== x.id))
              }
            />
          </>
        )
      })}
    </>
  );
}
