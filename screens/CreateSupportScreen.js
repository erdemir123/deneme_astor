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
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Dropdown } from "react-native-element-dropdown";
import { Formik, useFormik } from "formik";
import SectionedMultiSelect from "react-native-sectioned-multi-select";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import useTicketCalls from "../hooks/useTicketCalls";
import {
  selectCurrentUser,
  selectCurrentUser_id,
} from "../toolkit/services/AuthSlice";
import { useSelector } from "react-redux";

import Accordion from "../components/accordion/Accordion";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AddDocument from "../components/AddDocument";
import { Image } from "react-native";

export default function CreateSupportScreen({ route, navigation }) {
  const [category, setCategory] = useState([]);
  const [newTicket, setNewTicket] = useState(false);
  const [ticket, setTicket] = useState(false);
  const [viewer, setViewer] = useState([]);
  const [location, setLocation] = useState([]);
  const [myDevices, setMyDevices] = useState([]);
  const [allGroup, setAllGroup] = useState([]);
  const [myDevicesDefault, setMyDevicesDefault] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedInfo, setSelectedInfo] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [formValues, setFormValues] = useState({
    type: "",
    itilcategories_id: "",
    locations_id: "",
    devices_id: "",
    file: "",
    viewer: [],
    name: "",
    content: "",
    document: null,
  });

  // useEffect(() => {
  //   if (route.params?.data) {
  //     const jsonString = route.params.data;
  //     console.log(jsonString,"screens/SupportScreen.js")

  //     const parsedData = JSON.parse(jsonString);
  //     console.log(parsedData.seri_no,parsedData.konum,parsedData.kategori, "sar");
  //     console.log(myDevices)
  //     const devices_ids = myDevices?.find(
  //       (item) => item.serial == parsedData.seri_no.toString()
  //     );
  //     console.log(devices_ids)
  //     if (devices_ids) {
  //       const deviceValue = devices_ids.value.toString();
  //       console.log(deviceValue, "ids");
  //     } else {
  //       console.log("Device not found.");
  //     }

  //     // Veriyi formValues ile güncelle
  //     setFormValues((prevValues) => ({
  //       ...prevValues,
  //       locations_id: parsedData?.konum.toString() || "",
  //       devices_id: devices_ids?.value.toString() || "",
  //       itilcategories_id: parsedData?.kategori.toString() || "",
  //       name:`${devices_ids?.label} ${devices_ids?.serial}da  problem var`
  //     }));
  //   }
  // }, [myDevices]);

  const [loading, setLoading] = useState(false);
  const user_id = useSelector(selectCurrentUser_id);
  const user = useSelector(selectCurrentUser);

  const [isModalVisible, setModalVisible] = useState(false);

  const { createTickets, uploadDocument, addPluginTicket } = useTicketCalls();

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
          const modifiedData = parsedDevices.map((item) => {
            //const newLabel = item.label.split(" - ")[0]; // "-" karakterine göre böl ve ilk kısmı al
            return { ...item, name: item.label }; // Yeni label ile nesneyi dön
          });
          setMyDevices(modifiedData);
        }

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
  // const handleSubmit = async (values) => {
  //   validateValues(values);
  //   setLoading(true);

  //   const usersIds = selectedInfo
  //     .filter((info) => info.parentName === "User List")
  //     .map((info) => +info.id.split("-")[1]);

  //   const groupsIds = selectedInfo
  //     .filter((info) => info.parentName === "Group List")
  //     .map((info) => +info.id.split("-")[1]);

  //   try {
  //     const { file, ...otherValues } = values;

  //     const data = await createTickets({
  //       input: {
  //         ...otherValues,
  //         users_id_recipient: user_id,
  //         _users_id_requester: user_id,
  //         _groups_id_assign: [],
  //         _users_id_assign: [],
  //         _groups_id_requester: [],
  //         _groups_id_observer: groupsIds,
  //         _users_id_observer: usersIds,
  //       },
  //     });
  //     console.log("object ticket", data);
  //     console.log(selectedFiles)
  //     if (data?.id && selectedFiles[0]) {
  //      // console.log(" buraua girdi", data.id, selectedFiles);
  //       // const documentRes = await uploadDocument(
  //       //   selectedFiles[0][0],
  //       //   data?.id,
  //       //   user_id,
  //       //   "Ticket"
  //       // );
  //       const uploadPromises = selectedFiles[0]?.map((fileUri) =>
  //         uploadDocument(fileUri, data.id, user_id, "Ticket")

  //         );
  //       const documentRes = await Promise.all(uploadPromises);

  //     }

  //   } catch (error) {
  //     console.error("Error creating ticket:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleSubmit = async (values) => {
    // Eksik alanlar olup olmadığını kontrol et
    console.log(values, "values");
    const errors = validateValues(values);

    // Eğer eksik alanlar varsa, işlemi durdur
    if (errors.length > 0) {
      alert(`Şu alanlar boş olamaz: ${errors.join(", ")}`);
      return; // Burada fonksiyonun devamını durdurur
    }

    setLoading(true);

    const usersIds = selectedInfo
      .filter((info) => info.parentName === "User List")
      .map((info) => +info.id.split("-")[1]);

    const groupsIds = selectedInfo
      .filter((info) => info.parentName === "Group List")
      .map((info) => +info.id.split("-")[1]);

    try {
      const { file, ...otherValues } = values;

      const data = await createTickets({
        input: {
          ...otherValues,
          users_id_recipient: user_id,
          _users_id_requester: user_id,
          _groups_id_assign: [],
          _users_id_assign: [],
          _groups_id_requester: [],
          _groups_id_observer: groupsIds,
          _users_id_observer: usersIds,
        },
      });
      if (data?.id) {
        const machine = {
          input: myDevicesDefault.map((item) => ({
            itemtype: "PluginGenericobjectMakine",
            items_id: parseInt(item), // item değeri string olduğu için parseInt ile sayıya çeviriyoruz
            tickets_id: data.id,
          })),
        };
        console.log(machine, "machine");
        const addPluginTicketRes = await addPluginTicket(machine);
        console.log(addPluginTicketRes);
        console.log(addPluginTicketRes);
      }
      if (data?.id && selectedFiles[0]) {
        const uploadPromises = selectedFiles[0]?.map((fileUri) =>
          uploadDocument(fileUri, data.id, user_id, "Ticket")
        );
        const documentRes = await Promise.all(uploadPromises);
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
    } finally {
      setLoading(false);
      navigation.navigate("Home");
    }
  };

  // validateValues fonksiyonunu şu şekilde güncelleyin:
  const validateValues = (values) => {
    const errors = [];

    const fieldsToCheck = [
      { key: "content", label: "Açıklama" },
      { key: "type", label: "Tür" },
      { key: "name", label: "Başlık" },
      { key: "locations_id", label: "Konum" },
      { key: "itilcategories_id", label: "Kategori" },
    ];

    fieldsToCheck.forEach(({ key, label }) => {
      if (!values[key] || values[key].trim() === "") {
        errors.push(label);
      }
    });

    return errors;
  };

  const allUser = [
    {
      id: "user-list",
      name: "User List",
      children: viewer.map((item) => ({
        ...item,
        id: `user-${item.id}`,
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
      return { id: selectedItemId, name: itemName, parentName }; // ID yerine itemName döndür
    });
    setSelectedInfo(selectedInfo);
  };
  const handleImagePick = async (setFieldValue) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true, // Eğer bu özellik desteklenmiyorsa bir alternatif kullanmanız gerekebilir
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        console.log(result, "resulr");
        const uris = result.assets.map((asset) => asset.uri);
        setSelectedFiles([...selectedFiles, result.assets]);

        setSelectedImage(uris);
        setFieldValue("file", uris);
      }
    } catch (err) {
      console.error("Error picking images:", err);
    }
  };
  useEffect(() => {
    const scanner = async () => {
      if (route.params?.data) {
        setLoading(true);
        const myDevice = await AsyncStorage.getItem("myDevices");
        const parsedDevices = JSON.parse(myDevice);
        console.log("parsedDevices==>", parsedDevices);
    
        let parsedData;
        try {
          const jsonString = route.params.data;
          console.log("jsonString==>", jsonString);
          parsedData = JSON.parse(jsonString);
        } catch (error) {
          console.log("JSON parsing error:", error.message);
          alert("QR kodu veya barkod verisi geçerli bir JSON formatında değil.");
          navigation.navigate("Scanner");
          setLoading(false);
          return;
        }
    
        console.log("parsedData==>", parsedData);
        console.log(
          parsedDevices.map((item) => item.otherserial),
          "myDevices"
        );
    
        const devices_ids = parsedDevices?.filter(
          (item) => item.otherserial == parsedData.toString()
        );
        console.log(parsedData, devices_ids, "ds");
    
        if (devices_ids.length === 0) {
          alert("Bu seri numarasına sahip bir makine bulunamadı.");
          navigation.navigate("Scanner");
          setLoading(false);
          return;
        } else if (devices_ids?.length > 1) {
          alert(
            "Aynı seri numarasına sahip birden fazla makine bulundu. Lütfen seri numarasını tekrar kontrol edin."
          );
          navigation.navigate("Scanner");
          setLoading(false);
          return;
        }
    
        const newDeviceValue = devices_ids[0]?.value;
        console.log("newDeviceValue==>", newDeviceValue);
    
        if (!myDevicesDefault.includes(newDeviceValue)) {
          setMyDevicesDefault([newDeviceValue]);
        }
    
        setFormValues({
          type: "1",
          itilcategories_id: "17",
          locations_id: devices_ids[0]?.locations_id,
          devices_id: "",
          file: "",
          viewer: [],
          name: `${devices_ids[0]?.label}'da problem bulunmaktadır`,
          content: "",
          document: null,
        });
    
        setLoading(false);
      } else {
       
        setLoading(false);
      }
    };
    scanner();
    
  }, [myDevices]);

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
    <View className="flex-1">
      {newTicket ? (
        <Accordion id={route.params?.itemId} />
      ) : (
        <Formik
          initialValues={formValues} // formik initialValues'i kullan
          enableReinitialize={true} // formik enableReinitialize'i kullan
          // validationSchema={validationSchema}
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
                  <SectionedMultiSelect
                    items={myDevices} // myDevices, id ve label içermeli
                    IconRenderer={Icon}
                    uniqueKey="value" // Veya id, emin olun ki benzersiz
                    subKey="children"
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
                  {/* <Dropdown
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
                  onChange={(item) => {
                    setFieldValue("devices_id", item.value);
                    setSelectedDevice(item.label);
                  }}
                />
                {errors.devices_id && touched.devices_id && (
                  <Text style={styles.errorText}>{errors.devices_id}</Text>
                )} */}

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
                    selectText="Gözlemci Ekle..."
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
                    onSelectedItemsChange={(selectedItems) =>
                      onSelectedItemsChange(selectedItems)
                    }
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
                      multiline
                      placeholder="Başlık"
                      resize={true}
                      className={`w-full h-24 border-[1px] border-red-500 p-2 rounded-[8px]  placeholder:text-red-500 placeholder:text-title-medium ${
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
                      placeholder="Açıklama"
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
                  <View className="flex flex-row w-full mb-2 items-center justify-center ">
                    <TouchableOpacity
                      title=""
                      onPress={() => handleImagePick(setFieldValue)}
                      className=" bg-red-500 w-36 ml-2 justify-center items-center flex rounded-md my-2 h-12 "
                    >
                      <Text className="text-white  font-semibold  text-center">
                        Resim Yükle
                      </Text>
                    </TouchableOpacity>
                    {selectedImage && (
                      <View className="flex flex-row pl-2">
                        <View className="relative">
                          <Image
                            source={{ uri: selectedImage[0] }}
                            style={{ width: 48, height: 48 }}
                            className="rounded-md"
                          />
                          <Text className="absolute bg-red-500 px-2 py-1 -top-2 text-white font-semibold -right-1 ">
                            x{selectedImage.length}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => {
                            setFieldValue("file", null);
                            setSelectedImage(null);
                          }}
                          className="bg-red-500 w-36 ml-2 justify-center items-center flex rounded-md"
                        >
                          <Text className="text-white  font-semibold  text-center">
                            seçimi kaldır
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
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
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
