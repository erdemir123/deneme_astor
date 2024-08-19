import { View, Text, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import useTicketCalls from "../hooks/useTicketCalls";
import { useDispatch } from "react-redux";
import { setCredentials } from "../toolkit/services/AuthSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ChangeProfile = () => {
  const { getMyProfiles, changeActiveProfile, getActiveProfile } =
    useTicketCalls();
  const [myProfiles, setMyProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const profilesData = await getMyProfiles();
        setMyProfiles(profilesData.myprofiles);
      } catch (error) {
        console.error("Error fetching profiles:", error);
        navigation.navigate("Home");
      }
    };

    fetchProfiles();
  }, []);

  useEffect(() => {
    const fetchActiveProfile = async () => {
      try {
        const data = await getActiveProfile();
        const profile = {
          name: data.active_profile.name,
          id: data.active_profile.id,
        };

        setSelectedProfile(profile);
      } catch (error) {
        console.log("Error fetching active profile:", error);
        navigation.navigate("Home");
      }
    };

    fetchActiveProfile();
  }, []);

  const handleProfileSelect = async (profile) => {
    try {
      dispatch(
        setCredentials({ profile: { id: profile.id, name: profile.name } })
      );

      await changeActiveProfile({ profiles_id: profile.id });
      const storedData = await AsyncStorage.getItem("userData");
      let userData = JSON.parse(storedData);

      userData.profile = {
        id: profile.id,
        name: profile.name,
      };

      await AsyncStorage.setItem("userData", JSON.stringify(userData));
      navigation.navigate("Home");
    } catch (error) {
      console.error("Error changing active profile:", error);
    }
  };
  return (
    <View className={"flex-1 items-center justify-center p-4"}>
      <Text className={"text-lg font-bold mb-4 text-default"}>
        Select a Profile:
      </Text>
      {myProfiles
        .filter(
          (profile) =>
            profile.name === "Self-Service" || profile.name === "Technician"
        )
        .map((profile) => (
          <TouchableOpacity
            key={profile.id}
            className={`p-8 m-2 border border-gray-300 rounded-md ${
              selectedProfile && selectedProfile.id === profile.id
                ? "bg-red-500"
                : "bg-gray-300"
            }`}
            onPress={() => handleProfileSelect(profile)}
          >
            <Text className={"text-lg font-bold text-center text-white"}>
              {profile.name}
            </Text>
          </TouchableOpacity>
        ))}
    </View>
  );
};

export default ChangeProfile;
