import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
let baseUrls = "";



console.log("object3",baseUrls)
export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl:baseUrls,
    prepareHeaders: (headers) => {
      headers.set("App-Token", "OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ");
      headers.set("Content-Type", "application/json");
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: "/initSession?get_full_session=true",
        method: "Get",
        headers: {
            Authorization: `Basic ${data}`,
          },
        body:""
      }),
    }),
  }),
});

export const { useLoginMutation } = authApi;
