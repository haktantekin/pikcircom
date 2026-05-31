import ProfileHeader from './../profile/ProfileHeader';
import PostItem from './PostItem';
import { IconArrowNarrowLeft } from '@tabler/icons-react';
import { DEFAULT_AVATAR_SRC } from "@/src/avatarUrl";
import { useTranslation } from "react-i18next";

export default function PostContent() {
  const { t } = useTranslation();
  return (
    <>
      <div className="col-span-12 lg:col-span-10 relative mb-4 mt-4 lg:mt-0">
        <ProfileHeader />
        <div className='w-full bg-white rounded mb-4 text-sm text-center min-h-[40px] flex justify-center items-center relative mt-3' style={{ boxShadow: "rgba(33, 35, 38, 0.1) 0px 10px 10px -10px" }}>
          <div className='font-bold text-sm text-126782'>{t("pikcirDetail")}</div>
          <button className="absolute left-4 top-2 flex justify-center items-center" onClick={() => history.back()}>
            <IconArrowNarrowLeft />
            <div className='font-bold text-xs text-343a40'>{t("goBack")}</div></button>
        </div>
        <PostItem
          userName={"natkahh"}
          userLink={"javascript:;"}
          profileImage={DEFAULT_AVATAR_SRC}
          time={"2023-05-21T10:11:00"}
          image={`/postExample/F5Z00CEaEAAFPgi.jpg`}
          commentCount={3}
          pikCount={3}
          admin={false}
          postTitle={"devamlı hata yapıyorumdur"}
        />
      </div>
    </>
  )
}
