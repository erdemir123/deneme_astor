import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  Linking,
} from "react-native";
import { decode } from "html-entities";
import AccordionItem from "./AccordionItem";
import * as ImagePicker from "expo-image-picker";
import DatePicker from "../DatePicker";
import { Formik } from "formik";
import { Dropdown } from "react-native-element-dropdown";
import useTicketCalls from "../../hooks/useTicketCalls";
import SectionedMultiSelect from "react-native-sectioned-multi-select";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { Entypo } from "react-native-vector-icons";
import {
  selectCurrentUser_id,
  selectProfile,
} from "../../toolkit/services/AuthSlice";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Accordion = ({ id }) => {
  const navigation = useNavigation();
  const user_id = useSelector(selectCurrentUser_id);
  const { name } = useSelector(selectProfile);
  const [openIndex, setOpenIndex] = useState(0); // Default to 0 to open the first item
  const [category, setCategory] = useState([]);
  const [allGroup, setAllGroup] = useState([]);
  const [viewer, setViewer] = useState([]);
  const [selectViewer, setSelectViewer] = useState([]);
  const [selectRequester, setSelectRequester] = useState([]);
  const [selectAssing, setSelectAssings] = useState([]);
  const [location, setLocation] = useState([]);
  const [ticket, setTicket] = useState();
  const [document, setDocument] = useState([]);
  const [isCreator, setIsCreator] = useState(false);
  const [followItems, setFollowItems] = useState([]);
  const [followDocs, setFollowDocs] = useState([]);
  const [baseUrl, setBaseUrl] = useState({ baseUrl: "", token: "" });
  const [isModalVisible, setModalVisible] = useState(false);
  const [isModalImage, setModalImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFollow, setImageFollow] = useState();
  const [updateGroup, setUpdateGroup] = useState();
  const [ticketUser, setTicketUser] = useState([]);
  const [ticketGroup, setTicketGroup] = useState([]);
  const [selectedInfo, setSelectedInfo] = useState([]);
  const [observerDefault, setObserverDefault] = useState([]);
  const [requesterDefault, setRequesterDefault] = useState([]);
  const [assignDefault, setAssignDefault] = useState([]);
  const [file, setFile] = useState();
  const [selectImagePicker, setSelectImagePicker] = useState();
  const [isLoadingFollowUp, setiIsLoadingFollowUp] = useState(false);
  const [followUpType, setFollowUpType] = useState(1);
  const [missionModal, setMissionModal] = useState(false);
  const [myDevices, setMyDevices] = useState([]);
  const [myDevicesDefault, setMyDevicesDefault] = useState([]);
  const [defaultDevices, setDefaultDevice] = useState([]);
  const [followSolutionArr, setFollowSolutionArr] = useState([]);

  const [initialValues, setInitialValues] = useState({
    type: "",
    itilcategories_id: "",
    locations_id: "",
    // _users_id_requester: [],
    // _users_id_assign: [],
    date_creation: new Date(),
    status: "",
    requesttypes_id: "",
    name: "",
    content: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const [loading, setLoading] = useState(true); // Loading state

  const {
    getTicketById,
    getTicketInfo,
    updateTickets,
    deleteTicketUser,
    deleteTicketGroup,
    getStoredData,
    addITILFollowup,
    deleteTicket,
    uploadDocument,
    uploadDocumentSingle,
    addITILFollowupSolution,
    getTicketInfoUser,
    getPluginTicket,
    addPluginTicket,
    deletePlugin,
  } = useTicketCalls();

  const handlePress = (index) => {
    setOpenIndex(index === openIndex ? null : index);
  };

  const type = [
    { label: "Arıza", value: "1" },
    { label: "İstek", value: "2" },
  ];
  const status = [
    { label: "Yeni", value: "1" },
    { label: "İşleniyor (atanmış)", value: "2" },
    { label: "İşleniyor (planlanmış)", value: "3" },
    { label: "Bekliyor", value: "4" },
    { label: "Çözülmüş", value: "5" },
    { label: "Kapalı", value: "6" },
  ];
  const request_source = [
    { label: "Help-Desk", value: "1" },
    { label: "Email ", value: "2" },
    { label: "Phone", value: "3" },
    { label: "Direct", value: "4" },
    { label: "Written", value: "5" },
    { label: "Other", value: "6" },
    { label: "formCreator", value: "7" },
  ];
  const checkCondition = (name, isCreator) => {
    // Eğer kullanıcı adı "Teknisyen" ise
    if (name === "Teknisyen") {
      return true;
    }

    // Eğer kullanıcı adı "Self-Service" ve kayıt açan kişi kendisi ise
    if (name === "Self-Service" && isCreator) {
      return true;
    }

    // Diğer tüm durumlarda false döner
    return false;
  };
  const fetchTickets = async () => {
    console.log("object fetch çalıştı")
    const { storedBaseUrl, token } = await getStoredData();
    try {
      const ticketById = await getTicketById(id);
      console.log(" ticketByIs", ticketById.users_id_recipient, user_id);
      setIsCreator(
        ticketById.users_id_recipient.toString() === user_id.toString()
      );
      setTicket(ticketById);
      const ITILCategoryString = await AsyncStorage.getItem("ITILCategory");
      const ITILCategoryAll = ITILCategoryString
        ? JSON.parse(ITILCategoryString)
        : [];

      setCategory(
        ITILCategoryAll.map((item) => ({
          label: item.completename,
          value: item.id.toString(),
        }))
      );
      //user
      const usersString = await AsyncStorage.getItem("User");
      const users = usersString ? JSON.parse(usersString) : [];

      setViewer(users);
      //group
      const groupString = await AsyncStorage.getItem("Group");
      const group = groupString ? JSON.parse(groupString) : [];
      setAllGroup(group);
      //location
      const locationString = await AsyncStorage.getItem("Location");
      const locationAll = locationString ? JSON.parse(locationString) : [];
      setLocation(
        locationAll.map((item) => ({
          label: item.completename,
          value: item.id.toString(),
        }))
      );
      //Devices
      const myDevice = await AsyncStorage.getItem("myDevices");
      const defaultDevice = await getPluginTicket(ticketById?.id);

      if (myDevice !== null) {
        const parsedDevices = JSON.parse(myDevice);
        const modifiedData = parsedDevices.map((item) => {
          //const newLabel = item.label.split(" - ")[0]; // "-" karakterine göre böl ve ilk kısmı al
          return { ...item, name: item.label }; // Yeni label ile nesneyi dön
        });
        setMyDevices(modifiedData);
        setMyDevicesDefault(
          defaultDevice.map((item) => item.items_id.toString())
        );
        setDefaultDevice(defaultDevice.map((item) => ({
          id: item.id.toString(),
          value: item.items_id.toString()
        })));
        
      }
      //requester

      const ticketUserLink = ticketById?.links.filter(
        (link) => link.rel == "Ticket_User"
      );
      console.log(ticketUserLink, "ticketUserLink");
      const ticketGroupLink = ticketById?.links.filter(
        (link) => link.rel == "Group_Ticket"
      );
      const data = await getTicketInfo(ticketUserLink[0].href);
      setTicketUser(data.map((item) => item.id));
      const resultUser = {
        input: data.map((item) => ({ id: item.users_id })),
      };
      const formattedUserObserver = data
        .filter((item) => item.type === 3)
        .map((item) => `user-${item.users_id}`);
      const dataGroup = await getTicketInfo(ticketGroupLink[0].href);
      //console.log("data", dataGroup);
      setTicketGroup(dataGroup.map((item) => item.id));
      const formattedGroupObserver = dataGroup
        .filter((item) => item.type === 3)
        .map((item) => `group-${item.groups_id}`);

      const formattedUserRequester = data
        .filter((item) => item.type === 1)
        .map((item) => `user-${item.users_id}`);

      const formattedGroupRequester = dataGroup
        .filter((item) => item.type === 1)
        .map((item) => `group-${item.groups_id}`);

      const formattedUserAssign = data
        .filter((item) => item.type === 2)
        .map((item) => `user-${item.users_id}`);

      const formattedGroupAssign = dataGroup
        .filter((item) => item.type === 2)
        .map((item) => `group-${item.groups_id}`);

      setObserverDefault((prev) => {
        const newItems = [
          ...prev,
          ...formattedUserObserver,
          ...formattedGroupObserver,
        ];
        const uniqueItems = Array.from(new Set(newItems));
        return uniqueItems;
      });
      setRequesterDefault((prev) => {
        const newItems = [
          ...prev,
          ...formattedUserRequester,
          ...formattedGroupRequester,
        ];
        const uniqueItems = Array.from(new Set(newItems));
        return uniqueItems;
      });
      setAssignDefault((prev) => {
        const newItems = [
          ...prev,
          ...formattedUserAssign,
          ...formattedGroupAssign,
        ];
        const uniqueItems = Array.from(new Set(newItems));
        return uniqueItems;
      });

      const filteredIdViewer = data
        .filter((item) => item.type === 1)
        .map((item) => item.users_id);
      const filteredIdRequester = data
        .filter((item) => item.type === 3)
        .map((item) => item.users_id);
      const filteredIdAssing = data
        .filter((item) => item.type === 2)
        .map((item) => item.users_id);

      setSelectViewer(filteredIdViewer);
      setSelectRequester(filteredIdRequester);
      setSelectAssings(filteredIdAssing);

      //Documnet
      const documnetLink = ticketById?.links.filter(
        (link) => link.rel == "Document_Item"
      );
      const documentData = await getTicketInfo(documnetLink[0].href);

      const filteredIdDocumnet = documentData.map(
        (item) => item.documents_id
      );

      setDocument(filteredIdDocumnet);

      //followUp
      const followLink = ticketById?.links.filter(
        (link) => link.rel === "ITILFollowup"
      );

      const followUp = await getTicketInfo(followLink[0].href);
      const followSolution = await getTicketInfoUser(
        `${storedBaseUrl}/Ticket/${ticketById?.id}/ITILSolution`
      );

      //console.log("followSolution", followSolution, "followSolution");

      // Fetch responses for each follow-up item
      const followUpResponses = await Promise.all(
        followUp.map((item) =>
          getTicketInfo(
            `${storedBaseUrl}/ITILFollowup/${item.id}/Document_Item/`
          )
        )
      );
      //console.log("followUpResponses",followUpResponses)

      const combinedFollowItems = followUp.map((item, index) => ({
        ...item,
        followdoc: followUpResponses[index] || [],
      }));

      // Set the combined follow items in state
      setFollowItems(combinedFollowItems);
      setFollowSolutionArr(followSolution);

      setBaseUrl({ baseUrl: storedBaseUrl, token: token });

      setLoading(false); // Data fetched, set loading to false
    } catch (error) {
      console.log("eroor", error);
      setLoading(false); // Even on error, set loading to false
    }
  };
  useEffect(() => {
   

    fetchTickets();
    //checkCondition(name,isCreator)
  }, []);

  useEffect(() => {
    if (ticket) {
      setInitialValues({
        type: String(ticket.type),
        itilcategories_id: ticket.itilcategories_id.toString(),
        locations_id: ticket.locations_id.toString(),
        date_creation: ticket.date_creation,
        status: ticket.status.toString(),
        requesttypes_id: ticket?.requesttypes_id.toString(),
        name: ticket.name,
        content: stripHtmlTags(decode(ticket.content)),
      });
    }
  }, [ticket]);

  const openModal = (imageUri) => {
    setSelectedImage(imageUri);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
  };
  const stripHtmlTags = (str) => {
    return str.replace(/<\/?[^>]+(>|$)/g, "");
  };
  const getRequestTypeLabel = (requestTypeId) => {
    const viewerItem = viewer.find((item) => item.id === requestTypeId);

    return viewerItem ? viewerItem.name : "Unknown Viewer Name";
  };
  const handleAddClick = () => {
    setIsAdding(true);
  };
  const handleDelete = async () => {
    if (ticket.status == 1 && name == "Self-Service") {
      const res = await deleteTicket({
        input: {
          id: ticket.id,
        },
      });
      navigation.navigate("Home");
    } else {
      alert("yetkisiz işlem");
    }
  };

  const handleOpenUrl = async (url) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("An error occurred", error);
    }
  };

  const createFollowupInput = (ticket, user_id, inputValue) => {
    let input = {
      itemtype: "Ticket",
      items_id: ticket.id,
      users_id_editor: user_id,
      content: inputValue,
      requesttypes_id: user_id,
    };

    if (followUpType === 2) {
      input.status = 2;
    }

    return input;
  };
  const handleSendClick = async () => {
    const { storedBaseUrl, token } = await getStoredData();
    console.log(inputValue, "inputValue");
    if (inputValue !== "") {
      setiIsLoadingFollowUp(true);
      let res;
      const input = createFollowupInput(ticket, user_id, inputValue);
      if (followUpType === 1) {
        res = await addITILFollowup({
          input,
        });
      } else {
        res = await addITILFollowupSolution({
          input,
        });
      }
      console.log(res, "res");
      setIsAdding(false);
      setInputValue("");
      setImageFollow(res?.id);
      if (res?.id && file) {
        console.log("object",file)
        const documentRes = await uploadDocumentSingle(
          file,
          res?.id,
          user_id,
          "ITILFollowup"
        );
        console.log(documentRes,"documentREs")
      } else {
        console.log("object seçilmedi");
      }
      setFile(null);
      setSelectImagePicker(null);

      const followLink = ticket?.links.filter(
        (link) => link.rel == "ITILFollowup"
      );
      const followUp = await getTicketInfo(followLink[0].href);
      // Fetch responses for each follow-up item
      const followUpResponses = await Promise.all(
        followUp.map((item) =>
          getTicketInfo(
            `${storedBaseUrl}/ITILFollowup/${item.id}/Document_Item/`
          )
        )
      );

      const combinedFollowItems = followUp.map((item, index) => ({
        ...item,
        followdoc: followUpResponses[index] || [],
      }));

      const followSolution = await getTicketInfoUser(
        `${storedBaseUrl}/Ticket/${ticket?.id}/ITILSolution`
      );

      setFollowItems(combinedFollowItems);
      setFollowSolutionArr(followSolution)
      setiIsLoadingFollowUp(false);
      setMissionModal(false);
     
    } else {
      alert("Takip Mesajı Boş olamaz");
    }
  };


  //group and viewer
  const allUser = [
    {
      id: "user-list",
      name: "User List",
      children: viewer.map((item) => ({ ...item, id: `user-${item.id}` })), // user- ön eki ekleyerek benzersiz yapıyoruz
    },
  ];

  const group = [
    {
      id: "group-list",
      name: "Group List",
      children: allGroup.map((item) => ({ ...item, id: `group-${item.id}` })), // group- ön eki ekleyerek benzersiz yapıyoruz
    },
  ];

  const combinedItems = [...allUser, ...group];

  const loadMoreItems = async () => {
    console.log("You have reached the end of the list");
  };
  //console.log(observerDefault);

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const uri = result?.assets[0].uri;
        setFile(result);
        setSelectImagePicker(uri);
      }
    } catch (err) {
      console.error("Error picking image:", err);
    }
  };

  useEffect(() => {
    const processObserverDefault = () => {
      const updatedSelectedInfo = observerDefault
        .map((item) => {
          const [type, id] = item.split("-");

          if (type === "user") {
            const user = viewer.find((user) => user.id === parseInt(id));
            if (user) {
              return { id: user.id, name: user.name, parentName: "User List" };
            }
          } else if (type === "group") {
            const group = allGroup.find((group) => group.id === parseInt(id));
            if (group) {
              return {
                id: group.id,
                name: group.name,
                parentName: "Group List",
              };
            }
          }

          return null;
        })
        .filter((info) => info !== null);
      setSelectedInfo(updatedSelectedInfo);
    };
    processObserverDefault();
  }, [observerDefault]);


  if (loading) {
    return (
      <ActivityIndicator
        size={"large"}
        color="red"
        style={styles.loader}
        animating={true}
      />
    );
  }
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container}>
        <Formik
          enableReinitialize
          initialValues={initialValues}
          onSubmit={async (values) => {
            const usersIdRequester = requesterDefault
              .filter((item) => item.startsWith("user-")) // "user-" ile başlayanları filtrele
              .map((item) => +item.split("-")[1]);
            const groupsIdRequester = requesterDefault
              .filter((item) => item.startsWith("group-")) // "user-" ile başlayanları filtrele
              .map((item) => +item.split("-")[1]);
            const usersIdObserver = observerDefault
              .filter((item) => item.startsWith("user-")) // "user-" ile başlayanları filtrele
              .map((item) => +item.split("-")[1]);
            const groupsIdObserver = observerDefault
              .filter((item) => item.startsWith("group-")) // "user-" ile başlayanları filtrele
              .map((item) => +item.split("-")[1]);
            const usersIdAssign = assignDefault
              .filter((item) => item.startsWith("user-")) // "user-" ile başlayanları filtrele
              .map((item) => +item.split("-")[1]);
            const groupsIdAssign = assignDefault
              .filter((item) => item.startsWith("group-")) // "user-" ile başlayanları filtrele
              .map((item) => +item.split("-")[1]);
            // const usersIds = selectedInfo
            //   .filter((info) => info.parentName === "User List")
            //   .map((info) => +info.id);

            // const groupsIds = selectedInfo
            //   .filter((info) => info.parentName === "Group List")
            //   .map((info) => parseInt(info.id));
            const delTicketUsers = [
              ...usersIdAssign,
              ...usersIdObserver,
              ...usersIdRequester,
            ];

            const delTicketGroups = [
              ...groupsIdAssign,
              ...groupsIdObserver,
              ...groupsIdRequester,
            ];

            const resultUser = {
              input: ticketUser.map((id) => ({ id })),
            };
            const resultGroup = {
              input: ticketGroup.map((id) => ({ id })),
            };

            const resDeleteUser = await deleteTicketUser(
              ticket?.id,
              resultUser
            );
            const resDeleteGroup = await deleteTicketGroup(
              ticket?.id,
              resultGroup
            );
            //console.log("demeöe",resDeleteUser)

            const input = {
              id: ticket?.id,
              users_id_recipient: user_id,
              ...values,
              _groups_id_assign: groupsIdAssign,
              _users_id_assign: usersIdAssign,
              _groups_id_requester: groupsIdRequester,
              _users_id_requester: usersIdRequester,
              _groups_id_observer: groupsIdObserver,
              _users_id_observer: usersIdObserver,
            };
            const result = {
              input: defaultDevices.map((device) => ({ id: device.id })),
            };
            console.log(result, "reresult");
            
            const deletePluginTicket = await deletePlugin(result);

            const resultUpdate = await updateTickets({ input });
            const machine = {
              input: myDevicesDefault.map((item) => ({
                itemtype: "PluginGenericobjectMakine",
                items_id: parseInt(item), // item değeri string olduğu için parseInt ile sayıya çeviriyoruz
                tickets_id: ticket?.id,
              })),
            };
            const resultaddPlugin = await addPluginTicket(machine);
           fetchTickets()
           alert("Destek Kaydı Güncellendi")
            //navigation.navigate("Support");
          }}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            setFieldValue,
            errors,
          }) => (
            <View className="bg-red-500 py-4 px-3 rounded-[8px] ">
              <AccordionItem
                title="Destek kaydı"
                isOpen={openIndex === 0}
                onPress={() => handlePress(0)}
                content={
                  <View style={styles.content}>
                    {/* <DatePicker
                      defaultDate={ticket?.date_creation}
                      label="Seçilen Tarih"
                      func={(date) => setFieldValue("date_creation", date)}
                    /> */}
                    <View className="mt-1">
                      <Text className="text-body-small text-red-500 font-semibold">
                        Tip
                      </Text>
                      <Dropdown
                        style={styles.dropdown}
                        className="mt-1 w-full"
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        iconStyle={styles.iconStyle}
                        data={type}
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        disable={name == "Self-Service" ? true : false}
                        placeholder=""
                        value={values.type}
                        onChange={(item) => setFieldValue("type", item.value)}
                      />
                    </View>
                    <View className="mt-1">
                      <Text className="text-body-small text-red-500 font-semibold">
                        Kategori
                      </Text>
                      <Dropdown
                        style={styles.dropdown}
                        className="mt-1 w-full"
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        iconStyle={styles.iconStyle}
                        data={category}
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder="Kategori"
                        search
                        searchPlaceholder="Search..."
                        value={values.itilcategories_id}
                        onChange={(item) => {
                          setFieldValue("itilcategories_id", item.value);
                        }}
                      />
                    </View>
                    <View className="mt-1">
                      <Text className="text-body-small text-red-500 font-semibold">
                        Durum
                      </Text>
                      <Dropdown
                        style={styles.dropdown}
                        className="mt-1 w-full"
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        iconStyle={styles.iconStyle}
                        data={status}
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder="Durum"
                        disable={name == "Self-Service" ? true : false}
                        search
                        searchPlaceholder="Search..."
                        value={values.status}
                        onChange={(item) => {
                          setFieldValue("status", item.value);
                        }}
                      />
                    </View>
                    <View className="mt-1">
                      <Text className="text-body-small text-red-500 font-semibold">
                        İstek Kaynağı
                      </Text>
                      <Dropdown
                        style={styles.dropdown}
                        className="mt-1 w-full"
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        iconStyle={styles.iconStyle}
                        data={request_source}
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder="İstek Kaynağı"
                        search
                        disable={name == "Self-Service" ? true : false}
                        searchPlaceholder="Search..."
                        value={values.requesttypes_id}
                        onChange={(item) => {
                          setFieldValue("requesttypes_id", item.value);
                        }}
                      />
                    </View>
                    <View className="mt-1">
                      <Text className="text-body-small text-red-500 font-semibold">
                        Konum
                      </Text>
                      <Dropdown
                        style={styles.dropdown}
                        className="mt-1 w-full"
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        iconStyle={styles.iconStyle}
                        data={location}
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        disable={name == "Self-Service" ? true : false}
                        search
                        searchPlaceholder="Konum..."
                        placeholder="Konum"
                        value={values.locations_id}
                        onChange={(item) =>
                          setFieldValue("locations_id", item.value)
                        }
                      />
                    </View>
                    <View className="mt-1">
                      <Text className="text-body-small text-red-500 font-semibold">
                        İlişkilendirilmiş Cihaz
                      </Text>
                      <SectionedMultiSelect
                        items={myDevices} // myDevices, id ve label içermeli
                        IconRenderer={Icon}
                        uniqueKey="value" // Veya id, emin olun ki benzersiz
                        subKey="children"
                        disabled={name == "Self-Service" ? true : false}
                        selectedItems={myDevicesDefault}
                        selectText="İlişkilendirilmiş Cihazlar..."
                        styles={{
                          selectToggle: styles.selectToggle,
                          selectToggleText: styles.selectToggleText,
                          chipContainer: styles.chipContainer,
                          chipText: styles.chipText,
                          itemText: styles.itemText,
                          subItemText: styles.subItemText,
                          selectedItemText: styles.selectedItemText,
                          selectedSubItemText: styles.selectedSubItemText,
                          confirmText: styles.confirmText,
                          searchBar: styles.searchBar,
                          button: styles.button,
                          buttonText: styles.buttonText,
                        }}
                        onSelectedItemsChange={(selectedItems) => {
                          setMyDevicesDefault((prev) => {
                            const prevSet = new Set(prev);
                            const selectedSet = new Set(selectedItems);

                            selectedSet.forEach((item) => prevSet.add(item));

                            prevSet.forEach((item) => {
                              if (!selectedSet.has(item)) {
                                prevSet.delete(item);
                              }
                            });

                            return Array.from(prevSet);
                          });
                        }}
                      />
                    </View>
                    <View className="w-full  flex justify-center items-center bg-red-500 my-2 rounded-md">
                      <Text className="text-title-medium py-2 text-white font-semibold">
                        İçerik Bölümü
                      </Text>
                    </View>
                    <View className="mt-1">
                      <Text className="text-body-small text-red-500 font-semibold">
                        Başlık
                      </Text>
                      <TextInput
                        placeholder="Başlık"
                        multiline={true}
                        className={`w-full border-[1px] mt-1 border-red-500 p-2 rounded-[8px]  placeholder:text-default placeholder:text-title-medium ${
                          errors.name && touched.name
                            ? "border-paradise "
                            : "border-[1px] border-paradise"
                        }`}
                        onChangeText={handleChange("name")}
                        onBlur={handleBlur("name")}
                        value={values.name}
                        editable={name !== "Self-Service"}
                      />
                    </View>
                    <View className="mt-1">
                      <Text className="text-body-small text-red-500 font-semibold">
                        İçerik
                      </Text>
                      <TextInput
                        placeholder="İçerik"
                        multiline={true}
                        className={`w-full  border-[1px] mt-1 border-red-500 p-2 rounded-[8px]  placeholder:text-text-default placeholder:text-title-medium ${
                          errors.content && touched.content
                            ? "border-paradise "
                            : "border-[1px] border-paradise"
                        }`}
                        onChangeText={handleChange("content")}
                        onBlur={handleBlur("content")}
                        value={values.content}
                        editable={name !== "Self-Service"}
                      />
                    </View>
                    <View className="flex  mt-4 ">
                      <Text className="text-red-500 font-semibold text-title-medium">
                        Takip Mesajları
                      </Text>
                    </View>
                    {isLoadingFollowUp ? (
                      <View>
                        
                        <ActivityIndicator />
                      </View>
                    ) : (
                      <View
                        style={styles.content}
                        className="flex  gap-2 mt-1 "
                      >
                        {followItems.length === 0 ? (
                          <Text className="text-red-500">
                            {followSolutionArr.length > 0
                              ? null
                              : "Eklenen Takip Mesajı Bulunamadı..."}
                          </Text>
                        ) : (
                          <>
                            {followItems.map((item, index) => (
                              <View
                                key={index}
                                className={`${
                                  user_id === item.users_id
                                    ? "items-end"
                                    : "items-start"
                                }`}
                              >
                                <View
                                  className={` ${
                                    index % 2 == 0 ? "bg-red-500" : "bg-red-200"
                                  } flex gap-1 p-2 rounded-md w-[80%] border mt-2 `}
                                >
                                  <Text className="text-title-small text-default font-semibold ">
                                    {stripHtmlTags(decode(item.content))}
                                  </Text>

                                  <View>
                                    {item.followdoc &&
                                    Array.isArray(item.followdoc)
                                      ? item.followdoc.map(
                                          (followItems, index) => {
                                            return (
                                              <TouchableOpacity
                                                key={index}
                                                onPress={() => {
                                                  const url = `${baseUrl.baseUrl}/Document/${followItems.documents_id}?alt=media&app_token=OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ&session_token=${baseUrl.token}`;

                                                  handleOpenUrl(url);
                                                }}
                                              >
                                                <Image
                                                  source={{
                                                    uri: `${baseUrl.baseUrl}/Document/${followItems.documents_id}?alt=media&app_token=OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ&session_token=${baseUrl.token}`,
                                                  }}
                                                  className="w-full h-40 rounded-lg my-2"
                                                  resizeMode="cover" // resmin doğru şekilde sığmasını sağlar
                                                />
                                                <Text>
                                                  {followItems.documents_id}
                                                  .image
                                                </Text>
                                              </TouchableOpacity>
                                            );
                                          }
                                        )
                                      : null}
                                  </View>

                                  <Text className="text-slate-600 font-medium text-body-small">
                                    Oluşturma zamanı: {item.date_creation}
                                  </Text>
                                  <Text className="text-slate-600 font-medium text-body-small">
                                    Oluşturan:{" "}
                                    {getRequestTypeLabel(item.users_id)}
                                  </Text>
                                </View>
                              </View>
                            ))}
                          </>
                        )}
                        {followSolutionArr?.map((item, index) => (
                          <View
                            key={index}
                            className={`${
                              user_id === item.users_id
                                ? "items-end"
                                : "items-start"
                            }`}
                          >
                            <View
                              className={` ${
                                index % 2 == 0 ? "bg-blue-500" : "bg-blue-200"
                              } flex gap-1 p-2 rounded-md w-[80%] border mt-2 `}
                            >
                              <Text className="text-title-small text-default font-semibold ">
                                {stripHtmlTags(decode(item.content))}
                              </Text>

                              <View>
                                {item.followdoc && Array.isArray(item.followdoc)
                                  ? item.followdoc.map((followItems, index) => {
                                      return (
                                        <TouchableOpacity
                                          key={index}
                                          onPress={() => {
                                            const url = `${baseUrl.baseUrl}/Document/${followItems.documents_id}?alt=media&app_token=OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ&session_token=${baseUrl.token}`;

                                            handleOpenUrl(url);
                                          }}
                                        >
                                          <Image
                                            source={{
                                              uri: `${baseUrl.baseUrl}/Document/${followItems.documents_id}?alt=media&app_token=OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ&session_token=${baseUrl.token}`,
                                            }}
                                            className="w-full h-40 rounded-lg my-2"
                                            resizeMode="cover" // resmin doğru şekilde sığmasını sağlar
                                          />
                                          <Text>
                                            {followItems.documents_id}
                                            .image
                                          </Text>
                                        </TouchableOpacity>
                                      );
                                    })
                                  : null}
                              </View>

                              <Text className="text-slate-600 font-medium text-body-small">
                                Oluşturma zamanı: {item.date_creation}
                              </Text>
                              <Text className="text-slate-600 font-medium text-body-small">
                                Oluşturan: {getRequestTypeLabel(item.users_id)}
                              </Text>
                            </View>
                          </View>
                        ))}
                        {isAdding && (
                          <View className="flex justify-center item-center">
                            <View className="flex items-end">
                              <TouchableOpacity
                                className="w-[10%] bg-red-50 py-2 rounded-[4px] mx-"
                                onPress={() => setIsAdding(false)}
                              >
                                <Text className=" text-center text-default font-semibold text-title-small">
                                  X
                                </Text>
                              </TouchableOpacity>
                            </View>
                            <TextInput
                              className="mt-1  border border-red-500 py-4 rounded-[4px] px-2 text-title-small"
                              placeholder="Yeni içerik"
                              value={inputValue}
                              multiline
                              onChangeText={setInputValue}
                            />
                            <View className="flex flex-row w-full mb-2 items-center justify-center ">
                              {(followUpType === 1 || followSolutionArr.length > 0) && (
                                <TouchableOpacity
                                  title=""
                                  onPress={() => handleImagePick()}
                                  className=" bg-red-500 w-36 ml-2 justify-center items-center flex rounded-md my-2 h-12 "
                                >
                                  <Text className="text-white  font-semibold  text-center">
                                    Galeriyi Aç
                                  </Text>
                                </TouchableOpacity>
                              )}
                              {selectImagePicker && (
                                <View className="flex flex-row pl-2">
                                  <Image
                                    source={{ uri: selectImagePicker }}
                                    style={{ width: 48, height: 48 }}
                                    className="rounded-md"
                                  />
                                  <TouchableOpacity
                                    onPress={() => {
                                      setFile(null);
                                      setSelectImagePicker(null);
                                    }}
                                    className="bg-red-500 w-36 ml-2 justify-center items-center flex rounded-md"
                                  >
                                    <Text className="text-white  font-semibold  text-center">
                                      Seçimi kaldır
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                              )}
                            </View>
                            <TouchableOpacity
                              className="mt-4 bg-red-500 py-2 rounded-[4px] flex justify-center items-center flex-row "
                              onPress={handleSendClick}
                            >
                              <FontAwesome name="send" size={20} color="#FFF" />
                              <Text className="text-center text-default font-semibold text-title-small ml-2">
                                Gönder
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                        {!isAdding &&
                          ticket?.status.toString() !== "5" &&
                          ticket?.status.toString() !== "6" && (
                            <View className="flex ">
                              <View className="flex flex-row mb-4">
                                <TouchableOpacity
                                  className={`${
                                    name === "Self-Service"
                                      ? "w-full"
                                      : "w-[80%]"
                                  } mt-4  bg-red-500 py-2 rounded-[4px]`}
                                  onPress={handleAddClick}
                                >
                                  <Text className=" text-center text-white font-semibold text-title-small">
                                    Ekle (
                                    {followUpType === 1
                                      ? "Yanıt Ekle"
                                      : "Çözüm Ekle"}
                                    )
                                  </Text>
                                </TouchableOpacity>
                                {name !== "Self-Service" && (
                                  <TouchableOpacity
                                    className="mt-4 w-[18%] bg-red-500 py-2 rounded-[4px] ml-2"
                                    onPress={() =>
                                      setMissionModal(!missionModal)
                                    }
                                  >
                                    <Text className=" text-center text-default font-semibold text-title-small">
                                      <FontAwesome
                                        name="chevron-down"
                                        size={20}
                                        color="#FFF"
                                      />
                                    </Text>
                                  </TouchableOpacity>
                                )}
                              </View>
                              <View className="relative bg-red-500 ">
                                {missionModal && (
                                  <View className="flex flex-row  justify-center items-center gap-4 py-2">
                                    <TouchableOpacity
                                      onPress={() => setFollowUpType(1)}
                                      className="px-2 py-1 bg-whitekozy rounded-md"
                                    >
                                      <Text className="text-default font-semibold text-title-small">
                                        Yanıt Ekle
                                      </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                      onPress={() => setFollowUpType(2)}
                                      className="px-2 py-1 bg-whitekozy rounded-md"
                                    >
                                      <Text className="text-default font-semibold text-title-small">
                                        Çözüm Ekle
                                      </Text>
                                    </TouchableOpacity>
                                  </View>
                                )}
                              </View>
                            </View>
                          )}
                      </View>
                    )}
                  </View>
                }
              />
              <AccordionItem
                title="Aktörler"
                isOpen={openIndex === 1}
                onPress={() => handlePress(1)}
                content={
                  <View style={styles.content}>
                    <SectionedMultiSelect
                      items={combinedItems}
                      IconRenderer={Icon}
                      uniqueKey="id"
                      subKey="children"
                      selectedItems={requesterDefault}
                      disabled={name == "Self-Service" ? true : false}
                      selectText="İstekte Bulunan..."
                      styles={{
                        selectToggle: styles.selectToggle,
                        selectToggleText: styles.selectToggleText,
                        chipContainer: styles.chipContainer,
                        chipText: styles.chipText,
                        itemText: styles.itemText,
                        subItemText: styles.subItemText,
                        selectedItemText: styles.selectedItemText,
                        selectedSubItemText: styles.selectedSubItemText,
                        confirmText: styles.confirmText,
                        searchBar: styles.searchBar,
                        button: styles.button,
                        buttonText: styles.buttonText,
                      }}
                      onSelectedItemsChange={(selectedItems) => {
                        if (name !== "Self-Service") {
                          setRequesterDefault([...selectedItems]);
                        }
                      }}
                    />

                    <SectionedMultiSelect
                      items={combinedItems}
                      IconRenderer={Icon}
                      uniqueKey="id"
                      subKey="children"
                      selectText="İzleyiciler..."
                      showDropDowns={true}
                      readOnlyHeadings={true}
                      showChips={true}
                      disabled={name == "Self-Service" ? true : false}
                      selectedItems={observerDefault}
                      styles={{
                        selectToggle: styles.selectToggle,
                        selectToggleText: styles.selectToggleText,
                        chipContainer: styles.chipContainer,
                        chipText: styles.chipText,
                        itemText: styles.itemText,
                        subItemText: styles.subItemText,
                        selectedItemText: styles.selectedItemText,
                        selectedSubItemText: styles.selectedSubItemText,
                        confirmText: styles.confirmText,
                        searchBar: styles.searchBar,
                        button: styles.button,
                        buttonText: styles.buttonText,
                      }}
                      onSelectedItemsChange={(selectedItems) => {
                        if (name !== "Self-Service") {
                          setObserverDefault([...selectedItems]); // Sadece 'Self-Service' değilse seçim güncellenir
                        }
                      }}
                      onEndReached={loadMoreItems}
                      onEndReachedThreshold={0.1}
                      ListFooterComponent={
                        loading && (
                          <ActivityIndicator size="large" color="#0000ff" />
                        )
                      }
                    />
                    {/* {selectedInfo.length > 0 && (
                      <>
                        <View className=" w-full flex flex-row justify-start items-center mt-2 flex-wrap ">
                          {selectedInfo.map((info, index) => (
                            <View
                              key={index}
                              className="w-30   my-1 mr-2 bg-paradise rounded-md"
                            >
                              <Text className="px-2 py-1 text-whitekozy font-medium ">{`${info.name}`}</Text>
                            </View>
                          ))}
                        </View>
                      </>
                    )} */}
                    <View className="relative ">
                      <SectionedMultiSelect
                        items={combinedItems}
                        IconRenderer={Icon}
                        uniqueKey="id"
                        subKey="children"
                        disabled
                        selectedItems={assignDefault}
                        selectText="Atanan..."
                        styles={{
                          selectToggle: styles.selectToggle,
                          selectToggleText: styles.selectToggleText,
                          chipContainer: styles.chipContainer,
                          chipText: styles.chipText,
                          itemText: styles.itemText,
                          subItemText: styles.subItemText,
                          selectedItemText: styles.selectedItemText,
                          selectedSubItemText: styles.selectedSubItemText,
                          confirmText: styles.confirmText,
                          searchBar: styles.searchBar,
                          button: styles.button,
                          buttonText: styles.buttonText,
                        }}
                        onSelectedItemsChange={(selectedItems) => {
                          if (name !== "Self-Service") {
                            setAssignDefault([...selectedItems]); // Sadece 'Self-Service' değilse seçim güncellenir
                          }
                        }}
                        onEndReached={loadMoreItems}
                        onEndReachedThreshold={0.1}
                        ListFooterComponent={
                          loading && (
                            <ActivityIndicator size="large" color="#0000ff" />
                          )
                        }
                        // onSelectedItemsChange={(selectedItems) => {
                        //   setFieldValue("_users_id_assign", selectedItems);
                        // }}
                        // selectedItems={values._users_id_assign}
                      />
                      {name === "Technician" && (
                        <TouchableOpacity
                          onPress={() => {
                            console.log(user_id);
                            setAssignDefault((prevItems) => {
                              const userKey = `user-${user_id}`;
                              if (!prevItems.includes(userKey)) {
                                return [...prevItems, userKey];
                              }
                              return prevItems;
                            });
                          }}
                          className="absolute bottom-4 right-[9px]"
                        >
                          <FontAwesome name="user-plus" size={20} color="red" />
                          {/* <Text style={styles.assignButtonText}>Kendini Ata</Text> */}
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                }
              />
              <AccordionItem
                title="Dökümanlar"
                isOpen={openIndex === 2}
                onPress={() => handlePress(2)}
                content={
                  <View style={styles.content}>
                    {document.length === 0 ? (
                      <Text className="text-red-500">
                        Eklenen Döküman bulunamadı...
                      </Text>
                    ) : (
                      <ScrollView
                        horizontal
                        className="flex flex-row gap-4 py-4"
                      >
                        {document?.map((item, index) => (
                          <View key={index}>
                            <TouchableOpacity
                              onPress={() => {
                                const url = `${baseUrl.baseUrl}/Document/${item}?alt=media&app_token=OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ&session_token=${baseUrl.token}`;
                                openModal(url);
                              }}
                            >
                              <Image
                                source={{
                                  uri: `${baseUrl.baseUrl}/Document/${item}?alt=media&app_token=OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ&session_token=${baseUrl.token}`,
                                }}
                                style={{
                                  width: 150,
                                  height: 150,
                                  borderWidth: 1,
                                  borderColor: "red",
                                }}
                                className="border border-red-500 rounded-4"
                              />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => {
                                const url = `${baseUrl.baseUrl}/Document/${item}?alt=media&app_token=OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ&session_token=${baseUrl.token}`;
                                //     openModal(url);
                                handleOpenUrl(url);
                              }}
                            >
                              <Text className="text-title-small font-semibold underline text-red-500">
                                {item}.jpg
                              </Text>
                            </TouchableOpacity>
                          </View>
                        ))}
                      </ScrollView>
                    )}
                    <Modal
                      visible={isModalVisible}
                      transparent={true}
                      onRequestClose={closeModal}
                    >
                      <View style={styles.modalBackground}>
                        <View style={styles.modalContainer}>
                          <Image
                            source={{ uri: selectedImage }}
                            style={{ width: "100%", height: "100%" }}
                            resizeMode="contain"
                          />
                          <TouchableOpacity
                            onPress={closeModal}
                            style={styles.closeButton}
                          >
                            <Text style={styles.closeButtonText}>Close</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Modal>
                  </View>
                }
              />

              <View className=" my-4 px-4 bg-white w-full flex justify-center items-center ">
                <TouchableOpacity
                  className=" w-[95%] h-12 bg-red-500 py-2 rounded-[4px] my-1 flex justify-center items-center"
                  onPress={handleSubmit}
                  title="Güncelle"
                >
                  <Text className=" text-center text-white font-semibold text-title-small">
                    Güncelle
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className=" w-[95%] h-12 bg-red-500 py-2 rounded-[4px] my-1 flex justify-center items-center"
                  onPress={handleDelete}
                  title="sil"
                >
                  <Text className=" text-center text-white font-semibold text-title-small">
                    Sil
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Formik>
        {/* {isModalImage && (
          <AddDocument
            isModalVisible={isModalImage}
            setModalVisible={setModalImage}
            ticketId={imageFollow}
            followItems={true}
          />
        )} */}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 4,
  },
  image: {
    width: 100, // Adjust width as needed
    height: 100, // Adjust height as needed
    margin: 5, // Adjust margin as needed
  },
  content: {
    padding: 10,
    backgroundColor: "#fff",
  },
  input: {
    height: 40,
    borderColor: "red",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  dropdown: {
    height: 50,
    borderColor: "red",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  placeholderStyle: {
    fontSize: 16,
    color: "gray",
  },
  selectedTextStyle: {
    fontSize: 16,
    color: "black",
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  selectToggle: {
    padding: 12,
    borderColor: "red",
    borderWidth: 0.5,
    borderRadius: 8,
    width: "100%",
    marginTop: 12,
    color: "red",
  },
  selectToggleText: {
    fontSize: 16,
    color: "red",
  },
  chipContainer: {
    borderRadius: 4,
    backgroundColor: "red",
    borderColor: "red",
    borderWidth: 0.5,
  },
  chipText: {
    fontSize: 14,
    color: "#ddd",
  },
  itemText: {
    fontSize: 16,
    color: "red",
  },
  subItemText: {
    fontSize: 14,
    color: "#666",
  },
  selectedItemText: {
    fontSize: 16,
    color: "#00f",
  },
  selectedSubItemText: {
    fontSize: 14,
    color: "#00f",
  },
  confirmText: {
    fontSize: 18,
    color: "#00f",
  },
  searchBar: {
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    padding: 8,
    marginTop: 8,
  },
  button: {
    backgroundColor: "red",
    marginHorizontal: 12,
    padding: 10,
    borderRadius: 4,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "#ddddd",
    fontSize: 16,
  },
  multiIcon: {
    color: "red",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    height: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 10,
    backgroundColor: "red",
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
  },
});

export default Accordion;
