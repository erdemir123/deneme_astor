import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  logOut,
  selectCurrentUser,
  selectLoading,
  selectProfile,
} from "../toolkit/services/AuthSlice";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute } from "@react-navigation/native";

export default function HomeScreen({ navigation }) {
  const route = useRoute();
  const loading = route.params?.loading ?? false;

  const user = useSelector(selectCurrentUser);
  const profile = useSelector(selectProfile);
  const [loadingHome, setLoadingHome] = useState(false);
  const dispatch = useDispatch();
  console.log(loading, "loading");
  useEffect(() => {
    setLoadingHome(false);
    if (loading) {
      setLoadingHome(true);
      
    }
    setTimeout(() => setLoadingHome(false), 5000);
  }, []); 
  console.log(loadingHome,"loadingHome")

  if (loadingHome) {
    return (
      <ActivityIndicator
        size={"large"}
        color="red"
        className="flex-1 justify-center items-center"
        animating={true}
      />
    );
  }
  return (
    <View className="flex-1 flex-row bg-slate-500/20 flex justify-center items-center  gap-5 flex-wrap pt-4 border border-red-500">
      <Image
        source={require("../assets/images/astor.png")}
        className="w-full h-40"
      />
      <View className="">
        <TouchableOpacity
          className=" w-32 h-32 p-3 rounded-full justify-center bg-red-500 items-center"
          onPress={() => navigation.navigate("Forms")}
        >
          <MaterialCommunityIcons
            name="format-align-justify"
            size={50}
            color="#FFF"
          />

          <Text className="text-center font-medium text-label-small  text-whitekozy">
            Formlar
          </Text>
        </TouchableOpacity>
      </View>

      <View>
        <TouchableOpacity
          className=" w-32 h-32 p-3 rounded-full justify-center bg-red-500 items-center"
          onPress={() => navigation.navigate("Support")}
        >
          <MaterialIcons name="support-agent" size={40} color="#FFF" />

          <Text className="text-center font-medium text-label-small  text-whitekozy">
            Destek Kayıtları
          </Text>
        </TouchableOpacity>
      </View>

      <View>
        <TouchableOpacity
          className=" w-32 h-32 p-3 rounded-full justify-center bg-red-500 items-center"
          onPress={() => navigation.navigate("Scanner")}
        >
          <MaterialIcons name="qr-code-scanner" size={40} color="#FFF" />

          <Text className="text-center font-medium text-label-small  text-whitekozy">
            Qr kod Okuyucu
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity
          className=" w-32 h-32 p-3 rounded-full justify-center bg-red-500 items-center"
          onPress={() => navigation.navigate("CreateSupport")}
        >
          <View className="flex flex-row ">
            <MaterialIcons name="support-agent" size={40} color="#FFF" />
            <MaterialIcons name="plus-one" size={20} color="#FFF" />
          </View>

          <Text className="text-center font-medium text-label-small  text-whitekozy">
            Destek Kaydı aç
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity
          className=" w-32 h-32 p-3 rounded-full justify-center bg-red-500 items-center"
          onPress={() => navigation.navigate("ChangeProfile")}
        >
          <MaterialIcons name="change-circle" size={40} color="#FFF" />

          <Text className="text-center font-medium text-label-small  text-whitekozy">
            Profile Değiştir ({profile?.name})
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity
          className=" w-32 h-32 p-3 rounded-full justify-center bg-red-500 items-center"
          onPress={() => {
            dispatch(logOut());
            navigation.navigate("Login");
          }}
        >
          <MaterialCommunityIcons name="logout" size={40} color="white" />

          <Text className="text-center font-medium text-label-small  text-whitekozy">
            Çıkış Yap
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
