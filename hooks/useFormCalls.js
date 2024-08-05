import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useAuthCalls from "./useAuthCalls";
import mime from "mime";

const useFormCalls = () => {
  const { loginAdminToken } = useAuthCalls();

  const getStoredData = async () => {
    const [storedBaseUrl, userDataString] = await Promise.all([
      AsyncStorage.getItem("baseUrl"),
      AsyncStorage.getItem("userData"),
    ]);

    const data = userDataString ? JSON.parse(userDataString) : null;

    if (!data || !data.token) {
      throw new Error("User data or token not found");
    }

    return {
      storedBaseUrl: storedBaseUrl?.replace(/"/g, ""),
      token: data.token,
    };
  };

  const getAllFormPermission = async () => {
    try {
      const { storedBaseUrl, token } = await getStoredData();
      const admin_token = await loginAdminToken();
      const headers = {
        "App-Token": "OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ",
        "Content-Type": "application/json",
        "Session-Token": admin_token,
      };

      const url1 = `${storedBaseUrl}/PluginFormcreatorForm_User?range=0-5000`;
      const url2 = `${storedBaseUrl}/PluginFormcreatorForm_Profile?range=0-5000`;
      const url3 = `${storedBaseUrl}/PluginFormcreatorForm_Group?range=0-5000`;

      // API isteklerini yapma
      const [response1, response2, response3] = await Promise.all([
        axios.get(url1, { headers }),
        axios.get(url2, { headers }),
        axios.get(url3, { headers }),
      ]);

      // Yanıtların durumlarını kontrol etme
      if (
        response1.status === 200 &&
        response2.status === 200 &&
        response3.status === 200
      ) {
        console.log("Form izinleri alındı:");
        return [response1.data, response2.data, response3.data];
      } else {
        console.error("Form izinleri alınırken hata oluştu:");
        console.error(
          `Status: ${response1.status}, ${response2.status}, ${response3.status}`
        );
        console.error(response1.data, response2.data, response3.data);
      }
    } catch (error) {
      console.error("Hata:", error);
    }
  };
  const getAllForm = async () => {
    const { storedBaseUrl, token } = await getStoredData();
    const admin_token = await loginAdminToken();
    try {
      const url1 = `${storedBaseUrl}/PluginFormcreatorForm?range=0-5000&expand_dropdowns=true`;
      const headers = {
        "App-Token": "OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ",
        "Content-Type": "application/json",
        "Session-Token": token,
      };
      const response = await axios.get(url1, { headers });
      if (response) {
        console.log("Form izinleri alındı formAllForm:",response.data ,"formAllForm");
        return response.data;
      } else {
        console.error("Form izinleri alınırken hata oluştu:");
        console.error(`Status: ${response}`);
        console.error(response.data);
      }
    } catch {
      console.error("Hata:", error);
    }
  };
  const getAllFormCategory = async () => {
    const { storedBaseUrl, token } = await getStoredData();
    
    try {
      const url1 = `${storedBaseUrl}/PluginFormcreatorCategory?range=0-500&expand_dropdowns=true`;
      const headers = {
        "App-Token": "OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ",
        "Content-Type": "application/json",
        "Session-Token": token,
      };
      const response = await axios.get(url1, { headers });
      if (response) {
        console.log("Form izinleri alındı formAllFormCategory:",response.data ,"formAllFormCategory");
        return response.data;
      } else {
        console.error("Form izinleri alınırken hata oluştu:");
        console.error(`Status: ${response}`);
        console.error(response.data);
      }
    } catch {
      console.error("Hata:", error);
    }
  };
  const getFormSection = async (form_id) => {
    const { storedBaseUrl, token } = await getStoredData();
    console.log(form_id, "id func");
  
    try {
      const url1 = `${storedBaseUrl}/PluginFormcreatorForm/${form_id}/PluginFormcreatorSection?&range=0-500&expand_dropdowns=true`;
      const headers = {
        "App-Token": "OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ",
        "Content-Type": "application/json",
        "Session-Token": token,
      };
      
      console.log(url1)
      const response = await axios.get(url1, { headers });
      
      if (response && response.data) {
        console.log("getFormSection:", response.data);
        return response.data;
      } else {
        console.error("Response data is empty");
        return null; // veya uygun bir değer döndürün
      }
    } catch (error) {
      console.error("Hata:", error.message);
      return null; // veya uygun bir değer döndürün
    }
  };
  const getFormSectionQuestion = async (section_id) => {
    const { storedBaseUrl, token } = await getStoredData();
 
  
    try {
      const url1 = `${storedBaseUrl}/PluginFormcreatorSection/${section_id}/PluginFormcreatorQuestion?range=0-100`;
      const headers = {
        "App-Token": "OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ",
        "Content-Type": "application/json",
        "Session-Token": token,
      };
      
      console.log(url1)
      const response = await axios.get(url1, { headers });
      
      if (response && response.data) {
        console.log("getFormSectionQuestion:", response.data);
        return response.data;
      } else {
        console.error("getFormSectionQuestion data is empty");
        return null; // veya uygun bir değer döndürün
      }
    } catch (error) {
      console.error("getFormSectionQuestion hata:", error.message);
      return null; // veya uygun bir değer döndürün
    }
  };
  
  const getUserForm = (userId, profileId, groupIds, userForms, profileForms, groupForms)=> {
    
    const userFormIds = new Set();
 
    userForms.forEach(form => {
      if (form.users_id === userId) {
        userFormIds.add(form.plugin_formcreator_forms_id);
      }
    });
  
    // Profil form verilerini filtreleme
    profileForms.forEach(form => {
      if (form.profiles_id === profileId) {
        userFormIds.add(form.plugin_formcreator_forms_id);
      }
    });
  
    // Grup form verilerini filtreleme
    groupForms.forEach(form => {
      if (groupIds.includes(form.groups_id)) {
        userFormIds.add(form.plugin_formcreator_forms_id);
      }
    });
    return Array.from(userFormIds);
  }
  

  return {
    getAllFormPermission,
    getAllForm,
    getAllFormCategory,
    getUserForm,getFormSection,getFormSectionQuestion
  };
};

export default useFormCalls;
