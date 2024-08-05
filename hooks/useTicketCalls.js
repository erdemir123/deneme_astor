import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useAuthCalls from "./useAuthCalls";

import mime from "mime";

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
    //&expand_dropdowns=true
    try {
      const { storedBaseUrl, token } = await getStoredData();

      const response = await axios.get(`${storedBaseUrl}/Ticket?range=0-10000`, {
        headers: {
          "App-Token": "OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ",
          "Content-Type": "application/json",
          "Session-Token": token,
        },
      });

      //console.log("Response data:", response.data);
      return response.data;
    } catch (error) {
      console.log("Fetch failed: get All Tickets", error);
      
    }
  };
  
  const deleteTicket = async (data) => {
    const { storedBaseUrl, token } = await getStoredData();
    const admin_token = await loginAdminToken();
    const headers = {
      "App-Token": "OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ",
      "Content-Type": "application/json",
      "Session-Token": admin_token,
    };

    try {
      const response = await axios.delete(`${storedBaseUrl}/Ticket/`, {
        headers: headers,
        data: data, // Veri burada gönderilir
      });
      console.log(response.data);
    } catch (error) {
      console.log(
        "Error:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const deletePlugin = async (data) => {
    const { storedBaseUrl, token } = await getStoredData();
    const admin_token = await loginAdminToken();
    const headers = {
      "App-Token": "OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ",
      "Content-Type": "application/json",
      "Session-Token": admin_token,
    };

    try {
      const response = await axios.delete(`${storedBaseUrl}/Item_Ticket`, {
        headers: headers,
        data: data, 
      });
      console.log(response.data);
    } catch (error) {
      console.log(
        "Error:",
        error.response ? error.response.data : error.message
      );
    }
  };
  const deleteTicketUser = async (ticket_id, data) => {
    const { storedBaseUrl, token } = await getStoredData();
    const admin_token = await loginAdminToken();
    const headers = {
      "App-Token": "OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ",
      "Content-Type": "application/json",
      "Session-Token": token,
    };
console.log(data,ticket_id,`${storedBaseUrl}/Ticket/${ticket_id}/Ticket_User`)
    try {
      const response = await axios.delete(
        `${storedBaseUrl}/Ticket/${ticket_id}/Ticket_User/`,
        {
          headers: headers,
          data: data, 
        }
      );

      console.log("delete",response.data);
    } catch (error) {
      console.log(
        "Error: users",
        error.response ? error.response.data : error.message
      );
      
    }
  };

  const deleteTicketGroup = async (ticket_id, data) => {
    const { storedBaseUrl, token } = await getStoredData();
    console.log(storedBaseUrl, data);
    const headers = {
      "App-Token": "OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ",
      "Content-Type": "application/json",
      "Session-Token": token,
    };

    try {
      const response = await axios.delete(
        `${storedBaseUrl}/Ticket/${ticket_id}/Group_Ticket/`,
        {
          headers: headers,
          data: data, 
        }
      );

      console.log("delete",response.data);
    } catch (error) {
      console.log(
        "Error: group",
        error.response ? error.response.data : error.message
      );
      
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
      console.log("Fetch failed: getActiveProfie", error);
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
      console.log("Fetch failed: getMtprofile", error);
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
  const getPluginTicket = async (id) => {
    try {
      const { storedBaseUrl, token } = await getStoredData();

      const response = await axios.get(`${storedBaseUrl}/Ticket/${id}/Item_Ticket`, {
        headers: {
          "App-Token": "OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ",
          "Content-Type": "application/json",
          "Session-Token": token,
        },
      });
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
  const getTicketInfoUser = async (href) => {
    try {
      const admin_token = await loginAdminToken();
      //console.log(admin_token,"admin_token")
      //console.log(href)

      const { storedBaseUrl, token } = await getStoredData();

      const response = await axios.get(`${href}`, {
        headers: {
          "App-Token": "OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ",
          "Content-Type": "application/json",
          "Session-Token": token,
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
      console.log("object", token);

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
      console.log("Fetch failed: create", error);
      throw error;
    }
  };
  const addPluginTicket = async (data) => {
    //console.log("sata addPlugin",data,"data")
    const admin_token = await loginAdminToken();
    try {
      const { storedBaseUrl, token } = await getStoredData();
      const response = await axios.post(`${storedBaseUrl}/Item_Ticket/`, data, {
        headers: {
          "App-Token": "OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ",
          "Content-Type": "application/json",
          "Session-Token": token,
        },
      });

      console.log("Response data addPlugin:", response.data);
      return response.data;
    } catch (error) {
      console.log("Fetch failed: create", error);
      
    }
  };
  const addITILFollowup = async (data) => {
    //console.log("data",data,"data")
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
      console.log("Fetch failed: addITILFollowup", error.message);
      alert("Yetki hatası...")
    }
  };
  const addITILFollowupSolution = async (data) => {
    try {
      const { storedBaseUrl, token } = await getStoredData();

      const response = await axios.post(
        `${storedBaseUrl}/ITILSolution/`,
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
      console.log("Fetch failed: addITILFollowSolution", error);
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
      console.log("Fetch failed: changeActiveProfile", error);
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
      console.log("Fetch failed: addDocument", error);
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
      console.log("Fetch failed: updateTickets", error);
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
      console.log("Fetch failed users:", error);
      throw error;
    }
  };
  const DocumentItem = async (data) => {
    console.log(data);
    const admin_token = await loginAdminToken();
    console.log(admin_token)
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
      console.log("Fetch failed users:", error);
      throw error;
    }
  };

  const uploadDocument = async (file, ticket_id, user_id, followItems) => {
    //console.log("object upload document",file)
    //console.log(file, "file", followItems, "file,",user_id,ticket_id);
    const { storedBaseUrl, token } = await getStoredData();
    const admin_token = await loginAdminToken();
    

    const fileUri = file.uri;
    const mimeType = mime.getType(fileUri).split("/")[1];
    console.log(mimeType);
    console.log("object", fileUri);
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
      const response = await axios.post(`${storedBaseUrl}/Document`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "App-Token": "OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ",
          "Session-Token": admin_token,
        },
      });
      console.log("response upload 2", response.data);

      let documentItemResponse = null;
      if (response.data && response.data.id) {
        documentItemResponse = await DocumentItem({
          input: {
            documents_id: response.data.id,
            itemtype: followItems,
            items_id: ticket_id,
            users_id: user_id,
            // date_mod: "2024-07-02 16:46:04",
            // date_creation: "2024-07-02 16:46:04",
            // date: "2024-07-02 16:46:04",
          },
        });
      }

      return { documentUploadResponse: response.data, documentItemResponse };
    } catch (error) {
      alert("Resim Yükleniren Bir Hata Oluştu...")
    }
  };
  const uploadDocumentSingle = async (file,ticket_id,user_id,followItems) => {
    const admin_token = await loginAdminToken();
 
    console.log(file)
    const { storedBaseUrl, token } = await getStoredData();
    console.log(token, "token");

  
  const fileUri = file.assets[0].uri
  const mimeType = mime.getType(fileUri).split("/")[1]
  console.log(mimeType)
  console.log("object",fileUri)
  const formData = new FormData();
  formData.append("filename[0]", {
    uri: fileUri,
    name: `file.${mimeType}`,
    type: mimeType,
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
      `${storedBaseUrl}/Document`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          "App-Token": "OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ",
          "Session-Token": admin_token,
        },
      }
    );
    let documentItemResponse = null;
    if (response.data && response.data.id) {
      documentItemResponse = await DocumentItem({
        input: {
          documents_id: response.data.id,
          itemtype: followItems,
          items_id: ticket_id,
          users_id: user_id,
          // date_mod: "2024-07-02 16:46:04",
          // date_creation: "2024-07-02 16:46:04",
          // date: "2024-07-02 16:46:04",
        },
      });
    }

    return { documentUploadResponse: response.data, documentItemResponse };
  } catch (error) {
    console.log("resim Yüklenirken bir Hata Oluştu");
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
    uploadDocumentSingle,
    getMyProfiles,
    getActiveProfile,
    changeActiveProfile,
    addITILFollowup,
    deleteTicket,
    DocumentItem,
    addITILFollowupSolution,
    getTicketInfoUser,
    deleteTicketUser,
    deleteTicketGroup,
    addPluginTicket,
    getPluginTicket,
    deletePlugin
  };
};

export default useTicketCalls;
