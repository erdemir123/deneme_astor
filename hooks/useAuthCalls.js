import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import {
  setAllBaseUrl,
  setCredentials,
  setLoading,
} from "../toolkit/services/AuthSlice";
import { Alert } from "react-native";

const useAuthCalls = () => {
  const { navigate } = useNavigation();
  const dispatch = useDispatch();

  const appToken = process.env.EXPO_PUBLIC_APP_TOKEN;
  const adminName = process.env.EXPO_PUBLIC_ADMIN_NAME;

  const login = async (data, dispatch,setLoginPromise) => {
    setLoginPromise(true)
    console.log(data, "data");

    const storedBaseUrl = await AsyncStorage.getItem("baseUrl");
    const userData = await AsyncStorage.getItem("userData");
    console.log("userData", userData);
    console.log("storedBaseUrl", storedBaseUrl, data);

    let response;
    try {
      const baseUrl = storedBaseUrl ? storedBaseUrl.replace(/["-]/g, "") : "";
      if (!baseUrl) {
        throw new Error("Base URL is not set");
      }
      console.log(
        `${baseUrl}/initSession?get_full_session=true&expand_dropdowns=true`,
        "deneme",
        data
      );

      response = await axios.get(
        `${baseUrl}/initSession?get_full_session=true&expand_dropdowns=true`,
        {
          headers: {
            "App-Token": appToken,
            "Content-Type": "application/json",
            Authorization: `Basic ${data}`,
          },
          //timeout: 5000, // 5 saniye zaman aşımı
        }
      );
      console.log(response, "res");

      const sessionData = response.data.session;

      console.log(sessionData.glpifriendlyname, "groups=>");

      dispatch(
        setCredentials({
          user: sessionData.glpifriendlyname,
          token: response.data.session_token,
          user_id: sessionData.glpiID,
          group: sessionData.glpigroups || [],
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
          group: sessionData.glpigroups,
          profile: {
            id: sessionData.glpiactiveprofile.id,
            name: sessionData.glpiactiveprofile.name,
          },
        })
      );

      // console.log(response, "response");
      return response;
    } catch (error) {
      let errorMessage = "Bir hata oluştu. Lütfen tekrar deneyin.";

      if (error.response) {
        console.log("Error Response Data:", error.response.data);

        if (Array.isArray(error.response.data)) {
          errorMessage = error.response.data
            .map((msg) => `• ${msg}`)
            .join("\n");
        } else if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        }
      } else if (error.request) {
        console.log("No Response Received:", error.request);
        errorMessage =
          "Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edin.";
      } else {
        console.log("Error Message:", error.message);
      }

      Alert.alert("Hata", errorMessage);
    } finally {
      if (response) {
        try {
          await getPluginDevices(
            response.data.session.glpiID,
            response.data.session.glpigroups
          );
        } catch (error) {
          console.log("Error fetching plugin devices:", error.message);
          navigate("Login");
        }
      }
      setLoginPromise(false)
    }
  };

  const loginAdminToken = async () => {
    const storedBaseUrl = await AsyncStorage.getItem("baseUrl");
    try {
      const response = await axios.get(
        `${storedBaseUrl?.replace(/"/g, "")}/initSession`,
        {
          headers: {
            "App-Token": appToken,
            "Content-Type": "application/json",
            Authorization: `Basic ${adminName}`,
          },
        }
      );

      return response.data.session_token;
    } catch (error) {
      Alert.alert("Bir Hata Oluştu...");
      navigate("Login");
    }
  };

  const loginUserData = async (data) => {
    const storedBaseUrl = await AsyncStorage.getItem("baseUrl");
    try {
      const response = await axios.get(
        `${storedBaseUrl?.replace(/"/g, "")}/initSession`,
        {
          headers: {
            "App-Token": appToken,
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
      console.log("Login failed:", error.response.data);
      navigate("Login");
      
      //alert("giriş yapılamadı ");
      //throw error;
    }
  };

  const getBaseUrl = async () => {
    const response = await axios.get(
      "https://astoras.com.tr/img/link/list.json"
    );
    console.log(response.data.services);
    dispatch(setAllBaseUrl(response.data.services));
  };

  const getAllUsers = async (baseUrl, name, token) => {
    try {
      const response = await axios.get(`${baseUrl}/${name}?range=0-1000`, {
        headers: {
          "App-Token": appToken,
          "Content-Type": "application/json",
          "Session-Token": token,
        },
      });
      await AsyncStorage.setItem(name, JSON.stringify(response.data));

      return response.data;
    } catch (error) {
      let errorMessage = "Bir hata oluştu. Lütfen tekrar deneyin.";

      if (error.response) {
        console.log("Error Response Data:", error.response.data);

        if (Array.isArray(error.response.data)) {
          errorMessage = error.response.data
            .map((msg) => `• ${msg}`)
            .join("\n");
        } else if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        }
      } else if (error.request) {
        console.log("No Response Received:", error.request);
        errorMessage =
          "Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edin.";
      } else {
        console.log("Error Message:", error.message);
      }

      Alert.alert("Hata", errorMessage);
      navigate("Login");
      // alert("giriş yapılamadı ");
    }
  };
  const getAllGroups = async (baseUrl, name) => {
    const admin_token = await loginAdminToken();
    try {
      const response = await axios.get(`${baseUrl}/${name}?range=0-1000`, {
        headers: {
          "App-Token": appToken,
          "Content-Type": "application/json",
          "Session-Token": admin_token,
        },
      });
      await AsyncStorage.setItem(name, JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      let errorMessage = "Bir hata oluştu. Lütfen tekrar deneyin.";

      if (error.response) {
        console.log("Error Response Data:", error.response.data);

        if (Array.isArray(error.response.data)) {
          errorMessage = error.response.data
            .map((msg) => `• ${msg}`)
            .join("\n");
        } else if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        }
      } else if (error.request) {
        console.log("No Response Received:", error.request);
        errorMessage =
          "Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edin.";
      } else {
        console.log("Error Message:", error.message);
      }

      Alert.alert("Hata", errorMessage);
      navigate("Login");

      // throw error;
    }
  };

  const getPluginDevices = async (id, group) => {
    dispatch(setLoading(true));
    const devices = {};
    try {
      const storedBaseUrl = (await AsyncStorage.getItem("baseUrl")).replace(
        /"/g,
        ""
      );
      const admin_token = await loginAdminToken();

      const headers = {
        "App-Token": appToken,
        "Content-Type": "application/json",
        "Session-Token": admin_token,
      };

      const response = await axios.get(
        `${storedBaseUrl}/PluginGenericobjectType?range=0-1000`,
        { headers }
      );

      const deviceRequests = response.data.map(async (item) => {
        const itemUrl = `${storedBaseUrl}/${item.itemtype}?range=0-1000`;
        //console.log(itemUrl, "itemUrl");
        const itemResponse = await axios.get(itemUrl, { headers });
        devices[item.itemtype] = itemResponse.data;
      });

      await Promise.all(deviceRequests).then(
        navigate("Home", { loading: true })
      );
      //console.log("deviceRequest=====>",deviceRequests)
      //console.log("deviceRequest===>", devices);
      const liste = Object.entries(devices).flatMap(
        ([deviceList, deviceArray]) =>
          deviceArray
            .filter(
              (device) => device.users_id === id
              // group.includes(device.groups_id) ||
              // device.users_id === id ||
              // device.users_id_tech === id
            )
            .map((device) => ({
              id: device.id,
              name: device.name,
              type: deviceList,
              serial: device.serial,
              otherserial: device.otherserial,
              locations_id: device.locations_id,
            }))
      );
      //console.log("liste",liste)
      // console.log("liste=>=>=>=>=>=>", liste.map(item => ({
      //   label: `${item.type} - ${item.name}`,
      //   value: item.id.toString(),
      //   serial:item.serial.toString(),
      // })));
      await AsyncStorage.setItem(
        "myDevices",
        JSON.stringify(
          liste.map((item) => ({
            label: `Makine - ${item.name} - ${item.serial} - ${item?.otherserial}`,
            serial: item.serial.toString(),
            value: item.id.toString(),
            otherserial: item.otherserial.toString(),
            locations_id: item.locations_id.toString(),
          }))
        )
      );
      dispatch(setLoading(false));
      return devices;
    } catch (error) {
      let errorMessage = "Bir hata oluştu. Lütfen tekrar deneyin.";

      if (error.response) {
        console.log("Error Response Data:", error.response.data);

        if (Array.isArray(error.response.data)) {
          errorMessage = error.response.data
            .map((msg) => `• ${msg}`)
            .join("\n");
        } else if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        }
      } else if (error.request) {
        console.log("No Response Received:", error.request);
        errorMessage =
          "Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edin.";
      } else {
        console.log("Error Message:", error.message);
      }

      Alert.alert("Hata", errorMessage);
    }
  };
  const getPluginByDevices = async (href) => {
    try {
      const admin_token = await loginAdminToken();
      const storedBaseUrl = await AsyncStorage.getItem("baseUrl");

      const headers = {
        "App-Token": appToken,
        "Content-Type": "application/json",
        "Session-Token": admin_token,
      };

      const response = await axios.get(
        `${storedBaseUrl}/${href}?range=0-1000`,
        {
          headers,
        }
      );

      return response.data;
    } catch (error) {
      console.log("API isteği başarısız oldu:", error);
      //throw error; // Eğer hata yakalanırsa dışarıya tekrar fırlatılabilir
    }
  };

  return {
    login,
    getBaseUrl,
    loginUserData,
    loginAdminToken,
    getPluginDevices,
    getPluginByDevices,
  };
};

export default useAuthCalls;
