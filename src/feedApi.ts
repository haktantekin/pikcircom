import type { AxiosResponse } from "axios";
import {
  getExplorePosts as getExplorePostsRaw,
  getHomeFeed as getHomeFeedRaw,
} from "@/configs/client-services";
import type { ExplorePost } from "@/src/feedPostTypes";
import type { HomeFeedScope } from "@/src/server/home-feed";

export interface PaginatedFeedResponse {
  posts?: ExplorePost[];
  has_more?: boolean;
  scope?: HomeFeedScope;
  tag?: string;
  warning?: string;
}

type HomeFeedRequest = {
  scope?: HomeFeedScope;
  perPage?: number;
  page?: number;
  refresh?: boolean;
};

type ExploreRequest = {
  tag?: string;
  perPage?: number;
  page?: number;
};

const getHomeFeedTyped = getHomeFeedRaw as (
  options: HomeFeedRequest,
) => Promise<AxiosResponse<PaginatedFeedResponse>>;

const getExplorePostsTyped = getExplorePostsRaw as (
  options: ExploreRequest,
) => Promise<AxiosResponse<PaginatedFeedResponse>>;

export function fetchHomeFeedPage(
  options: HomeFeedRequest,
): Promise<AxiosResponse<PaginatedFeedResponse>> {
  return getHomeFeedTyped(options);
}

export function fetchExplorePostsPage(
  options: ExploreRequest,
): Promise<AxiosResponse<PaginatedFeedResponse>> {
  return getExplorePostsTyped(options);
}
