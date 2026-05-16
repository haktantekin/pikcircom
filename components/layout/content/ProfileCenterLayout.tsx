import ProfileContent from "./profile/ProfileContent";
import ProfileHeader from "./profile/ProfileHeader";
import type { ProfileTab } from "@/src/profilePaths";

interface FollowingUserModelProps {
  followedId: string;
  followedUserName: string;
  displayName?: string;
  avatarUrls?: Record<string, string>;
  isFollowing: boolean;
}

interface FollowerUserModelProps {
  followerId: string;
  followerUserName: string;
  displayName?: string;
  avatarUrls?: Record<string, string>;
  isFollowed: boolean;
}

interface EntryProps {
  id: string;
  category?: number;
  categoryName?: string;
  commentCount?: number;
  favoriteCount?: number;
  subject?: string;
  userName?: string;
  createDate?: string;
  image?: string;
  profileImage?: string;
}

interface CollectionProps {
  id: string;
  name: string;
  link?: string;
  item?: string[];
  count?: number;
  postIds?: number[];
  posts?: EntryProps[];
}

interface ProfileLayoutUser {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  userName?: string;
  userDescription?: string;
  phoneNumber?: string;
  birthDate?: string;
  avatarUrls?: Record<string, string>;
  coverUrls?: Record<string, string>;
  coverImageUrl?: string | null;
  followedCount?: number;
  followersCount?: number;
  followeds?: unknown[];
  followers?: unknown[];
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  followsYou?: boolean;
  posts?: EntryProps[];
  favoritePosts?: EntryProps[];
  collections?: CollectionProps[];
}

interface ProfileCenterLayoutProps {
  user?: ProfileLayoutUser;
  userCheck: number;
  activeTab?: ProfileTab;
  onProfileUpdated?: () => void;
  readOnly?: boolean;
}

export default function ProfileCenterLayout({
  user,
  userCheck,
  activeTab = "piklerim",
  onProfileUpdated,
  readOnly = false,
}: ProfileCenterLayoutProps) {
  return (
    <div className="col-span-12 lg:col-span-7 relative mb-4 mt-4 lg:mt-0">
      {userCheck === 2 && (
        <>
          <div className="bg-white flex justify-center items-center min-h-[100px] px-24 text-center text-sm">
            <span>
              Görünüşe göre boş bir kullanıcı adı yakaladın. <br />{" "}
              <span className="font-bold text-58b4d1 w-auto p-0 m-0">Piki</span>{" "}
              seni bekliyor!
            </span>
          </div>
        </>
      )}
      {userCheck === 1 && (
        <>
          <ProfileHeader
            key={`profile-header-${user?.userName ?? "anon"}`}
            user={user}
            onProfileUpdated={onProfileUpdated}
            readOnly={readOnly}
          />
          <ProfileContent
            key={`profile-content-${user?.userName ?? "anon"}-${activeTab}`}
            user={user}
            activeTab={activeTab}
            readOnly={readOnly}
          />
        </>
      )}
    </div>
  );
}
