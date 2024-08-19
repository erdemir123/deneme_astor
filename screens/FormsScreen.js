import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import useFormCalls from "../hooks/useFormCalls";
import { useSelector } from "react-redux";
import {
  selectCurrentGroup,
  selectCurrentUser_id,
  selectProfile,
} from "../toolkit/services/AuthSlice";

const FormsScreen = ({ navigation }) => {
  const [myForms, setMyForms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const { getAllFormPermission, getAllForm, getAllFormCategory, getUserForm } =
    useFormCalls();
  const group = useSelector(selectCurrentGroup);
  const user_id = useSelector(selectCurrentUser_id);
  const profile = useSelector(selectProfile);
  function sanitizeDescription(description) {
    // HTML karakterlerini çözme
    const decodedString = description
      .replace(/&#60;/g, "<")
      .replace(/&#62;/g, ">");

    // HTML etiketlerini kaldırma
    const cleanedString = decodedString.replace(/<\/?[^>]+(>|$)/g, "");

    return cleanedString;
  }
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [user_forms, profile_forms, group_forms] =
          await getAllFormPermission();
        const dataAllForm = await getAllForm();
        const dataAllFormCategory = await getAllFormCategory();

        // Logları ekleyin
        // console.log("dataAllFormCategory:", dataAllFormCategory);

        const form_id_list = getUserForm(
          user_id,
          profile?.id,
          group,
          user_forms,
          profile_forms,
          group_forms
        );

        // console.log("form_id_list:", form_id_list);

        const my_forms = [];
        const my_form_category_id_set = new Set();

        dataAllForm.forEach((form) => {
          if (form_id_list.includes(form.id)) {
            my_forms.push(form);
            my_form_category_id_set.add(
              form.plugin_formcreator_categories_id.replace(/&#62;/g, ">")
            );
          }
        });

        // Kategori ID'lerini loglama
        // console.log(my_forms,"my_forms")
        // console.log(
        //   "my_form_category_id_set:",
        //   Array.from(my_form_category_id_set)
        // );
        // console.log("dataAllFormCategory", dataAllFormCategory);
        // Kategorileri filtreleme
        const filteredCategories = dataAllFormCategory.filter(
          (category, index) => {
            return my_form_category_id_set.has(category.completename);
          }
        );

        //console.log("filteredCategories:", filteredCategories);

        setMyForms(my_forms);
        setCategories(filteredCategories);
      } catch (error) {
        alert("Form Bulunamadı...");
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  // Kategori seçimini işleme
  const handleCategorySelect = (category) => {
    //console.log(category?.completename, "item");
    setSelectedCategory(category?.completename);
  };

  // HTML karakterlerini düzeltme
  const replaceHtmlEntities = (str) => {
    return str.replace(/&#62;/g, ">");
  };
  const gotoForm = (item) => {
    //console.log(item.id,"item=>>>>");
    navigation.navigate("Form", { itemId: item.id });
  };

  // Kategorileri organize etme
  const categorizeData = () => {
    const categoriesMap = {};

    myForms.forEach((form) => {
      const categoryName = replaceHtmlEntities(form.name);
      const categoryId = form.plugin_formcreator_categories_id;
      if (!categoriesMap[categoryId]) {
        categoriesMap[categoryId] = { name: categoryName, forms: [] };
      }
      categoriesMap[categoryId].forms.push(form);
    });
    return categoriesMap;
  };

  const categorizedForms = categorizeData();
  useEffect(() => {
    //console.log(myForms,"myforms",selectedCategory)
    const filteredForms = myForms.filter(
      (form) =>
        form.plugin_formcreator_categories_id.replace(/&#62;/g, ">") ===
        selectedCategory
    );
    setSubCategories(filteredForms);
    //console.log(filteredForms,"forms");
  }, [selectedCategory]);

  if (loading) {
    return (
      <ActivityIndicator
        size={"large"}
        color="red"
        animating={true}
        className="flex-1"
      />
    );
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>
        {selectedCategory === null ? "Kategoriler" : "Kategoriler > Formlar"}
      </Text>

      {selectedCategory === null ? (
        <>
          {categories && categories.length > 0 ? (
            <FlatList
              data={categories}
              className="mb-12"
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleCategorySelect(item)}
                  className="bg-gray-600/20 px-2 py-1 rounded-md mt-2"
                >
                  <Text className="font-semibold text-title-medium text-red-500">
                    {item.completename}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id.toString()}
            />
          ) : (
            <Text className="font-semibold text-title-medium text-gray-500">
             Atanmış Form Bulunamadı...
            </Text>
          )}
        </>
      ) : (
        <FlatList
          data={subCategories || []}
          className="mb-12"
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => gotoForm(item)}
              className="bg-gray-600/20 px-2 py-1 rounded-md mt-2 "
            >
              <Text className="font-semibold text-title-medium text-red-500 ">
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
      {selectedCategory !== null && (
        <TouchableOpacity
          onPress={() => setSelectedCategory(null)}
          style={{ marginTop: 20 }}
        >
          <Text style={{ fontSize: 18, color: "blue" }}>Kategori Seç</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default FormsScreen;
