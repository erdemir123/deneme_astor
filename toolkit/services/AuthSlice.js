import { createSlice } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

const initialState = {
  user: null,
  token: null,
  baseUrl: null,
  allBaseUrl: null,
  user_id: null,
  profile: {},
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      //console.log("action", action.payload);
      const { user, token, user_id, profile } = action.payload;
      state.user = user;
      state.token = token;
      state.user_id = user_id;
      state.profile = profile;
    },
    logOut: (state, action) => {
      state.user = null;
      state.token = null;
      state.user_id = null;
      state.profile = null;
      AsyncStorage.removeItem("userData");
    },
    setStore: (state, action) => {
      const { user, token, user_id, profile } = action.payload;
      AsyncStorage.setItem(
        "userData",
        JSON.stringify({ user, token, user_id, profile })
      );
    },

    setBaseUrl: (state, action) => {
      state.baseUrl = action.payload;
    },
    setAllBaseUrl: (state, action) => {
      state.allBaseUrl = action.payload;
    },
  },
});

export const { setCredentials, logOut, setStore, setBaseUrl, setAllBaseUrl } =
  authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentUser_id = (state) => state.auth.user_id;
export const selectCurrentToken = (state) => state.auth.token;
export const selectBaseUrl = (state) => state.auth.baseUrl;
export const selectAllBaseUrl = (state) => state.auth.allBaseUrl;
export const selectProfile = (state) => state.auth.profile;
