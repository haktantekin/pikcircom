import { useTranslation } from "react-i18next";
import TagOptionRow from "../TagOptionRow";

export interface PostTagItem {
  slug: string;
  name: string;
  imageUrl?: string;
}

interface TagModalProps {
  tags?: PostTagItem[];
}

export default function TagModal({ tags = [] }: TagModalProps) {
  const { t } = useTranslation();

  if (tags.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-2">{t("exploreTagEmpty")}</p>
    );
  }

  return (
    <ul>
      {tags.map((tag) => (
        <li
          key={tag.slug}
          className="flex justify-between border-b items-center min-h-[50px] last:border-b-0 py-1"
        >
          <TagOptionRow name={tag.name} imageUrl={tag.imageUrl} />
        </li>
      ))}
    </ul>
  );
}
