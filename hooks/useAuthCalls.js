import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { setAllBaseUrl, setCredentials } from "../toolkit/services/AuthSlice";

const useAuthCalls = () => {
  const { navigate } = useNavigation();
  const dispatch = useDispatch();

  const login = async (data, dispatch) => {
    console.log(data, "data");
    
    const storedBaseUrl = await AsyncStorage.getItem("baseUrl");
    const userData = await AsyncStorage.getItem("userData");
    console.log("userData", userData);
    console.log("storedBaseUrl", storedBaseUrl, data);
    
    let response;
    try {
      // storedBaseUrl'in çevresindeki çift tırnaklardan kurtulun
      const baseUrl = storedBaseUrl ? storedBaseUrl.replace(/["-]/g, '') : "";
      if (!baseUrl) {
        throw new Error("Base URL is not set");
      }
      console.log( `${baseUrl}/initSession?get_full_session=true&expand_dropdowns=true`,"deneme")
      
      response = await axios.get(
        `${baseUrl}/initSession?get_full_session=true&expand_dropdowns=true`,
        {
          headers: {
            "App-Token": "OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ",
            "Content-Type": "application/json",
            Authorization: `Basic ${data}`,
          },
          timeout: 5000, // 5 saniye zaman aşımı
        }
      );
      console.log(response);
  
      const sessionData = response.data.session;
  
      dispatch(
        setCredentials({
          user: sessionData.glpifriendlyname,
          token: response.data.session_token,
          user_id: sessionData.glpiID,
          profile: {
            id: sessionData.glpiactiveprofile.id,
            name: sessionData.glpiactiveprofile.name,
          },
        })
      );
  
      await AsyncStorage.setItem(
        "userData",
        JSON.stringify({
          user: sessionData.glpifriendlyname,
          token: response.data.session_token,
          user_id: sessionData.glpiID,
          profile: {
            id: sessionData.glpiactiveprofile.id,
            name: sessionData.glpiactiveprofile.name,
          },
        })
      );
  
      console.log(response, "response");
      return response;
    } catch (error) {
      console.log("Login failed:", error);
      alert("Login failed.");
      throw error; // Hatanın dışarıya fırlatılması
    } finally {
      if (response) {
        try {
          await getPluginDevices(
            response.data.session.glpiID,
            response.data.session.glpigroups
          );
        } catch (error) {
          console.error("Error fetching plugin devices:", error);
        }
      }
    }
  };

  const loginAdminToken = async () => {
    const storedBaseUrl = await AsyncStorage.getItem("baseUrl");
    try {
      const response = await axios.get(
        `${storedBaseUrl?.replace(/"/g, "")}/initSession`,
        {
          headers: {
            "App-Token": "OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ",
            "Content-Type": "application/json",
            Authorization: `Basic Z2xwaXN5bmM6QnVsdXQuNDQ3OA==`,
          },
        }
      );
      //console.log("admin", response.data.session_token);
      return response.data.session_token;
    } catch (error) {
      console.log("Login failed:", error);
    }
  };

  const loginUserData = async (data) => {
    console.log(data);
    const storedBaseUrl = await AsyncStorage.getItem("baseUrl");
    try {
      const response = await axios.get(
        `${storedBaseUrl?.replace(/"/g, "")}/initSession`,
        {
          headers: {
            "App-Token": "OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ",
            "Content-Type": "application/json",
            Authorization: `Basic ${data}`,
          },
        }
      );
      //console.log("admin", response.data.session_token);

      await getAllUsers(
        storedBaseUrl?.replace(/"/g, ""),
        "User",
        response.data.session_token
      );
      await getAllUsers(
        storedBaseUrl?.replace(/"/g, ""),
        "Location",
        response.data.session_token
      );
      await getAllUsers(
        storedBaseUrl?.replace(/"/g, ""),
        "ITILCategory",
        response.data.session_token
      );
      await getAllUsers(
        storedBaseUrl?.replace(/"/g, ""),
        "RequestType",
        response.data.session_token
      );
      await getAllGroups(
        storedBaseUrl?.replace(/"/g, ""),
        "Group",
        response.data.session_token
      );
      
      return response;
    } catch (error) {
      console.log("Login failed:", error);
      //alert("giriş yapılamadı ");
      //throw error;
    }
  };

  const getBaseUrl = async () => {
    const response = await axios.get(
      "https://astoras.com.tr/img/link/list.json"
    );
    dispatch(setAllBaseUrl(response.data.services));
  };

  const getAllUsers = async (baseUrl, name, token) => {
    try {
      const response = await axios.get(`${baseUrl}/${name}?range=0-1000`, {
        headers: {
          "App-Token": "OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ",
          "Content-Type": "application/json",
          "Session-Token": token,
        },
      });
      await AsyncStorage.setItem(name, JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error("Fetch failed users:", error);
      throw error;
    }
  };
  const getAllGroups = async (baseUrl, name) => {
    const admin_token = await loginAdminToken();
    try {
      const response = await axios.get(`${baseUrl}/${name}?range=0-1000`, {
        headers: {
          "App-Token": "OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ",
          "Content-Type": "application/json",
          "Session-Token": admin_token,
        },
      });
      await AsyncStorage.setItem(name, JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error("Fetch failed users:", error);
      throw error;
    }
  };

  const getPluginDevices = async (id, group) => {
    console.log("object id groups", id, group);
    const devices = {};
    try {
      const storedBaseUrl = (await AsyncStorage.getItem("baseUrl")).replace(
        /"/g,
        ""
      );
      const admin_token = await loginAdminToken();

      const headers = {
        "App-Token": "OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ",
        "Content-Type": "application/json",
        "Session-Token": admin_token,
      };

      const response = await axios.get(
        `${storedBaseUrl}/PluginGenericobjectType?range=0-1000`,
        { headers }
      );

      const deviceRequests = response.data.map(async (item) => {
        const itemUrl = `${storedBaseUrl}/${item.itemtype}?range=0-1000`;
        const itemResponse = await axios.get(itemUrl, { headers });
        devices[item.itemtype] = itemResponse.data;
      });

      await Promise.all(deviceRequests).then(navigate("Home"));
      const liste = Object.entries(devices).flatMap(
        ([deviceList, deviceArray]) =>
          deviceArray
            .filter(
              (device) =>
                group.includes(device.groups_id) ||
                device.users_id === id ||
                device.users_id_tech === id
            )
            .map((device) => ({
              id: device.id,
              name: device.name,
              type: deviceList,
            }))
      );
      console.log("liste", liste.map(item => ({
        label: `${item.type} - ${item.name}`,
        value: item.id.toString()
      })));
      await AsyncStorage.setItem("myDevices", JSON.stringify(liste.map(item => ({
        label: `${item.name} - ${item.type}`,
        value: item.id.toString()
      }))));

      return devices;
    } catch (error) {
      console.error("Fetch failed users:", error);
      throw error;
    }
  };

  return {
    login,
    getBaseUrl,
    loginUserData,
    loginAdminToken,
    getPluginDevices,
  };
};

export default useAuthCalls;
