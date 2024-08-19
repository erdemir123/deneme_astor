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
  const getProfileId = (responseProfile) => {
    // İlk olarak Self-Service profilini arıyoruz.
    const selfServiceProfile = responseProfile.find(
      (profile) => profile.name === "Self-Service"
    );

    if (selfServiceProfile) {
      return selfServiceProfile.id;
    }

    // Eğer Self-Service bulunmazsa Technician profilini arıyoruz.
    const technicianProfile = responseProfile.find(
      (profile) => profile.name === "Technician"
    );

    if (technicianProfile) {
      return technicianProfile.id;
    }

    // Eğer hiçbiri bulunmazsa undefined döndürür.
    return undefined;
  };
  const updateProfile = async (newProfile) => {
    try {
      const existingData = await AsyncStorage.getItem("userData");
      const parsedData = existingData ? JSON.parse(existingData) : {};

      // Sadece profile kısmını güncelle
      const updatedData = {
        ...parsedData,
        profile: {
          id: newProfile,
          name: newProfile === 1 ? "Self-Service" : "Technician",
        },
      };

      // Güncellenmiş veriyi tekrar AsyncStorage'a kaydet
      await AsyncStorage.setItem("userData", JSON.stringify(updatedData));
      dispatch(
        setCredentials({
          profile: {
            id: newProfile,
            name: newProfile === 1 ? "Self-Service" : "Technician",
          },
        })
      );
      // Veri doğru bir şekilde kaydedildi mi kontrol et
      const checkData = await AsyncStorage.getItem("userData");
      console.log("Güncellenmiş veri:", JSON.parse(checkData));
    } catch (error) {
      console.error("Profile güncellenirken hata oluştu:", error);
    }
  };

  const login = async (data, dispatch, setLoginPromise) => {
    setLoginPromise(true);

    const storedBaseUrl = await AsyncStorage.getItem("baseUrl");
    const userData = await AsyncStorage.getItem("userData");

    let response;
    try {
      const baseUrl = storedBaseUrl ? storedBaseUrl.replace(/["-]/g, "") : "";
      if (!baseUrl) {
        throw new Error("Base URL is not set");
      }

      response = await axios.get(
        `${baseUrl}/initSession?get_full_session=true&expand_dropdowns=true`,
        {
          headers: {
            "App-Token": appToken,
            "Content-Type": "application/json",
            Authorization: `Basic ${data}`,
          },
        }
      );
      console.log("response.data:", response?.data);
      console.log(response?.data.session_token, "res");

      const sessionData = response?.data.session;

      console.log(sessionData?.glpifriendlyname, "groups=>");

      dispatch(
        setCredentials({
          user: sessionData?.glpifriendlyname,
          token: response.data?.session_token,
          user_id: sessionData?.glpiID,
          group: sessionData?.glpigroups || [],
          profile: {
            id: sessionData?.glpiactiveprofile.id,
            name: sessionData?.glpiactiveprofile.name,
          },
        })
      );

      await AsyncStorage.setItem(
        "userData",
        JSON.stringify({
          user: sessionData?.glpifriendlyname,
          token: response?.data.session_token,
          user_id: sessionData?.glpiID,
          group: sessionData?.glpigroups,
          profile: {
            id: sessionData?.glpiactiveprofile.id,
            name: sessionData?.glpiactiveprofile.name,
          },
        })
      );

      return response;
    } catch (error) {
      let errorMessage = "Bir hata oluştu. Lütfen tekrar deneyin.";

      if (error.response) {
        console.log("Error Response Data login:", error?.response?.data);

        if (Array.isArray(error?.response?.data)) {
          errorMessage = error?.response?.data
            .map((msg) => `• ${msg}`)
            .join("\n");
        } else if (typeof error?.response?.data === "string") {
          errorMessage = error?.response?.data;
        }
      } else if (error.request) {
        console.log("No Response Received:", error.request);
        errorMessage =
          "Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edin.";
      } else {
        console.log("Error Message:", error.message);
      }
      Alert.alert("Hata1", errorMessage);
    } finally {
      if (response) {
        try {
          console.log(
            response.data.session.glpiactiveprofile.name,
            "profileName"
          );
          if (response.data.session.glpiactiveprofile.name === "Super-Admin") {
            const responseProfile = await axios.get(
              `${storedBaseUrl}/getMyProfiles`,
              {
                headers: {
                  "App-Token": appToken,
                  "Content-Type": "application/json",
                  "Session-Token": response?.data.session_token,
                },
              }
            );
            console.log(responseProfile.data, "getMyProfiles");
            const profileId = getProfileId(responseProfile.data.myprofiles);
            if (profileId === undefined) {
              setLoginPromise(false);
              Alert.alert(
                "Hata22",
                "Bu Uygulamaya Giriş Yapılamıyor. Lütfen Profile Ayarlarınızı kontrol edin."
              );
              return;
            }
            console.log(profileId, "profileId", response?.data.session_token);
            const data = { profiles_id: profileId.toString() };
            updateProfile(profileId);
            const responseChangeProfile = await axios.post(
              `${storedBaseUrl}/changeActiveProfile/`,
              data,
              {
                headers: {
                  "App-Token": appToken,
                  "Content-Type": "application/json",
                  "Session-Token": response?.data.session_token,
                },
              }
            );
            console.log(responseChangeProfile.data, "responseChangeProfile");
            await getPluginDevices(
              response.data.session.glpiID,
              response.data.session.glpigroups
            );
          } else {
            await getPluginDevices(
              response.data.session.glpiID,
              response.data.session.glpigroups
            );
          }
        } catch (error) {
          console.log("Error Login:", error.message);
          navigate("Login");
        }
      }
      setLoginPromise(false);
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
      console.log("Bir Hata Oluştu adminToken...");
      //navigate("Login");
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
      console.log("Hata:", error?.response?.data);
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
    dispatch(setAllBaseUrl(response?.data.services));
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
      await AsyncStorage.setItem(name, JSON.stringify(response?.data));

      return response.data;
    } catch (error) {
      let errorMessage = "Bir hata oluştu. Lütfen tekrar deneyin.";

      if (error.response) {
        console.log("Error Response Data get Users:", error?.response?.data);

        if (Array.isArray(error?.response?.data)) {
          errorMessage = error?.response?.data
            .map((msg) => `• ${msg}`)
            .join("\n");
        } else if (typeof error?.response?.data === "string") {
          errorMessage = error?.response?.data;
        }
      } else if (error.request) {
        console.log("No Response Received:", error.request);
        errorMessage =
          "Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edin.";
      } else {
        console.log("Error Message:", error.message);
      }

      Alert.alert("Hata2", errorMessage);
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
      await AsyncStorage.setItem(name, JSON.stringify(response?.data));
      return response.data;
    } catch (error) {
      let errorMessage = "Bir hata oluştu. Lütfen tekrar deneyin.";

      if (error.response) {
        console.log("Error Response Data groups:", error?.response?.data);

        if (Array.isArray(error?.response?.data)) {
          errorMessage = error?.response?.data
            .map((msg) => `• ${msg}`)
            .join("\n");
        } else if (typeof error?.response?.data === "string") {
          errorMessage = error?.response?.data;
        }
      } else if (error.request) {
        console.log("No Response Received:", error.request);
        errorMessage =
          "Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edin.";
      } else {
        console.log("Error Message:", error.message);
      }

      console.log("Hata3", errorMessage);
      //navigate("Login");

      // throw error;
    }
  };
  const getPluginDevices = async (id, group) => {
    dispatch(setLoading(true));
    const devices = {};
    const plugin_object = await AsyncStorage.getItem("plugin_object");
    const deviceTableString = await AsyncStorage.getItem("device_table");

    const deviceTable = deviceTableString ? JSON.parse(deviceTableString) : [];

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

      console.log(typeof plugin_object, "plugin_object");
      console.log(deviceTable, id, "device_table");

      if (plugin_object == "1") {
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
      } else {
        const deviceRequestsBt = deviceTable.map(async (item) => {
          const itemUrl = `${storedBaseUrl}/${item}?range=0-1000`;
          console.log(itemUrl, "itemUrl");
          const itemResponse = await axios.get(itemUrl, { headers });
          devices[item] = itemResponse.data;
        });

        await Promise.all(deviceRequestsBt).then(
          navigate("Home", { loading: true })
        );
      }
      //console.log(devices, "devices");
      const liste = Object.entries(devices).flatMap(
        ([deviceList, deviceArray]) =>
          deviceArray
            .filter((device) => device.users_id === id)
            .map((device) => ({
              id: device.id,
              name: device.name,
              type: deviceList,
              serial: device.serial,
              otherserial: device.otherserial,
              locations_id: device.locations_id,
            }))
      );
      console.log(liste, "liste");
      await AsyncStorage.setItem(
        "myDevices",
        JSON.stringify(
          liste.map((item) => ({
            label: `${item.type} - ${item.name} - ${item.serial} - ${item.otherserial}`,
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
        console.log("Error Response Data devices:", error?.response?.data);

        if (Array.isArray(error?.response?.data)) {
          errorMessage = error?.response?.data
            .map((msg) => `• ${msg}`)
            .join("\n");
        } else if (typeof error?.response?.data === "string") {
          errorMessage = error?.response?.data;
        }
      } else if (error.request) {
        console.log("No Response Received:", error.request);
        errorMessage =
          "Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edin.";
      } else {
        console.log("Error Message:", error.message);
      }

      Alert.alert("Hata4", errorMessage);
      dispatch(setLoading(false)); // Ensure loading is turned off on error
    }
  };

  // const getPluginDevices = async (id, group) => {
  //   dispatch(setLoading(true));
  //   const devices = {};
  //   try {
  //     const storedBaseUrl = (await AsyncStorage.getItem("baseUrl")).replace(
  //       /"/g,
  //       ""
  //     );
  //     const admin_token = await loginAdminToken();

  //     const headers = {
  //       "App-Token": appToken,
  //       "Content-Type": "application/json",
  //       "Session-Token": admin_token,
  //     };

  //     const response = await axios.get(
  //       `${storedBaseUrl}/PluginGenericobjectType?range=0-1000`,
  //       { headers }
  //     );

  //     const deviceRequests = response.data.map(async (item) => {
  //       const itemUrl = `${storedBaseUrl}/${item.itemtype}?range=0-1000`;
  //       console.log(itemUrl, "itemUrl");
  //       const itemResponse = await axios.get(itemUrl, { headers });
  //       devices[item.itemtype] = itemResponse.data;
  //     });
  //     const requests = allowedTypes.map(async (type) => {
  //       const itemUrl = `${storedBaseUrl}/${type}?range=0-1000`;
  //       console.log(itemUrl, "itemUrl");
  //       try {
  //         const itemResponse = await axios.get(itemUrl, { headers });
  //         devices[type] = itemResponse.data;
  //       } catch (error) {
  //         console.error(`Error fetching ${type}:`, error.message);
  //       }
  //     });

  //     await Promise.all([...deviceRequests, ...requests]).then(
  //       navigate("Home", { loading: true })
  //     );
  //     //console.log("deviceRequest=====>",deviceRequests)
  //     //console.log("deviceRequest===>", devices);
  //     const liste = Object.entries(devices).flatMap(
  //       ([deviceList, deviceArray]) =>
  //         deviceArray
  //           .filter(
  //             (device) => device.users_id === id
  //             // group.includes(device.groups_id) ||
  //             // device.users_id === id ||
  //             // device.users_id_tech === id
  //           )
  //           .map((device) => ({
  //             id: device.id,
  //             name: device.name,
  //             type: deviceList,
  //             serial: device.serial,
  //             otherserial: device.otherserial,
  //             locations_id: device.locations_id,
  //           }))
  //     );
  //     //console.log("liste",liste)
  //     // console.log("liste=>=>=>=>=>=>", liste.map(item => ({
  //     //   label: `${item.type} - ${item.name}`,
  //     //   value: item.id.toString(),
  //     //   serial:item.serial.toString(),
  //     // })));
  //     await AsyncStorage.setItem(
  //       "myDevices",
  //       JSON.stringify(
  //         liste.map((item) => ({
  //           label: `Makine - ${item.name} - ${item.serial} - ${item?.otherserial}`,
  //           serial: item.serial.toString(),
  //           value: item.id.toString(),
  //           otherserial: item.otherserial.toString(),
  //           locations_id: item.locations_id.toString(),
  //         }))
  //       )
  //     );
  //     dispatch(setLoading(false));
  //     return devices;
  //   } catch (error) {
  //     let errorMessage = "Bir hata oluştu. Lütfen tekrar deneyin.";

  //     if (error.response) {
  //       console.log("Error Response Data:", error.response.data);

  //       if (Array.isArray(error.response.data)) {
  //         errorMessage = error.response.data
  //           .map((msg) => `• ${msg}`)
  //           .join("\n");
  //       } else if (typeof error.response.data === "string") {
  //         errorMessage = error.response.data;
  //       }
  //     } else if (error.request) {
  //       console.log("No Response Received:", error.request);
  //       errorMessage =
  //         "Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edin.";
  //     } else {
  //       console.log("Error Message:", error.message);
  //     }

  //     Alert.alert("Hata", errorMessage);
  //   }
  // };
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
