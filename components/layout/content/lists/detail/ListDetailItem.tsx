import { IconAlarm } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { formatRelativeTime } from "@/src/formatRelativeTime";

interface ListDetailItemProps {
  link: string;
  image: string;
  user: string;
  time: string;
  title?: string;
}

export default function ListDetailItem({ link, image, user, time, title }: ListDetailItemProps) {
  const { i18n } = useTranslation();
  return (
    <>
      <div className="flex flex-col h-full justify-between">
        <Link href={link} className="rounded overflow-hidden hover:scale-105 transition-all ease-in-out delay-400 border border-126782 h-full object-fill">
          <Image src={image} alt="" width={300} height={300} className="!w-full !h-full" />
        </Link>
        {title && (
          <p className="text-sm text-202124 mt-2 line-clamp-2">{title}</p>
        )}
        <div className="flex justify-between items-center w-full mt-2">
          <Link href={link} className="text-126782 font-bold text-xs h-auto object-fill">
            {user}
          </Link>
          <div className="text-xs flex gap-1 justify-center items-center">
            <IconAlarm size={10} /> {formatRelativeTime(time, i18n.language)}
          </div>
        </div>
      </div>
    </>
  )
}
