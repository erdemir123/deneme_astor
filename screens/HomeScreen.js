import { View, Text, TouchableOpacity, Image } from "react-native";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import {

  selectCurrentUser,
  selectProfile,
} from "../toolkit/services/AuthSlice";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

export default function HomeScreen({ navigation }) {
  const user = useSelector(selectCurrentUser);


  const profile = useSelector(selectProfile);
 
  

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

          <Text className="text-center font-medium text-title-small  text-whitekozy">
            Formlar
          </Text>
        </TouchableOpacity>
      </View>

      <View>
        <TouchableOpacity
          className=" w-32 h-32 p-3 rounded-full justify-center bg-red-500 items-center"
          onPress={() => navigation.navigate("Support")}
        >
          <MaterialIcons name="support-agent" size={50} color="#FFF" />

          <Text className="text-center font-medium text-title-small  text-whitekozy">
            Destek Kayıtları
          </Text>
        </TouchableOpacity>
      </View>

      <View>
        <TouchableOpacity
          className=" w-32 h-32 p-3 rounded-full justify-center bg-red-500 items-center"
          onPress={() => navigation.navigate("Scanner")}
        >
          <MaterialIcons name="qr-code-scanner" size={50} color="#FFF" />

          <Text className="text-center font-medium text-title-small  text-whitekozy">
            Qr kod Okuyucu
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity
          className=" w-32 h-32 p-3 rounded-full justify-center bg-red-500 items-center"
          onPress={() => navigation.navigate("CreateSupport")}
        >
          <MaterialIcons name="support-agent" size={50} color="#FFF" />

          <Text className="text-center font-medium text-title-small  text-whitekozy">
            Destek Kaydı aç
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity
          className=" w-32 h-32 p-3 rounded-full justify-center bg-red-500 items-center"
          onPress={() => navigation.navigate("ChangeProfile")}
        >
          <MaterialIcons name="change-circle" size={50} color="#FFF" />

          <Text className="text-center font-medium text-title-small  text-whitekozy">
            Profile Değiştir ({profile?.name})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
