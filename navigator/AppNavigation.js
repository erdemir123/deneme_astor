import React, { useState, useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar, Text, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import CameraScreen from "../screens/CameraScreen";
import ChangeProfile from "../screens/ChangeProfile";

import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCurrentUser,
  setCredentials,
} from "../toolkit/services/AuthSlice";
import CustomHeaderRight from "../components/CustomRightHeader";
import SupportScreen from "../screens/SupportScreen";
import FormsScreen from "../screens/FormsScreen";
import CreateSupportScreen from "../screens/CreateSupportScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const navigation = useNavigation();
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await AsyncStorage.getItem("userData");

        console.log("data async", data);
        if (data) {
          const userData = JSON.parse(data); // JSON stringini JavaScript nesnesine dönüştür

          dispatch(
            setCredentials({
              user: userData.user,
              token: userData.token,
              profile: userData.profile,
              user_id: userData.user_id, // user_id eklenmiş
            })
          );

          navigation.navigate("Home");
        } else {
          console.log("User data not found.");
          navigation.navigate("Login");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigation.navigate("Login");
      }
    };

    fetchUserData();
  }, [dispatch, navigation]);

  return (
    <>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      <Stack.Navigator initialRouteName={user ? "Home" : "Login"}>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: "Ana Sayfa",
            headerTitleStyle: { color: "red" },
            headerRight: () => <CustomHeaderRight />,
            headerLeft: null,
          }}
        />
        <Stack.Screen
          name="Scanner"
          component={CameraScreen}
          options={{
            title: "Qr Kod Okuyucu",
            headerTitleStyle: { color: "red" },
            headerRight: () => <CustomHeaderRight />,
            headerLeft: null,
          }}
        />
        <Stack.Screen
          name="ChangeProfile"
          component={ChangeProfile}
          options={{
            title: "Profile Değiştir",
            headerTitleStyle: { color: "red" },
            headerRight: () => <CustomHeaderRight />,
            headerLeft: null,
          }}
        />
        <Stack.Screen
          name="Support"
          component={SupportScreen}
          options={{
            title: "Destek Kaydı",
            headerTitleStyle: { color: "red" },
            headerRight: () => <CustomHeaderRight />,
            headerLeft: null,
          }}
        />
        <Stack.Screen
          name="Forms"
          component={FormsScreen}
          options={{
            title: "Destek Kaydı",
            headerTitleStyle: { color: "red" },
            headerRight: () => <CustomHeaderRight />,
            headerLeft: null,
          }}
        />
        <Stack.Screen
          name="CreateSupport"
          component={CreateSupportScreen}
          options={{
            title: "Destek Kaydı Aç",
            headerTitleStyle: { color: "red" },
            headerRight: () => <CustomHeaderRight />,
            headerLeft: null,
          }}
        />
      </Stack.Navigator>
    </>
  );
}