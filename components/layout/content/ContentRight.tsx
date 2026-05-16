
import FollowBox from "./contentRight/FollowBox";
import InfoBox from "./contentRight/InfoBox";
import { getSidebarSuggestions } from "@/configs/client-services";
import { useCallback, useEffect, useState } from "react";
import { subscribeAuthSessionChanged } from "@/src/authSessionEvent";
import { subscribeFollowChanged } from "@/src/followChangedEvent";

interface MostPopularUsersModel {
  favoriteCount: number;
  id?: string;
  userName: string;
  firstName: string;
  avatarUrls?: Record<string, string>;
}

interface MostProductiveUsersModel {
  userEntryCount: number;
  id?: string;
  userName: string;
  firstName: string;
  avatarUrls?: Record<string, string>;
}

interface RecentRegisteredUsersModel {
  id?: string;
  userName: string;
  firstName: string;
  avatarUrls?: Record<string, string>;
  createdDate?: string;
  isFollowing?: boolean;
}

interface SuggestionsState {
  mostPopularUsers: MostPopularUsersModel[];
  mostProductiveUsers: MostProductiveUsersModel[];
  recentRegisteredUsers: RecentRegisteredUsersModel[];
}
interface ContentRightProps {
  readOnly?: boolean;
}

export default function ContentRight({ readOnly = false }: ContentRightProps) {
  const [suggestions, setSuggestions] = useState<SuggestionsState>({
    mostPopularUsers: [],
    mostProductiveUsers: [],
    recentRegisteredUsers: [],
  });

  const loadSuggestions = useCallback(() => {
    getSidebarSuggestions()
      .then((res) => {
        if (res.status === 200) {
          setSuggestions({
            mostPopularUsers: res.data?.mostPopularUsers ?? [],
            mostProductiveUsers: res.data?.mostProductiveUsers ?? [],
            recentRegisteredUsers: res.data?.recentRegisteredUsers ?? [],
          });
        }
      })
      .catch(() => {
        setSuggestions({
          mostPopularUsers: [],
          mostProductiveUsers: [],
          recentRegisteredUsers: [],
        });
      });
  }, []);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  useEffect(() => subscribeAuthSessionChanged(loadSuggestions), [loadSuggestions]);

  useEffect(() => subscribeFollowChanged(loadSuggestions), [loadSuggestions]);

  return (
    <>
      <div className="hidden lg:block col-span-3 relative">
        <div className="absolute w-full">
          {suggestions.recentRegisteredUsers.length > 0 && (
            <FollowBox recentRegisteredUsers={suggestions.recentRegisteredUsers} readOnly={readOnly} />
          )}
          <InfoBox mostPopularUsers={suggestions.mostPopularUsers} mostProductiveUsers={suggestions.mostProductiveUsers} />
        </div>
      </div>
    </>
  )
}
