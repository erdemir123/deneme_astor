import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useAuthCalls from "./useAuthCalls";
import { useSelector } from "react-redux";

import { selectCurrentUser_id } from "../toolkit/services/AuthSlice";
import  mime  from "mime";

const useTicketCalls = () => {
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

  const getAllTickets = async () => {
    try {
      const { storedBaseUrl, token } = await getStoredData();

      const response = await axios.get(`${storedBaseUrl}/Ticket?range=0-1000`, {
        headers: {
          "App-Token": "OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ",
          "Content-Type": "application/json",
          "Session-Token": token,
        },
      });

      //console.log("Response data:", response.data);
      return response.data;
    } catch (error) {
      console.error("Fetch failed: get All Tickets", error);
      throw error;
    }
  };
  const deleteTicket = async (data) => {
    
    const { storedBaseUrl, token } = await getStoredData();
    const admin_token = await loginAdminToken();
   const  headers={
      "App-Token": "OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ",
      "Content-Type": "application/json",
      "Session-Token": admin_token,
    }
    
  
    try {
      const response = await axios.delete(`${storedBaseUrl}/Ticket/`, {
        headers: headers,
        data: data // Veri burada gönderilir
      });
      console.log(response.data);
    } catch (error) {
      console.error("Error:", error.response ? error.response.data : error.message);
    }
  };
  const getActiveProfile = async () => {
    try {
      const { storedBaseUrl, token } = await getStoredData();

      const response = await axios.get(`${storedBaseUrl}/getActiveProfile/`, {
        headers: {
          "App-Token": "OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ",
          "Content-Type": "application/json",
          "Session-Token": token,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Fetch failed: getActiveProfie", error);
      throw error;
    }
  };
  const getMyProfiles = async () => {
    try {
      const { storedBaseUrl, token } = await getStoredData();

      const response = await axios.get(`${storedBaseUrl}/getMyProfiles`, {
        headers: {
          "App-Token": "OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ",
          "Content-Type": "application/json",
          "Session-Token": token,
        },
      });

      console.log("Response data: getMyProfiles", response.data);
      return response.data;
    } catch (error) {
      console.error("Fetch failed: getMtprofile", error);
      throw error;
    }
  };
  const getTicketById = async (id) => {
    try {
      const { storedBaseUrl, token } = await getStoredData();

      const response = await axios.get(`${storedBaseUrl}/Ticket/${id}`, {
        headers: {
          "App-Token": "OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ",
          "Content-Type": "application/json",
          "Session-Token": token,
        },
      });

      //console.log("Response data: byId", response);
      return response.data;
    } catch (error) {
      console.log("Fetch failed: getTickey", error);
      error;
    }
  };
  const getTicketInfo = async (href) => {
    try {
      const admin_token = await loginAdminToken();
      //console.log(admin_token,"admin_token")
      //console.log(href)

      const { storedBaseUrl, token } = await getStoredData();

      const response = await axios.get(`${href}`, {
        headers: {
          "App-Token": "OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ",
          "Content-Type": "application/json",
          "Session-Token": admin_token,
        },
      });

      //console.log("Response data: byId ınfo", response.data, href);
      return response.data;
    } catch (error) {
      console.log("Fetch failed: getTicketInfo", error);
    }
  };
  const createTickets = async (data) => {
    try {
      const { storedBaseUrl, token } = await getStoredData();
      console.log("object", token)

      const response = await axios.post(`${storedBaseUrl}/Ticket/`, data, {
        headers: {
          "App-Token": "OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ",
          "Content-Type": "application/json",
          "Session-Token": token,
        },
      });

      console.log("Response data cretae:", response.data);
      return response.data;
    } catch (error) {
      console.error("Fetch failed: create", error);
      throw error;
    }
  };
  const addITILFollowup = async (data) => {
    try {
      const { storedBaseUrl, token } = await getStoredData();

      const response = await axios.post(
        `${storedBaseUrl}/ITILFollowup/`,
        data,
        {
          headers: {
            "App-Token": "OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ",
            "Content-Type": "application/json",
            "Session-Token": token,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Fetch failed: addITILFollowup", error);
      throw error;
    }
  };
  const changeActiveProfile = async (data) => {
    try {
      const { storedBaseUrl, token } = await getStoredData();

      const response = await axios.post(
        `${storedBaseUrl}/changeActiveProfile/`,
        data,
        {
          headers: {
            "App-Token": "OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ",
            "Content-Type": "application/json",
            "Session-Token": token,
          },
        }
      );

      // console.log("Response data cretae:", response.data);
      return response.data;
    } catch (error) {
      console.error("Fetch failed: changeActiveProfile", error);
      throw error;
    }
  };
  const addDocument = async (file, id, user_id) => {
    console.log(file);
    try {
      const { storedBaseUrl, token } = await getStoredData();

      const formdata = new FormData();
      formdata.append(
        "uploadManifest",
        JSON.stringify({
          input: {
            name: "Uploaded document",
            _filename: [file.name],
            ticket_id: id,
            users_id: user_id,
          },
        })
      );
      formdata.append("filename[0]", file, file.name);
      console.log("object formData", formdata);
      const response = await axios.post(`${storedBaseUrl}/Document`, formdata, {
        headers: {
          "App-Token": "OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ",
          "Content-Type": "multipart/form-data",
          "Session-Token": token,
        },
      });

      console.log("Response data create:", response.data);
      return response.data;
    } catch (error) {
      console.error("Fetch failed: addDocument", error);
      throw error;
    }
  };
  const updateTickets = async (data) => {
    try {
      const { storedBaseUrl, token } = await getStoredData();

      const response = await axios.put(`${storedBaseUrl}/Ticket/`, data, {
        headers: {
          "App-Token": "OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ",
          "Content-Type": "application/json",
          "Session-Token": token,
        },
      });

      console.log("Response data cretae:", response.data);
      return response.data;
    } catch (error) {
      console.error("Fetch failed: updateTickets", error);
      throw error;
    }
  };

  const getTicketCategories = async () => {
    try {
      const { storedBaseUrl, token } = await getStoredData();
      console.log(storedBaseUrl, token);

      const response = await axios.get(`${storedBaseUrl}/ITILCategory/`, {
        headers: {
          "App-Token": "OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ",
          "Content-Type": "application/json",
          "Session-Token": token,
        },
      });

      // console.log("Response data: categories", response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  const getLocation = async () => {
    try {
      const { storedBaseUrl, token } = await getStoredData();
      console.log(storedBaseUrl, token);

      const response = await axios.get(`${storedBaseUrl}/Location/`, {
        headers: {
          "App-Token": "OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ",
          "Content-Type": "application/json",
          "Session-Token": token,
        },
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  };
  const getAllUsers = async () => {
    try {
      const { storedBaseUrl, token } = await getStoredData();

      const response = await axios.get(`${storedBaseUrl}/User?range=0-1000`, {
        headers: {
          "App-Token": "OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ",
          "Content-Type": "application/json",
          "Session-Token": token,
        },
      });

      console.log(response.data, "ne hata var");
      return response.data;
    } catch (error) {
      console.error("Fetch failed users:", error);
      throw error;
    }
  };
  const DocumentItem = async (data) => {
    const admin_token = await loginAdminToken();
    try {
      const { storedBaseUrl, token } = await getStoredData();

      const response = await axios.post(
        `${storedBaseUrl}/Document_Item`,
        data,
        {
          headers: {
            "App-Token": "OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ",
            "Content-Type": "application/json",
            "Session-Token": admin_token,
          },
        }
      );

      console.log("ne hata var", response.data, "ne hata var");
      return response.data;
    } catch (error) {
      console.error("Fetch failed users:", error);
      throw error;
    }
  };





  
 
  const uploadDocument = async (file,ticket_id,user_id) => {
      const { storedBaseUrl, token } = await getStoredData();
      console.log(token, "token");

    
    const fileUri = file.assets[0].uri
    const mimeType = mime.getType(fileUri).split("/")[1]
    console.log(mimeType)
    console.log("object",fileUri)
    const formData = new FormData();
    formData.append("filename[0]", {
      uri: fileUri,
      name: `file.${mime.getType(fileUri).split("/")[1]}`,
      type: mime.getType(fileUri),
    });
    formData.append(
      "uploadManifest",
      JSON.stringify({
        input: {
          name: "Document Ticket 237",
          tickets_id: ticket_id,
          users_id: user_id,
        },
      })
    );

    try {
      const response = await axios.post(
        "http://212.253.8.154:23737/apirest.php/Document",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "App-Token": "OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ",
            "Session-Token": token,
          },
        }
      );
     
      return response.data
    } catch (error) {
      console.error(error);
    }
  };
  

  return {
    getAllTickets,
    getTicketCategories,
    getAllUsers,
    createTickets,
    getLocation,
    getTicketById,
    getTicketInfo,
    updateTickets,
    getStoredData,
    addDocument,
    uploadDocument,
    getMyProfiles,
    getActiveProfile,
    changeActiveProfile,
    addITILFollowup,
    deleteTicket,
    DocumentItem,
    
  };
};

export default useTicketCalls;
