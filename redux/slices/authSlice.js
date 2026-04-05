import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
  id: null,
  role: null, // 'User'
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    startLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    authSuccess: (state, action) => {
      state.token = action.payload.token;
      state.id = action.payload.id ?? null;
      state.role = action.payload.role;
      state.isLoading = false;
    },
    authFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.id = null;
      state.role = null;
      state.isLoading = false;
    },
  },
});

export const { startLoading, authSuccess, authFailure, logout } =
  authSlice.actions;
export default authSlice.reducer;
