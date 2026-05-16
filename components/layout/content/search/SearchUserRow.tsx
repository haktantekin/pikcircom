import Image from "next/image";
import Link from "next/link";
import { profilePath } from "@/src/profilePaths";
import {
  pickAvatarUrlFromMap,
  resolveProfileImageUrl,
} from "@/src/avatarUrl";
import type { SearchUserItem } from "@/src/searchTypes";

interface SearchUserRowProps {
  user: SearchUserItem;
}

export default function SearchUserRow({ user }: SearchUserRowProps) {
  const href = profilePath(user.userName);

  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:border-58b4d1"
    >
      <Image
        src={resolveProfileImageUrl(
          typeof user.profileImage === "string"
            ? user.profileImage
            : pickAvatarUrlFromMap(
                user.avatarUrls && typeof user.avatarUrls === "object"
                  ? user.avatarUrls
                  : null,
              ),
        )}
        alt=""
        width={48}
        height={48}
        className="h-12 w-12 shrink-0 rounded-full object-cover"
        unoptimized
      />
      <div>
        <p className="font-bold text-126782">@{user.userName}</p>
        {user.displayName && user.displayName !== user.userName ? (
          <p className="text-sm text-gray-500">{user.displayName}</p>
        ) : null}
      </div>
    </Link>
  );
}
