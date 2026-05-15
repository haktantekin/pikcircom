import { useTranslation } from "react-i18next";
import SearchUserRow from "./SearchUserRow";
import type { SearchUserItem } from "@/src/searchTypes";

interface SearchUserResultsProps {
  users: SearchUserItem[];
}

export default function SearchUserResults({ users }: SearchUserResultsProps) {
  const { t } = useTranslation();

  if (users.length === 0) {
    return (
      <p className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
        {t("searchEmptyUsers")}
      </p>
    );
  }

  return (
    <div className="grid gap-2">
      {users.map((user) => (
        <SearchUserRow key={user.id || user.userName} user={user} />
      ))}
    </div>
  );
}
