import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./services/AuthSlice";
import { authApi } from "./services/AuthApi";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware),
});

