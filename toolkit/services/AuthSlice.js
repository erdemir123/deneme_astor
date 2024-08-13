import { createSlice } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

const initialState = {
  user: null,
  token: null,
  baseUrl: null,
  allBaseUrl: null,
  user_id: null,
  profile: {},
  group: [],
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      //console.log("action", action.payload);
      const { user, token, user_id, profile,group } = action.payload;
      state.user = user !== undefined ? user : state.user;
      state.token = token !== undefined ? token : state.token;
      state.user_id = user_id !== undefined ? user_id : state.user_id;
      state.profile = profile !== undefined ? profile : state.profile;
      state.group = group !== undefined ? group : state.group;
    },
    logOut: (state, action) => {
      state.user = null;
      state.token = null;
      state.user_id = null;
      state.profile = null;
      state.group = null;
      AsyncStorage.removeItem("userData");
      AsyncStorage.removeItem("myDevices");
    },
    setStore: (state, action) => {
      const { user, token, user_id, profile, group } = action.payload;
      AsyncStorage.setItem(
        "userData",
        JSON.stringify({ user, token, user_id, profile, group })
      );
    },

    setBaseUrl: (state, action) => {
      state.baseUrl = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setAllBaseUrl: (state, action) => {
      state.allBaseUrl = action.payload;
    },
  },
});

export const { setCredentials, logOut, setStore, setBaseUrl, setAllBaseUrl,setLoading } =
  authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentUser_id = (state) => state.auth.user_id;
export const selectCurrentGroup = (state) => state.auth.group;
export const selectCurrentToken = (state) => state.auth.token;
export const selectBaseUrl = (state) => state.auth.baseUrl;
export const selectAllBaseUrl = (state) => state.auth.allBaseUrl;
export const selectProfile = (state) => state.auth.profile;
export const selectLoading = (state) => state.auth.loading;
