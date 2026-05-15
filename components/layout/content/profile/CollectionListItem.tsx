import Image from "next/image"
import Link from "next/link"
import { useTranslation } from "react-i18next";
import CollectionSettings from "./CollectionSettings";


interface CollectionListItemProps {
  canManage?: boolean,
  name: string,
  link: string,
  item: string[],
  count: number,
  collectClick: () => void
  onUpdate?: (name: string) => Promise<void> | void
  onDelete?: () => Promise<void> | void
}

export default function CollectionListItem({ canManage = false, name, link, item, collectClick, onUpdate, onDelete }: CollectionListItemProps) {
  const { t } = useTranslation();
  return (
    <>
      <div className="w-full bg-white border rounded min-h-[200px] p-4 mb-4">
        <div className="flex justify-between px-2">
          <Link href={link}>
            <div className="font-bold text-base mb-3">
              {name}
            </div>
          </Link>
          {canManage && <CollectionSettings key={name} name={name} onUpdate={onUpdate} onDelete={onDelete} />}
        </div>
        <Link href={link}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {item.map((e, index) => (
              <div className="w-full rounded overflow-hidden" key={`${link}-thumb-${index}`}>
                <Image src={e} alt="" width={300} height={200} className="w-full object-cover h-full" />
              </div>
            ))}
          </div>
        </Link>
          <button className="font-bold font-base text-xs text-center mt-4 text-58b4d1 mx-auto flex" onClick={collectClick}>{t("lookTheCollection")}</button>
      </div>
    </>
  )
}
