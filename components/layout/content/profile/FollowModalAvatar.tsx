import Image from "next/image";
import { pickAvatarUrlFromMap } from "@/src/avatarUrl";

interface FollowModalAvatarProps {
  avatarUrls?: Record<string, string>;
  userName?: string;
}

/** Takipçi/takip modalları: avatar yoksa site logosu. */
export default function FollowModalAvatar({ avatarUrls, userName }: FollowModalAvatarProps) {
  const src = pickAvatarUrlFromMap(avatarUrls);
  const label = userName ? `@${userName}` : "Profil fotoğrafı";

  return (
    <Image
      alt={label}
      src={src}
      width={36}
      height={36}
      unoptimized={/^https?:\/\//i.test(src)}
      className="h-9 w-9 shrink-0 rounded-full border border-white object-cover bg-white"
    />
  );
}
