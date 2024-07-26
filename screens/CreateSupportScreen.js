import {
  View,
  Text,
  StyleSheet,
  Button,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Dropdown } from "react-native-element-dropdown";
import { Formik } from "formik";
import SectionedMultiSelect from "react-native-sectioned-multi-select";
import { MaterialIcons as Icon } from "@expo/vector-icons";

import useTicketCalls from "../hooks/useTicketCalls";
import {
  selectCurrentUser,
  selectCurrentUser_id,
} from "../toolkit/services/AuthSlice";
import { useSelector } from "react-redux";

import Accordion from "../components/accordion/Accordion";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AddDocument from "../components/AddDocument";

export default function CreateSupportScreen({ route, navigation }) {
  //console.log(route.params?.itemId, "params");
  const [category, setCategory] = useState([]);
  const [newTicket, setNewTicket] = useState(false);
  const [ticket, setTicket] = useState(false);
  const [viewer, setViewer] = useState([]);
  const [location, setLocation] = useState([]);
  const [myDevices, setMyDevices] = useState([]);
  const [allGroup, setAllGroup] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedInfo, setSelectedInfo] = useState([]);

  const [addPreferDocument, setAddPreferDocument] = useState(false);
  const [loading, setLoading] = useState(false);
  const user_id = useSelector(selectCurrentUser_id);
  const user = useSelector(selectCurrentUser);

  const [isModalVisible, setModalVisible] = useState(false);

  const {
    createTickets,

    addDocument,
  } = useTicketCalls();

  const loadMoreItems = async () => {
    console.log("You have reached the end of the list");
  };

  const type = [
    { label: "Arıza", value: "1" },
    { label: "İstek", value: "2" },
  ];

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const usersString = await AsyncStorage.getItem("User");
        const locationString = await AsyncStorage.getItem("Location");
        const ITILCategoryString = await AsyncStorage.getItem("ITILCategory");
        const groupString = await AsyncStorage.getItem("Group");
        //console.log("object group", group);
        const myDevice = await AsyncStorage.getItem("myDevices");
        if (myDevice !== null) {
          const parsedDevices = JSON.parse(myDevice);
          setMyDevices(parsedDevices);
        }

        //console.log("myDevices", myDevice, "myDevices");
        const locationAll = locationString ? JSON.parse(locationString) : [];
        const user = usersString ? JSON.parse(usersString) : [];
        const group = groupString ? JSON.parse(groupString) : [];
        const ITILCategoryAll = ITILCategoryString
          ? JSON.parse(ITILCategoryString)
          : [];

        setCategory(
          ITILCategoryAll.map((item) => ({
            label: item.completename,
            value: item.id.toString(),
          }))
        );
        setViewer(user);
        setAllGroup(group);

        setLocation(
          locationAll.map((item) => ({
            label: item.completename,
            value: item.id.toString(),
          }))
        );
      } catch (error) {
        console.log(error);
      }
    };
    setNewTicket(route.params?.itemId);
    fetchTickets();
  }, []);
  const handleSubmit = async (values) => {
    //console.log(values,"values")
    const usersIds = selectedInfo
      .filter((info) => info.parentName === "User List")
      .map((info) => +info.id.split("-")[1]);

    const groupsIds = selectedInfo
      .filter((info) => info.parentName === "Group List")
      .map((info) => +info.id.split("-")[1]);

    // console.log(user_id,groupsIds,usersIds);
    // console.log({
    //   ...values,
    //   users_id_recipient: user_id,
    //   _users_id_requester: user_id,
    //   _groups_id_assign: [],
    //   _groups_id_observer: groupsIds,
    //   _users_id_observer: usersIds,
    // });
    try {
      const data = await createTickets({
        input: {
          ...values,
          users_id_recipient: user_id,
          _users_id_requester: user_id,
          _groups_id_assign: [],
          _users_id_assign: [],
          _groups_id_requester: [],
          _groups_id_observer: groupsIds,
          _users_id_observer: usersIds,
        },
      });
      if (data.id) {
        setModalVisible(true);
        console.log(data.id);
        setAddPreferDocument(true);
        setTicket(data.id);
        //navigation.navigate("Home")
      }
      console.log("bu ne ", data.message.includes("Item successfully added:"));
    } catch (error) {
      console.error("Error creating ticket:", error);
    }
  };
  const allUser = [
    {
      id: "user-list",
      name: "User List",
      children: viewer.map((item) => ({
        ...item,
        id: `user-${item.id}`, // `user-` ön eki ekleyerek benzersiz yapıyoruz
      })),
    },
  ];

  const group = [
    {
      id: "group-list",
      name: "Group List",
      children: allGroup.map((item) => ({
        ...item,
        id: `group-${item.id}`, // `group-` ön eki ekleyerek benzersiz yapıyoruz
      })),
    },
  ];

  const combinedItems = [...allUser, ...group];

  const onSelectedItemsChange = (selectedItems) => {
    setSelectedItems(selectedItems);
    const selectedInfo = selectedItems.map((selectedItemId) => {
      let parentName = "";
      let itemName = "";
      combinedItems.forEach((parent) => {
        const child = parent.children.find(
          (child) => child.id === selectedItemId
        );
        if (child) {
          parentName = parent.name;
          itemName = child.name; // Seçilen çocuğun adını al
        }
      });
      return { id: selectedItemId,name:itemName, parentName }; // ID yerine itemName döndür
    });
    setSelectedInfo(selectedInfo);
  };
  return (
    <View className="flex-1">
      {newTicket ? (
        <Accordion id={route.params?.itemId} />
      ) : (
        <Formik
          initialValues={{
            type: "",
            itilcategories_id: "",
            locations_id: "",
            devices_id: "",
            
            //urgency: "",
            viewer: [],

            name: "",
            content: "",
            document: null,
          }}
          //validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            setFieldValue,
            errors,
            touched,
          }) => (
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{ flex: 1 }}
            >
              <ScrollView className="flex-1  w-full">
                <View className=" pt-3 items-center mx-[8px]">
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
                    placeholder="Tür"
                    value={values.type}
                    onChange={(item) => setFieldValue("type", item.value)}
                  />
                  {errors.type && touched.type && (
                    <Text style={styles.errorText}>{errors.type}</Text>
                  )}

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
                    searchPlaceholder="Search..."
                    value={values.itilcategories_id}
                    onChange={(item) =>
                      setFieldValue("itilcategories_id", item.value)
                    }
                  />
                  {errors.category && touched.category && (
                    <Text style={styles.errorText}>{errors.category}</Text>
                  )}

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
                    search
                    searchPlaceholder="Konum..."
                    placeholder="Konum"
                    value={values.locations_id}
                    onChange={(item) =>
                      setFieldValue("locations_id", item.value)
                    }
                  />
                  {errors.locations_id && touched.locations_id && (
                    <Text style={styles.errorText}>{errors.locations_id}</Text>
                  )}
                  <Dropdown
                    style={styles.dropdown}
                    className="mt-3 w-full"
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    inputSearchStyle={styles.inputSearchStyle}
                    iconStyle={styles.iconStyle}
                    data={myDevices}
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    search
                    searchPlaceholder="Cihazlar..."
                    placeholder="Cihazlar"
                    value={values.devices_id}
                    onChange={(item) => setFieldValue("devices_id", item.value)}
                  />
                  {errors.devices_id && touched.devices_id && (
                    <Text style={styles.errorText}>{errors.devices_id}</Text>
                  )}

                  {/* <SectionedMultiSelect
                    items={viewer}
                    IconRenderer={Icon}
                    uniqueKey="id"
                    subKey="children"
                    selectText="İzleyiciler..."
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
                      setFieldValue("_users_id_observer", selectedItems);
                    }}
                    selectedItems={values._users_id_observer}
                    onEndReached={loadMoreItems}
                    onEndReachedThreshold={0.1}
                    ListFooterComponent={
                      loading && (
                        <ActivityIndicator size="large" color="#0000ff" />
                      )
                    }
                  /> */}
                  <SectionedMultiSelect
                    items={combinedItems}
                    IconRenderer={Icon}
                    uniqueKey="id"
                    subKey="children"
                    selectText="Select items..."
                    showDropDowns={true}
                    readOnlyHeadings={true}
                    showChips={false}
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
                    onSelectedItemsChange={(selectedItems)=>onSelectedItemsChange(selectedItems)}
                    selectedItems={selectedItems}
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
                        {selectedInfo.map((info) => (
                          <View
                            key={info.id}
                            className="w-30   my-1 mr-2 bg-paradise rounded-md"
                          >
                            <Text className="px-2 py-1 text-whitekozy font-medium ">{`${info.name}`}</Text>
                          </View>
                        ))}
                      </View>
                    </>
                  )}

                  {errors.selectedItems && touched.selectedItems && (
                    <Text style={styles.errorText}>{errors.selectedItems}</Text>
                  )}
                  <View className="w-full my-4 relative">
                    <TextInput
                      placeholder="Başlık"
                      className={`w-full h-12 border-[1px] border-red-500 p-2 rounded-[8px]  placeholder:text-red-500 placeholder:text-title-medium ${
                        errors.name && touched.name
                          ? "border-paradise "
                          : "border-[1px] border-paradise"
                      }`}
                      onChangeText={handleChange("name")}
                      onBlur={handleBlur("name")}
                      value={values.name}
                    />
                    {errors.name && touched.name && (
                      <Text className="text-paradise text-body-small mt-1 ">
                        {errors.name}
                      </Text>
                    )}
                  </View>
                  <View className="w-full mb-4 relative">
                    <TextInput
                      placeholder="İçerik"
                      multiline
                      resize={true}
                      numberOfLines={8} // İstenilen satır sayısını burada belirtebilirsiniz
                      className={`w-full h-48 border-[1px] border-red-500 p-2 rounded-[8px] placeholder:text-red-500 placeholder:text-title-medium ${
                        errors.content && touched.content
                          ? "border-paradise "
                          : "border-[1px] border-paradise"
                      }`}
                      onChangeText={handleChange("content")}
                      onBlur={handleBlur("content")}
                      value={values.content}
                    />
                    {errors.content && touched.content && (
                      <Text className="text-paradise text-body-small mt-1">
                        {errors.content}
                      </Text>
                    )}
                  </View>
                  {/* <View style={{ marginVertical: 10 }}>
                      <Button
                        title="Select Document"
                        onPress={() => selectDoc(setFieldValue)}
                      />
                      {values.document && <Text>{values.document.name}</Text>}
                    </View> */}
                  <TouchableOpacity
                    onPress={handleSubmit}
                    className="h-12 text-white rounded-[4px] justify-center items-center bg-red-500 w-full"
                  >
                    <Text className="text-center font-medium text-title-medium  text-whitekozy">
                      Gönder
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          )}
        </Formik>
      )}
      {isModalVisible && (
        <AddDocument
          isModalVisible={isModalVisible}
          setModalVisible={setModalVisible}
          ticketId={ticket}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 16,
  },
  dropdown: {
    height: 50,
    borderColor: "red",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    color: "red",
  },
  placeholderStyle: {
    fontSize: 18,
    color: "red",
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
    marginRight: 4,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  selectedValue: {
    marginTop: 40,
    fontSize: 18,
    textAlign: "center",
  },
  errorText: {
    fontSize: 12,
    color: "red",
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
});
