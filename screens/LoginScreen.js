import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { styled } from "nativewind";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";

import useAuthCalls from "../hooks/useAuthCalls";
import { useDispatch, useSelector } from "react-redux";
import { selectAllBaseUrl } from "../toolkit/services/AuthSlice";
import { tempBaseUrl } from "../util/baseUrl";
const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email")
    .required("Email girişi zorunludur"),
  password: Yup.string()
    .min(4, "Kısa Parola!")
    .max(20, "Uzun Parola!")
    .required("Parola zorunludur"),
});

const LoginForm = ({
  handleSubmit,
  handleChange,
  handleBlur,
  values,
  errors,
  touched,
  handleUrlChange,
}) => (
  <KeyboardAvoidingView
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    style={{ flex: 1 }}
  >
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View className="flex-1 justify-center items-center bg-white p-4">
        <View className="text-3xl font-bold mb-4 w-full">
          <Image
            source={require("../assets/images/astor.png")}
            className="w-full h-20"
          />
        </View>
        <View className="w-full mb-4 relative">
          <Text className="text-title-small text-default font-semibold mb-1">
            Email
          </Text>
          <TextInput
            className={`w-full h-12 border p-2 rounded-[8px] ${
              errors.email && touched.email
                ? "border-paradise "
                : "border-[1px] border-kozy/20   bg-greykozy/20"
            }`}
            onChangeText={handleChange("email")}
            onBlur={handleBlur("email")}
            value={values.email}
          />
          {errors.email && touched.email && (
            <Text className="text-paradise text-body-small mt-1 ">
              {errors.email}
            </Text>
          )}
          {errors.email && touched.email && (
            <View className="absolute top-10 right-2">
              <Icon name="warning" size={20} color="#F1416C" />
            </View>
          )}
        </View>
        <View className="w-full mb-4">
          <Text className="text-title-small text-default font-semibold mb-1">
            Password
          </Text>
          <TextInput
            className={`w-full h-12 border p-2 rounded-[8px] ${
              errors.password && touched.password
                ? "border-paradise "
                : "border-[1px] border-kozy/20   bg-greykozy/20"
            }`}
            onChangeText={handleChange("password")}
            onBlur={handleBlur("password")}
            value={values.password}
          />
          {errors.password && touched.password && (
            <Text className="text-paradise text-body-small mt-1 ">
              {errors.password}
            </Text>
          )}
          {errors.password && touched.password && (
            <View className="absolute top-10 right-2">
              <Icon name="warning" size={20} color="#F1416C" />
            </View>
          )}
        </View>
        <TouchableOpacity
          className="bg-blue-500 w-full p-3 rounded"
          onPress={handleSubmit}
        >
          <Text className="text-white text-center">Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex justify-end p-3 rounded"
          onPress={handleUrlChange}
        >
          <Text className="text-default font-medium text-title-small mt-3 underline text-end">
            Sunucu değiştir
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>
);

const SelectBaseUrlForm = ({ handleSubmit, values, setFieldValue }) => {
  const { getBaseUrl } = useAuthCalls();
  useEffect(() => {
    getBaseUrl();
  }, []);
  const allBaseUrl = useSelector(selectAllBaseUrl);
  //console.log(allBaseUrl,"allBaseUrl")

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View className="flex-1 justify-center items-center bg-white p-4">
        <View className="text-3xl font-bold mb-4 w-full">
          <Image
            source={require("../assets/images/astor.png")}
            className="w-full h-20"
          />
        </View>
        <View className="w-full">
          <Picker
            selectedValue={values.selectValue}
            onValueChange={(itemValue) => {
              setFieldValue("selectValue", itemValue);
            }}
          >
            {/* {allBaseUrl?.map((item, index) => (
              <Picker.Item label={item.name} value={item.url} key={index} />
            ))} */}
            {tempBaseUrl?.map((item, index) => (
              <Picker.Item label={item.name} value={item.url} key={index} />
            ))}
          </Picker>
        </View>
        <TouchableOpacity
          className="bg-blue-500 w-full p-3 rounded"
          onPress={handleSubmit}
        >
          <Text className="text-white text-center">Sunucu Seç</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
const LoginScreen = ({ navigation }) => {
  const [baseUrl, setBaseUrl] = useState("");
  const { login, loginUserData } = useAuthCalls();
  const dispatch = useDispatch()

  const handleUrlChange = async () => {
    await AsyncStorage.setItem("baseUrl", "");
    setBaseUrl("");
  };

  useEffect(() => {
    const fetchData = async () => {
      const storedBaseUrl = await AsyncStorage.getItem("baseUrl");
      setBaseUrl(storedBaseUrl);
    };

    fetchData();
  }, []);

  

  return (
    <>
      {baseUrl !== "" ? (
        <Formik
          initialValues={{ email: "", password: "" }}
          //validationSchema={validationSchema}
          onSubmit={async (values) => {
            const concatenatedString = `${values.email}:${values.password}`;
            const base64Encoded = btoa(concatenatedString);
            await login(base64Encoded,dispatch);
            await loginUserData("Z2xwaXN5bmM6QnVsdXQuNDQ3OA==")
          }}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <LoginForm
              handleChange={handleChange}
              handleBlur={handleBlur}
              handleSubmit={handleSubmit}
              values={values}
              errors={errors}
              touched={touched}
              handleUrlChange={handleUrlChange}
            />
          )}
        </Formik>
      ) : (
        <Formik
          initialValues={{ selectValue: "" }}
          onSubmit={async (values) => {
            await AsyncStorage.setItem(
              "baseUrl",
              JSON.stringify(values.selectValue)
            );
            console.log("we", values.selectValue);
            setBaseUrl(values.selectValue);
          }}
        >
          {({ handleSubmit, values, setFieldValue }) => (
            <SelectBaseUrlForm
              handleSubmit={handleSubmit}
              values={values}
              setFieldValue={setFieldValue}
            />
          )}
        </Formik>
      )}
    </>
  );
};

export default styled(LoginScreen);
