import store from "./index";
export type { LoginCredentials, UserState } from "./UserSlices";

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;