import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Button,
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

import AddDocument from "../AddDocument";

const Accordion = ({ id }) => {
  const navigation = useNavigation();
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
  const [followItems, setFollowItems] = useState([]);
  const [followDocs, setFollowDocs] = useState([]);
  const [baseUrl, setBaseUrl] = useState({ baseUrl: "", token: "" });
  const [isModalVisible, setModalVisible] = useState(false);
  const [isModalImage, setModalImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFollow, setImageFollow] = useState();
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedInfo, setSelectedInfo] = useState([]);
  const [observerDefault, setObserverDefault] = useState([]);

  const [initialValues, setInitialValues] = useState({
    type: "",
    itilcategories_id: "",
    locations_id: "",
    _users_id_requester: [],
    _users_id_assign: [],
    date_creation: new Date(),
    status: "",
    requesttypes_id: "",
    name: "",
    content: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const [loading, setLoading] = useState(true); // Loading state
  const user_id = useSelector(selectCurrentUser_id);
  const { name } = useSelector(selectProfile);

  const {
    getTicketById,
    getTicketInfo,
    updateTickets,
    getStoredData,
    addITILFollowup,
    deleteTicket,
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

  useEffect(() => {
    const fetchTickets = async () => {
      const { storedBaseUrl, token } = await getStoredData();
      try {
        //ticket
        const ticketById = await getTicketById(id);
        setTicket(ticketById);
        //category
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
        //requester

        const ticketUserLink = ticketById?.links.filter(
          (link) => link.rel == "Ticket_User"
        );
        const ticketGroupLink = ticketById?.links.filter(
          (link) => link.rel == "Group_Ticket"
        );
        const data = await getTicketInfo(ticketUserLink[0].href);
        const formattedUserData = data.map((item) => `user-${item.users_id}`);

        const dataGroup = await getTicketInfo(ticketGroupLink[0].href);
        const formattedGroupData = dataGroup.map(
          (item) => `group-${item.groups_id}`
        );

        setObserverDefault((prev) => {
          const newItems = [
            ...prev,
            ...formattedUserData,
            ...formattedGroupData,
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
        //console.log("document documnet", documentData);
        const filteredIdDocumnet = documentData.map(
          (item) => item.documents_id
        );
        console.log(filteredIdDocumnet);
        setDocument(filteredIdDocumnet);

        //followUp
        const followLink = ticketById?.links.filter(
          (link) => link.rel === "ITILFollowup"
        );

        // Fetch follow-up data from the link
        const followUp = await getTicketInfo(followLink[0].href);

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

        setBaseUrl({ baseUrl: storedBaseUrl, token: token });

        setLoading(false); // Data fetched, set loading to false
      } catch (error) {
        console.log("eroor", error);
        setLoading(false); // Even on error, set loading to false
      }
    };

    fetchTickets();
  }, []);
  useEffect(() => {
    console.log(" ticket tickert", selectAssing);
    if (ticket) {
      setInitialValues({
        type: String(ticket.type),
        itilcategories_id: ticket.itilcategories_id.toString(),
        locations_id: ticket.locations_id.toString(),
        _users_id_requester: selectViewer,

        _users_id_assign: selectAssing,
        date_creation: ticket.date_creation,
        status: ticket.status.toString(),
        requesttypes_id: ticket?.requesttypes_id.toString(),
        name: ticket.name,
        content: stripHtmlTags(decode(ticket.content)),
      });
    }
  }, [selectViewer, ticket, selectAssing, selectRequester]);

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
    console.log(
      "object",
      ticket.status,
      typeof ticket.status,
      ticket.id,
      name,
      typeof name
    );

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

  const handleSendClick = async () => {
    console.log("ali", ticket.id, user_id);
    const res = await addITILFollowup({
      input: {
        itemtype: "Ticket",
        items_id: ticket.id,
        users_id_editor: user_id,
        content: inputValue,
        requesttypes_id: user_id,
      },
    });
    setIsAdding(false);
    setInputValue("");
    setImageFollow(res?.id);

    const followLink = ticket?.links.filter(
      (link) => link.rel == "ITILFollowup"
    );
    const followUp = await getTicketInfo(followLink[0].href);

    // Fetch responses for each follow-up item
    const followUpResponses = await Promise.all(
      followUp.map((item) =>
        getTicketInfo(
          `http://212.253.8.154:23737/apirest.php/ITILFollowup/${item.id}/Document_Item/`
        )
      )
    );
    console.log("follow", res.id, "follow");
    setModalImage(true);

    const combinedFollowItems = followUp.map((item, index) => ({
      ...item,
      followdoc: followUpResponses[index] || [],
    }));

    // Set the combined follow items in state
    setFollowItems(combinedFollowItems);
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
  console.log(observerDefault);

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
          onSubmit={(values) => {
            const usersIds = selectedInfo
              .filter((info) => info.parentName === "User List")
              .map((info) => +info.id);

            const groupsIds = selectedInfo
              .filter((info) => info.parentName === "Group List")
              .map((info) => parseInt(info.id));
            const input = {
              id: ticket?.id,
              users_id_recipient: user_id,
              ...values,
              _groups_id_assign: [],
              _groups_id_requester: [],
              _groups_id_observer: groupsIds,
              _users_id_observer: usersIds,
            };
            console.log("input", { input });
            updateTickets({ input });
            navigation.navigate("Home");
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
                    <DatePicker
                      defaultDate={ticket?.date_creation}
                      label="Seçilen Tarih"
                      func={(date) => setFieldValue("date_creation", date)}
                    />
                    <Dropdown
                      style={styles.dropdown}
                      className="mt-3 w-full"
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
                    <Dropdown
                      style={styles.dropdown}
                      className="mt-3 w-full"
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
                      disable={name == "Self-Service" ? true : false}
                      searchPlaceholder="Search..."
                      value={values.itilcategories_id}
                      onChange={(item) => {
                        setFieldValue("itilcategories_id", item.value);
                      }}
                    />
                    <Dropdown
                      style={styles.dropdown}
                      className="mt-3 w-full"
                      placeholderStyle={styles.placeholderStyle}
                      selectedTextStyle={styles.selectedTextStyle}
                      inputSearchStyle={styles.inputSearchStyle}
                      iconStyle={styles.iconStyle}
                      data={status}
                      maxHeight={300}
                      labelField="label"
                      valueField="value"
                      placeholder="Status"
                      disable={name == "Self-Service" ? true : false}
                      search
                      searchPlaceholder="Search..."
                      value={values.status}
                      onChange={(item) => {
                        console.log(item), setFieldValue("status", item.value);
                      }}
                    />
                    <Dropdown
                      style={styles.dropdown}
                      className="mt-3 w-full"
                      placeholderStyle={styles.placeholderStyle}
                      selectedTextStyle={styles.selectedTextStyle}
                      inputSearchStyle={styles.inputSearchStyle}
                      iconStyle={styles.iconStyle}
                      data={request_source}
                      maxHeight={300}
                      labelField="label"
                      valueField="value"
                      placeholder="Request Source"
                      search
                      disable={name == "Self-Service" ? true : false}
                      searchPlaceholder="Search..."
                      value={values.requesttypes_id}
                      onChange={(item) => {
                        setFieldValue("requesttypes_id", item.value);
                      }}
                    />
                    <Dropdown
                      style={styles.dropdown}
                      className="mt-3 w-full"
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
                    <TextInput
                      placeholder="Başlık"
                      multiline={true}
                      className={`w-full border-[1px] mt-2 border-red-500 p-2 rounded-[8px]  placeholder:text-default placeholder:text-title-medium ${
                        errors.name && touched.name
                          ? "border-paradise "
                          : "border-[1px] border-paradise"
                      }`}
                      onChangeText={handleChange("name")}
                      onBlur={handleBlur("name")}
                      value={values.name}
                      editable={name !== "Self-Service"}
                    />
                    <TextInput
                      placeholder="Başlık"
                      multiline={true}
                      className={`w-full  border-[1px] mt-2 border-red-500 p-2 rounded-[8px]  placeholder:text-text-default placeholder:text-title-medium ${
                        errors.content && touched.content
                          ? "border-paradise "
                          : "border-[1px] border-paradise"
                      }`}
                      onChangeText={handleChange("content")}
                      onBlur={handleBlur("content")}
                      value={values.content}
                      editable={name !== "Self-Service"}
                    />
                    <View style={styles.content} className="flex  gap-4 mt-4">
                      {followItems.length === 0 ? (
                        <Text className="text-red-500">Document not found</Text>
                      ) : (
                        followItems.map((item, index) => (
                          <View
                            key={item.id}
                            className={` ${
                              index % 2 == 0 ? "bg-red-500" : "bg-red-200"
                            } flex gap-1 p-2 rounded-md w-[80%]`}
                          >
                            <Text className="text-title-small text-default font-semibold ">
                              {stripHtmlTags(decode(item.content))}
                            </Text>

                            <View>
                              {item.followdoc && Array.isArray(item.followdoc)
                                ? item.followdoc.map((followItems, index) => {
                                    // followItems bir obje ve documents_id içeriyor
                                    //console.log("followItems", followItems); // followItems'ı kontrol et
                                    return (
                                      <TouchableOpacity
                                        key={index}
                                        onPress={() => {
                                          const url = `${baseUrl.baseUrl}/Document/${followItems.documents_id}?alt=media&app_token=OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ&session_token=${baseUrl.token}`;
                                          console.log(url, "url"); //     openModal(url);
                                          handleOpenUrl(url);
                                        }}
                                      >
                                        <Text>
                                          {followItems.documents_id}.image
                                        </Text>
                                        <Image
                                          source={{
                                            uri: `${baseUrl.baseUrl}/Document/${followItems.documents_id}?alt=media&app_token=OB1OAh01C4YoqZw4gCcK6Un6zum3HssFZQ5G0AoJ&session_token=${baseUrl.token}`,
                                          }}
                                          style={{
                                            width: 150,
                                            height: 150,
                                            borderWidth: 1,
                                            borderColor: "white",
                                          }}
                                          resizeMode="cover" // resmin doğru şekilde sığmasını sağlar
                                        />
                                      </TouchableOpacity>
                                    );
                                  })
                                : null}
                            </View>

                            <Text className="text-slate-600 font-medium">
                              Created on: {item.date_creation}
                            </Text>
                            <Text className="text-slate-600 font-medium">
                              created by{" "}
                              {getRequestTypeLabel(item.requesttypes_id)}
                            </Text>
                          </View>
                        ))
                      )}
                      {isAdding && (
                        <View className="flex justify-center item-center">
                          <TextInput
                            className="mt-4  border border-red-500 py-4 rounded-[4px] px-2 text-title-small"
                            placeholder="Yeni içerik"
                            value={inputValue}
                            multiline
                            onChangeText={setInputValue}
                          />
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
                      {!isAdding && (
                        <TouchableOpacity
                          className="mt-4 w-[95%] bg-red-500 py-2 rounded-[4px]"
                          onPress={handleAddClick}
                        >
                          <Text className=" text-center text-default font-semibold text-title-small">
                            Ekle
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
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
                      items={viewer}
                      IconRenderer={Icon}
                      uniqueKey="id"
                      subKey="children"
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
                        setFieldValue("_users_id_requester", selectedItems);
                      }}
                      selectedItems={values._users_id_requester}
                    />

                    <SectionedMultiSelect
                      items={combinedItems}
                      IconRenderer={Icon}
                      uniqueKey="id"
                      subKey="children"
                      selectText="İzleyiciler..."
                      showDropDowns={true}
                      readOnlyHeadings={true}
                      showChips={false}
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
                      onSelectedItemsChange={(selectedItems) =>
                        setObserverDefault([...selectedItems])
                      }
                      onEndReached={loadMoreItems}
                      onEndReachedThreshold={0.1}
                      ListFooterComponent={
                        loading && (
                          <ActivityIndicator size="large" color="#0000ff" />
                        )
                      }
                    />
                    {selectedInfo.length > 0 && (
                      <>
                        <View className=" w-full flex flex-row justify-start items-center mt-2 flex-wrap ">
                          {selectedInfo.map((info,index) => (
                            <View
                              key={index}
                              className="w-30   my-1 mr-2 bg-paradise rounded-md"
                            >
                              <Text className="px-2 py-1 text-whitekozy font-medium ">{`${info.name}`}</Text>
                            </View>
                          ))}
                        </View>
                      </>
                    )}
                    <View className="relative ">
                      <SectionedMultiSelect
                        items={viewer.filter((item) => item.id == user_id)}
                        IconRenderer={Icon}
                        uniqueKey="id"
                        subKey="children"
                        disabled
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
                          setFieldValue("_users_id_assign", selectedItems);
                        }}
                        selectedItems={values._users_id_assign}
                      />
                      {name === "Technician" && (
                        <TouchableOpacity
                          onPress={() => setFieldValue("_users_id_assign", [25])}
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
                      <Text className="text-red-500">Document not found</Text>
                    ) : (
                      <View className="flex flex-row gap-4">
                        {document?.map((item, index) => (
                          <View key={item.id}>
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
                      </View>
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
        {isModalImage && (
          <AddDocument
            isModalVisible={isModalImage}
            setModalVisible={setModalImage}
            ticketId={imageFollow}
            followItems={true}
          />
        )}
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
