import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import client from "@/configs/client";

const REQUEST_QUERY = "/api/auth";

export interface LoginCredentials {
  userName: string;
  password: string;
}

export interface UserState {
  loading: boolean;
  user: unknown;
  error: string | null;
}

export const loginUser = createAsyncThunk(
  "user/loginUser",
  async (
    userCredentials: LoginCredentials,
    { rejectWithValue },
  ) => {
    try {
      const { data } = await client.post(`${REQUEST_QUERY}/login`, userCredentials);
      return data;
    } catch (error) {
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        return rejectWithValue(
          axiosError.response?.data?.message ??
            "Kullanıcı Adı ya da şifre eşleşmedi",
        );
      }

      return rejectWithValue("Bilinmeyen bir hata oluştu");
    }
  },
);

const initialState: UserState = {
  loading: false,
  user: null,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUser(state) {
      state.loading = false;
      state.user = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.user = null;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : action.error.message ?? "Bilinmeyen bir hata oluştu";
      });
  },
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;