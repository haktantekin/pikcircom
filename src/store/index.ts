import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./UserSlices";

const store = configureStore({
  reducer: {
    user: userReducer,
  },
});

export default store;