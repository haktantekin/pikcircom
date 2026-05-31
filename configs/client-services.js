import client from "./client";

const AUTH_QUERY = "/api/auth";

const MOCK_ENTRIES = [
  {
    category: 1,
    categoryName: "Genel",
    commentCount: 12,
    favoriteCount: 34,
    id: "entry-1",
    subject: "gorsel yukleyip koleksiyon yapma fikri",
    userName: "pikcir",
    createDate: "2026-05-01T10:30:00",
  },
  {
    category: 1,
    categoryName: "Genel",
    commentCount: 7,
    favoriteCount: 19,
    id: "entry-2",
    subject: "wp tabanli sosyal medya denemesi",
    userName: "natkahh",
    createDate: "2026-04-30T18:15:00",
  },
  {
    category: 2,
    categoryName: "Mizah",
    commentCount: 4,
    favoriteCount: 11,
    id: "entry-3",
    subject: "sabah deploy alip aksam bug kovalamak",
    userName: "devpiki",
    createDate: "2026-04-29T09:45:00",
  },
];

const createResolvedResponse = (data) =>
  Promise.resolve({
    status: 200,
    data,
  });

//user services
export const register = ({ params }) =>
  client.post(`${AUTH_QUERY}/register`, params);

export const login = ({ params }) =>
  client.post(`${AUTH_QUERY}/login`, params);

export const profile = () =>
  client.get(`${AUTH_QUERY}/profile`);

export const getProfileByUserName = (userName) =>
  client.get(`/api/profile/${encodeURIComponent(userName)}`);

export const getProfilePosts = (userName, { page, perPage } = {}) =>
  client.get(`/api/profile-posts/${encodeURIComponent(userName)}`, {
    params: {
      ...(page ? { page } : {}),
      ...(perPage ? { per_page: perPage } : {}),
    },
  });

export const hydratePostsByIds = (ids) =>
  client.get(`/api/posts/hydrate`, {
    params: {
      ids: Array.isArray(ids) ? ids.join(",") : ids,
    },
  });

export const updateProfile = (payload) =>
  client.post(`/api/profile/me`, payload);

export const getCollections = () =>
  client.get(`/api/collections`);

export const createCollection = (name) =>
  client.post(`/api/collections`, { name });

export const updateCollection = (collectionId, name) =>
  client.patch(`/api/collections/${encodeURIComponent(collectionId)}`, { name });

export const deleteCollection = (collectionId) =>
  client.delete(`/api/collections/${encodeURIComponent(collectionId)}`);

export const addPostToCollection = (collectionId, postId) =>
  client.post(`/api/collections/${encodeURIComponent(collectionId)}/posts`, { postId });

export const followUser = (userName) =>
  client.post(`/api/follows/${encodeURIComponent(userName)}`);

export const unfollowUser = (userName) =>
  client.delete(`/api/follows/${encodeURIComponent(userName)}`);

export const createPost = ({ params }) =>
  client.post(`/api/posts`, params);

export const getTags = () =>
  client.get(`/api/tags`);

export const getExplorePosts = ({ tag, perPage, page } = {}) =>
  client.get(`/api/explore`, {
    params: {
      ...(tag ? { tag } : {}),
      ...(perPage ? { per_page: perPage } : {}),
      ...(page ? { page } : {}),
    },
  });

export const getHomeFeed = ({ scope = "karma", perPage, page, refresh = false } = {}) =>
  client.get(`/api/home-feed`, {
    params: {
      scope,
      ...(perPage ? { per_page: perPage } : {}),
      ...(page ? { page } : {}),
    },
    pikcirRefresh: refresh,
  });

export const getLists = ({ period } = {}) =>
  client.get(`/api/lists`, {
    params: period ? { period } : undefined,
  });

export const createList = (name) =>
  client.post(`/api/lists`, { name });

export const getListBySlug = (slug, { period } = {}) =>
  client.get(`/api/lists/${encodeURIComponent(slug)}`, {
    params: period ? { period } : undefined,
  });

export const addPostToList = (listId, postId) =>
  client.post(`/api/lists/${encodeURIComponent(listId)}/posts`, { postId });

export const getPostById = (postId) =>
  client.get(`/api/posts/${encodeURIComponent(postId)}`);

export const deletePost = (postId) =>
  client.delete(`/api/posts/${encodeURIComponent(postId)}`);

export const favoritePost = (postId) =>
  client.post(`/api/posts/${encodeURIComponent(postId)}/favorite`);

export const unfavoritePost = (postId) =>
  client.delete(`/api/posts/${encodeURIComponent(postId)}/favorite`);

export const getPostFavorites = (postId) =>
  client.get(`/api/posts/favorites/${encodeURIComponent(postId)}`);

export const getPostComments = (postId, { refresh = false } = {}) =>
  client.get(`/api/posts/${encodeURIComponent(postId)}/comments`, {
    pikcirRefresh: refresh,
  });

export const createPostComment = (postId, content, parentId) => {
  const body = { content };
  if (parentId) {
    body.parentId = String(parentId);
  }
  return client.post(
    `/api/posts/${encodeURIComponent(postId)}/comments`,
    body,
  );
};

export const deletePostComment = (postId, commentId) =>
  client.delete(
    `/api/posts/${encodeURIComponent(postId)}/comments/${encodeURIComponent(commentId)}`,
  );

export const reportPost = (postId, body) =>
  client.post(`/api/posts/${encodeURIComponent(postId)}/report`, body);

export const logout = () =>
  client.post(`${AUTH_QUERY}/logout`);

export const search = ({ q, type = "posts", perPage } = {}) =>
  client.get(`/api/search`, {
    params: {
      q: q ?? "",
      ...(perPage ? { per_page: perPage } : {}),
      type,
    },
  });

export const getSidebarSuggestions = ({ refresh = false } = {}) =>
  client.get(`/api/sidebar-suggestions`, {
    pikcirRefresh: refresh,
  });

export const getNotifications = (params = {}) =>
  client.get(`/api/notifications`, { params });

export const markNotificationsRead = (body) =>
  client.patch(`/api/notifications`, body);

//entry services
export const entryList = () => createResolvedResponse(MOCK_ENTRIES);

export const mainPageEntries = ({ params }) =>
  createResolvedResponse({
    results: MOCK_ENTRIES,
    params,
  });

export const getUserEntries = ({params}) =>
  createResolvedResponse({
    results: MOCK_ENTRIES,
    params: { ...params },
  });

  export const getUserFavoriteEntries = ({params}) =>
  createResolvedResponse({
    results: MOCK_ENTRIES.slice().reverse(),
    params: { ...params },
  });
