import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import useFormCalls from "../hooks/useFormCalls";
import { RadioButton } from "react-native-paper";
import { Checkbox, List } from "react-native-paper";
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SectionedMultiSelect from "react-native-sectioned-multi-select";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";
import useAuthCalls from "../hooks/useAuthCalls";
import { FontAwesome5 } from "@expo/vector-icons";

import "moment/locale/tr";
moment.locale("tr");
// import MultiSelect from 'react-native-multiple-select';  bu kaldırılacak

const CheckboxesComponent = ({ question, onValueChange }) => {
  const [selectedValues, setSelectedValues] = useState([]);

  const handleCheckboxChange = (value) => {

    const newSelectedValues = selectedValues.includes(value)
      ? selectedValues?.filter((item) => item !== value)
      : [...selectedValues, value];

    setSelectedValues(newSelectedValues);
    onValueChange(question?.id, newSelectedValues); // Question ID ve seçilen değerleri gönder
  };

  // `question.values` JSON formatında bir dizi olmalı
  const checkboxOptions = question?.values ? JSON.parse(question.values) : [];

  return (
    <View className="w-full">
      <View
        style={[
          styles.dropdownContainer,
          { flexDirection: "row", alignItems: "center" },
        ]}
      >
        <Text className="text-default text-title-large font-semibold mr-4">
          {question?.name}{" "}
          {question.required === 1 && (
            <View className="flex h-4 justify-start ml-2">
              <FontAwesome5
                name="star-of-life"
                size={8}
                color="red"
                style={{ border: "1px solid red" }}
              />
            </View>
          )}
        </Text>
      </View>
      {checkboxOptions.map((option) => (
        <TouchableOpacity
          key={option}
          onPress={() => handleCheckboxChange(option)} // View'a tıklandığında handleCheckboxChange fonksiyonunu çağır
          className="flex-row items-center flex justify-start bg-gray-400 mb-2 py-1 rounded-lg"
        >
          <Checkbox
            status={selectedValues.includes(option) ? "checked" : "unchecked"}
            onPress={() => handleCheckboxChange(option)} // Checkbox'ı tıkladığınızda handleCheckboxChange fonksiyonunu çağır
            color="black" // Checkbox'ın renk değiştirmesini sağlar
          />
          <Text>{`${option}`}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
const Float = ({ question, onValueChange }) => {
  const [inputValue, setInputValue] = useState(question?.values || "");
  const handleChange = (text) => {
    setInputValue(text); // State güncelle
    onValueChange(question?.id, text); // Parent bileşene yeni değeri gönder
  };

  return (
    <View key={question.id} className="flex">
      <View
        style={[
          styles.dropdownContainer,
          { flexDirection: "row", alignItems: "center" },
        ]}
      >
        <Text className="text-default text-title-large font-semibold mr-2">
          {question?.name}
        </Text>
        {question.required === 1 && (
          <View className="flex h-4 justify-start ml-2">
            <FontAwesome5
              name="star-of-life"
              size={8}
              color="red"
              style={{ border: "1px solid red" }}
            />
          </View>
        )}
      </View>
      <TextInput
        value={inputValue}
        onChangeText={handleChange}
        keyboardType="number-pad"
        className="border border-gray-900 rounded-md h-12  px-2 py-2"
        placeholder=""
        multiline={false} // Tek satır
      />
    </View>
  );
};
const UrgencyDropdown = ({ question, onValueChange, selectedItems }) => {
  const status = [
    { label: "Çok düşük", value: "1" },
    { label: "Düşük", value: "2" },
    { label: "Orta", value: "3" },
    { label: "Yüksek", value: "4" },
    { label: "Çok Yüksek", value: "5" },
  ];

  const [selectedValue, setSelectedValue] = useState(
    question?.default_values || ""
  );

  const handleChange = (item) => {
    setSelectedValue(item.value);
    onValueChange(question?.id, item.value);
  };

  return (
    <View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.dropdownContainer}>
          <View
            style={[
              styles.dropdownContainer,
              { flexDirection: "row", alignItems: "center" },
            ]}
          >
            <Text className="text-default text-title-large font-semibold">
              {question?.name}
            </Text>
            {question.required === 1 && (
              <View className="flex h-4 justify-start ml-2">
                <FontAwesome5
                  name="star-of-life"
                  size={8}
                  color="red"
                  style={{ border: "1px solid red" }}
                />
              </View>
            )}
          </View>
          <Dropdown
            data={status}
            labelField="label"
            valueField="value"
            placeholder="Seçiniz..."
            value={selectedValue}
            onChange={handleChange}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const GlpiSelectDropdown = ({ question, onValueChange, selectedItems }) => {
  const { getPluginByDevices } = useAuthCalls();
  const [deviceList, setDeviceList] = useState([]);

  useEffect(() => {
    const fetchCalls = async () => {
      const data = await getPluginByDevices(question.itemtype);
      const dropdownData = data.map((machine) => ({
        label: machine.name,
        value: machine.id.toString(), // value olarak id'yi string formatına dönüştürdük
      }));

      setDeviceList(dropdownData);
    };
    fetchCalls();
  }, []);
 
  return (
    <View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.dropdownContainer}>
          <View
            style={[
              styles.dropdownContainer,
              { flexDirection: "row", alignItems: "center" },
            ]}
          >
            <Text className="text-default text-title-large font-semibold mr-2">
              {question?.name}
            </Text>
            {question.required === 1 && (
              <View className="flex h-4 justify-start ml-2">
                <FontAwesome5
                  name="star-of-life"
                  size={8}
                  color="red"
                  style={{ border: "1px solid red" }}
                />
              </View>
            )}
          </View>
          <Dropdown
            data={deviceList}
            labelField="label"
            valueField="value"
            placeholder="Seçiniz..."
            value={question.default_values}
            onChange={(item) =>
              onValueChange(question.id, item.value.toString())
            }
          />
        </View>
      </ScrollView>
    </View>
  );
};
const SelectDropdown = ({ question, onValueChange, selectedItems }) => {
  
  const [dropDownData, setDropdownData] = useState([]);
  useEffect(() => {
    const parseValues = () => {
      let parsedValues = question?.values;

      if (typeof parsedValues === "string") {
        try {
          parsedValues = JSON.parse(parsedValues);
        } catch (error) {
          
        }
      }

      if (Array.isArray(parsedValues)) {
        const data = parsedValues.map((item) => ({
          label: `${item}`,
          value: item,
        }));
        setDropdownData(data);
      } 
    };

    parseValues();
  }, [question?.values]);
  return (
    <View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.dropdownContainer}>
          <View
            style={[
              styles.dropdownContainer,
              { flexDirection: "row", alignItems: "center" },
            ]}
          >
            <Text className="text-default text-title-large font-semibold mr-2">
              {question?.name}
            </Text>
            {question.required === 1 && (
              <View className="flex h-4 justify-start ml-2">
                <FontAwesome5
                  name="star-of-life"
                  size={8}
                  color="red"
                  style={{ border: "1px solid red" }}
                />
              </View>
            )}
          </View>
          <Dropdown
            data={dropDownData}
            labelField="label"
            valueField="value"
            placeholder="Seçiniz..."
            value={question.default_values}
            onChange={(item) =>
              onValueChange(question?.id, item.value.toString())
            }
          />
        </View>
      </ScrollView>
    </View>
  );
};
const DropDown = ({ question, onValueChange }) => {
  
  const { useFormGetType } = useFormCalls();
  const [data, setData] = useState([]);

  useEffect(() => {
    const fecthCalls = async () => {
      const response = await useFormGetType(question?.itemtype);

      const dropdownData = response.map((item) => ({
        label: item.completename,
        value: item.id,
      }));
      setData(dropdownData);
    };
    fecthCalls();
  }, []);

  return (
    <View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.dropdownContainer}>
          <View
            style={[
              styles.dropdownContainer,
              { flexDirection: "row", alignItems: "center" },
            ]}
          >
            <Text className="text-default text-title-large font-semibold mr-2">
              {question?.name}
            </Text>
            {question.required === 1 && (
              <View className="flex h-4 justify-start ml-2">
                <FontAwesome5
                  name="star-of-life"
                  size={8}
                  color="red"
                  style={{ border: "1px solid red" }}
                />
              </View>
            )}
          </View>

          <Dropdown
            data={data}
            labelField="label"
            valueField="value"
            placeholder="Seçiniz..."
            value={question?.default_values}
            onChange={(item) =>
              onValueChange(question.id, item.value.toString())
            }
          />
        </View>
      </ScrollView>
    </View>
  );
};
const RadioGroup = ({ question, onValueChange, selectedValue }) => {
  let values = [];
  try {
    values = JSON.parse(question.values);
  } catch (e) {
    console.error("Error parsing values:", e);
  }

  return (
    <View>
      <RadioButton.Group
        onValueChange={(value) => onValueChange(question.id, value.toString())}
        value={selectedValue}
      >
        {values.map((value, index) => (
          <View className="flex bg-gray-400 mb-2 rounded-lg" key={value}>
            <RadioButton.Item
              label={value}
              value={value}
              labelStyle={{ fontSize: 16, fontWeight: "bold" }} // Yazı tipi kalınlığını artırır
              color="black" // İkon rengini kırmızı yapar,
            />
          </View>
        ))}
      </RadioButton.Group>
    </View>
  );
};
const MultiSelectComponent = ({ question, onValueChange, selectedItems }) => {
  let values = [];
  try {
    values = JSON.parse(question.values);
  } catch (e) {
    console.error("Error parsing values:", e);
  }

  // Create a section with an empty name to minimize the section header
  const sections = [
    {
      id: "section1",
      name: "", // Empty name to hide the heading
      children: values.map((value) => ({
        id: value,
        name: value,
      })),
    },
  ];

  return (
    <View className="w-full">
      <View
        style={[
          styles.dropdownContainer,
          { flexDirection: "row", alignItems: "center" },
        ]}
      >
        <Text className="text-default text-title-large font-semibold mr-4">
          {question?.name}
        </Text>
        {question.required === 1 && (
          <View className="flex h-4 justify-start ml-2">
            <FontAwesome5
              name="star-of-life"
              size={8}
              color="red"
              style={{ border: "1px solid red" }}
            />
          </View>
        )}
      </View>
      <SectionedMultiSelect
        items={sections}
        uniqueKey="id"
        subKey="children"
        selectText="Seçiniz..."
        IconRenderer={Icon}
        showDropDowns={false} // Disable dropdowns
        readOnlyHeadings={true} // Disable headings
        showChips={true}
        styles={{
          containerMulti: styles.containerMulti,
          selectToggle: styles.selectToggle, // Dışarıdan gelen stil objesi
          item: styles.item, // Dışarıdan gelen stil objesi
          selectedItem: styles.selectedItem, // Dışarıdan gelen stil objesi
          searchInput: styles.searchInput, // Dışarıdan gelen stil objesi
          subItem: styles.subItem, // Dışarıdan gelen stil objesi
        }}
        onSelectedItemsChange={(items) => onValueChange(question.id, items)}
        selectedItems={selectedItems}
      />
    </View>
  );
};
const TextArea = ({ question, onValueChange, value }) => (
  <TextInput
    multiline
    placeholder={question.name}
    className="border border-gray-900 rounded-md h-12  px-2 py-2"
    onChangeText={(text) => onValueChange(question.id, text)}
    value={value}
  />
);

const DatePicker = ({ question, onValueChange }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState();

  const showDatePicker = () => setIsVisible(true);
  const hideDatePicker = () => setIsVisible(false);

  const handleConfirm = (date) => {
    const formattedDate = moment(date).format("YYYY-MM-DD");
    onValueChange(question.id, formattedDate);
    setSelectedDate(formattedDate);
    hideDatePicker();
  };

  return (
    <View className="py-2">
      <Text style={styles.questionText}>
        Tarih{" "}
        {selectedDate
          ? moment(selectedDate).format("D - MMMM - YYYY")
          : "Seçilmedi..."}
        {question.required === 1 && (
          <View className="flex h-4 justify-start ml-2">
            <FontAwesome5
              name="star-of-life"
              size={8}
              color="red"
              style={{ border: "1px solid red" }}
            />
          </View>
        )}
      </Text>
      <TouchableOpacity style={styles.dateButton} onPress={showDatePicker}>
        <Text>Tarih Seç </Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        textColor="black"
        locale={"tr"}
        buttonTextColorIOS="black"
      />
    </View>
  );
};
const ActorSelect = ({ question, onValueChange }) => {
  const [viewer, setViewer] = useState([]);
  const [allGroup, setAllGroup] = useState([]);
  const [combinedItems, setCombinedItems] = useState([]);
  const [defaultSelectedItems, setDefaultSelectedItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersString = await AsyncStorage.getItem("User");
        const groupString = await AsyncStorage.getItem("Group");

        const user = usersString ? JSON.parse(usersString) : [];
        const group = groupString ? JSON.parse(groupString) : [];

        setViewer(user);
        setAllGroup(group);

        // const allUser = [
        //   {
        //     id: "user-list",
        //     name: "User List",
        //     children: user.map((item) => ({
        //       ...item,
        //       id: `user-${item.id}`,
        //     })),
        //   },
        // ];
        const allUser = [
          {
            id: "user-list",
            name: "",
            children: user.map((item) => ({
              ...item,
              id: `${item.id}`,
            })),
          },
        ];

        const groupData = [
          {
            id: "group-list",
            name: "Group List",
            children: group.map((item) => ({
              ...item,
              id: `group-${item.id}`,
            })),
          },
        ];

        //setCombinedItems([...allUser, ...groupData]);
        setCombinedItems([...allUser]);

       
        if (question.default_values !== "") {
          const defaultValues = question.default_values
            .replace(/[\[\]"]+/g, "")
            .split(",")
            .map((value) => `${value.trim()}`);
          setDefaultSelectedItems(defaultValues);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [question.default_values]);

  return (
    <View>
      <Text className="text-default text-title-large font-semibold">
        {question.name}{" "}
        {question.required === 1 && (
          <View className="flex h-4 justify-start ml-2">
            <FontAwesome5
              name="star-of-life"
              size={8}
              color="red"
              style={{ border: "1px solid red" }}
            />
          </View>
        )}
      </Text>
      <SectionedMultiSelect
        items={combinedItems}
        uniqueKey="id"
        subKey="children"
        selectText="Gözlemci Ekle..."
        showDropDowns={false}
        readOnlyHeadings={true}
        IconRenderer={Icon}
        selectedItems={defaultSelectedItems}
        onSelectedItemsChange={(items) => {
          const filteredItems = items.filter((item) => item !== ""); // Boş değerleri filtrele
          setDefaultSelectedItems(filteredItems); // Seçilen öğeleri state'de güncelle
          onValueChange(question.id, filteredItems);
        }}
      />
    </View>
  );
};

const FormScreen = ({ route, navigation }) => {
  const [formSections, setFormSections] = useState([]);
  const [responses, setResponses] = useState({});
  const [relatedItems, setRelatedItems] = useState({});
  const [compulsoryQuestions, setCompulsoryQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showQuestion, setShowQuestion] = useState();

  const {
    getFormSection,
    getFormSectionQuestion,
    useFormConditions,
    submitForm,
  } = useFormCalls();

  useEffect(() => {
    const fetchFormSections = async () => {
      setLoading(true);
      try {
        const conditions = await useFormConditions();
        const sections = await getFormSection(route.params?.itemId);
        if (sections) {
          const sectionsWithQuestions = await Promise.all(
            sections.map(async (section) => {
              const questions = await getFormSectionQuestion(section.id);
              if (!questions || questions.length === 0) {
                console.warn(`No questions found for section ${section.id}`);
              }

              const sortedQuestions = questions.sort((a, b) => a.row - b.row);
              const idList = sortedQuestions.map((item) => item.id);
              const filteredConditions = conditions?.filter((condition) =>
                idList.includes(condition.plugin_formcreator_questions_id)
              );

              const questionsWithConditions = sortedQuestions.map(
                (question) => {
                  const questionCondition = filteredConditions?.filter(
                    (condition) => condition.items_id === question.id
                  );
                  return {
                    ...question,
                    question_filled_value: "",
                    condition: questionCondition,
                  };
                }
              );

              return {
                ...section,
                questions: questionsWithConditions,
              };
            })
          );
          setLoading(false);
          setFormSections(sectionsWithQuestions);
          const defaultResponses = {};
          sectionsWithQuestions
            .flatMap((section) => section?.questions)
            .forEach((question) => {
              if (question?.default_values) {
                defaultResponses[question?.id] = question?.default_values;
              }
            });
          setResponses(defaultResponses);
        }
      } catch (error) {
        console.Log("Bir hata oluştu:", error);
        Alert.alert("Hata", "Form verileri alınırken bir hata oluştu.");
      }
    };

    fetchFormSections();
  }, [route.params?.itemId]);



  const handleValueChange = (questionId, value) => {
    

    const allQuestions = formSections.flatMap((section) => section.questions);

    const oldRelatedItems = allQuestions?.filter((item) =>
      item.condition.some(
        (condItem) => condItem?.plugin_formcreator_questions_id == questionId
      )
    );

    const newRelatedItems = allQuestions?.filter((item) =>
      item.condition.some(
        (condItem) =>
          condItem?.plugin_formcreator_questions_id == questionId &&
          condItem.show_value == value
      )
    );

    const oldRelatedItemsIds = oldRelatedItems.map((item) => item.id);
    const allRelatedItems = allQuestions?.filter((item) =>
      item.condition.some((condItem) =>
        oldRelatedItemsIds.includes(condItem.plugin_formcreator_questions_id)
      )
    );

    const newQuestionsToShow = newRelatedItems.flatMap((item) =>
      item.condition.map((condItem) =>
        allQuestions.find(
          (q) => q.id === condItem.plugin_formcreator_questions_id
        )
      )
    );

    const updatedFormSections = formSections.map((section) => {
      const updatedQuestions = section.questions.map((question) => {
        if (newRelatedItems.some((item) => item.id === question.id)) {
          return { ...question, show_rule: 1 };
        }
        if (oldRelatedItems.some((item) => item.id === question.id)) {
          return { ...question, show_rule: 2 };
        }
        if (allRelatedItems.some((item) => item.id === question.id)) {
          return { ...question, show_rule: 2 };
        }
        if (newQuestionsToShow.some((item) => item?.id === question.id)) {
          return { ...question, show_rule: 1 };
        }
        return question;
      });
      return { ...section, questions: updatedQuestions };
    });

    setFormSections(updatedFormSections);

    const hiddenQuestions = updatedFormSections.flatMap((section) =>
      section.questions
        .filter((question) => question.show_rule === 2)
        .map((q) => q.id)
    );
    setResponses((prevResponses) => {
      const updatedResponses = { ...prevResponses };
      hiddenQuestions.forEach((id) => {
        delete updatedResponses[id];
      });
      return {
        ...updatedResponses,
        [questionId]: value,
      };
    });

    setRelatedItems((prevRelatedItems) => {
      const updatedRelatedItems = { ...prevRelatedItems };
      oldRelatedItems.forEach((item) => {
        if (!newRelatedItems.find((newItem) => newItem.id === item.id)) {
          delete updatedRelatedItems[item.id];
        }
      });
      newRelatedItems.forEach((item) => {
        if (!updatedRelatedItems[item.id]) {
          updatedRelatedItems[item.id] = true;
        }
      });
      return updatedRelatedItems;
    });

    const nonFileShowRuleOneCount = updatedFormSections.flatMap((section) =>
      section.questions?.filter(
        (question) => question.show_rule === 1 && question.fieldtype !== "file"
      )
    ).length;
    const compulsoryQuestionsCount = updatedFormSections.flatMap((section) =>
      section.questions?.filter(
        (question) => question.show_rule === 1 && question.required === 1
      )
    );
    
    setCompulsoryQuestions(compulsoryQuestionsCount);
    setShowQuestion(nonFileShowRuleOneCount);

    
  };
  useEffect(() => {
    const allQuestions = formSections.flatMap((section) => section.questions);

    const updatedFormSections = formSections.map((section) => {
      const updatedQuestions = section.questions.map((question) => {
        // `question.required === 1` olan sorular `compulsoryQuestionsCount`'ta toplanacak
        return question;
      });
      return { ...section, questions: updatedQuestions };
    });

    const compulsoryQuestionsCount = updatedFormSections.flatMap((section) =>
      section.questions?.filter(
        (question) => question.show_rule === 1 && question.required === 1
      )
    );
  
    setCompulsoryQuestions(compulsoryQuestionsCount);
  }, [formSections]); // formSections değişkenini bağımlılık listesine ekleyin.

  function sanitizeDescription(description) {
    // HTML karakterlerini çözme
    const decodedString = description
      .replace(/&#60;/g, "<")
      .replace(/&#62;/g, ">");

    // HTML etiketlerini kaldırma
    const cleanedString = decodedString.replace(/<\/?[^>]+(>|$)/g, "");

    return cleanedString;
  }
  const renderQuestion = (question) => {
    if (question.show_rule === 2) {
      return null;
    }

    switch (question.fieldtype) {
      case "textarea":
        return (
          <View key={question.id} className="flex">
            <Text className="mb-2 text-title-small text-paradise font-medium">
              {sanitizeDescription(question.description)}{" "}
              {question.required === 1 && (
                <View className="flex h-4 justify-start ml-2">
                  <FontAwesome5
                    name="star-of-life"
                    size={8}
                    color="red"
                    style={{ border: "1px solid red" }}
                  />
                </View>
              )}
            </Text>
            <TextArea
              key={question.id}
              question={question}
              onValueChange={handleValueChange}
            />
          </View>
        );
      case "float":
        return (
          <Float
            key={question.id}
            question={question}
            onValueChange={handleValueChange}
          />
        );
      case "multiselect":
        return (
          <MultiSelectComponent
            key={question.id}
            question={question}
            onValueChange={handleValueChange}
            selectedItems={responses[question.id] || []}
          />
        );
      case "select":
        return (
          <SelectDropdown
            key={question.id}
            question={question}
            onValueChange={handleValueChange}
            selectedItems={responses[question.id] || []}
          />
        );
      case "urgency":
        return (
          <UrgencyDropdown
            key={question.id}
            question={question}
            onValueChange={handleValueChange}
            selectedItems={question?.default_values}
          />
        );
      case "glpiselect":
        return (
          <GlpiSelectDropdown
            key={question.id}
            question={question}
            onValueChange={handleValueChange}
            selectedItems={question?.default_values}
          />
        );
      case "radios":
        return (
          <View key={question.id} style={{ marginBottom: 10 }}>
            <View>
              <View className="flex flex-row">
                <View className="">
                  <Text className="text-label-medium font-medium text-default">
                    {question.name}
                  </Text>
                </View>
                {question.required === 1 && (
                  <View className="flex h-4 justify-start ml-2">
                    <FontAwesome5
                      name="star-of-life"
                      size={8}
                      color="red"
                      style={{ border: "1px solid red" }}
                    />
                  </View>
                )}
              </View>
            </View>

            <RadioGroup
              key={question.id}
              question={question}
              onValueChange={handleValueChange}
              selectedValue={responses[question.id] || ""}
            />
          </View>
        );
      case "date":
        return (
          <DatePicker
            key={question.id}
            question={question}
            onValueChange={handleValueChange}
          />
        );
      case "checkboxes":
        return (
          <CheckboxesComponent
            key={question.id}
            question={question}
            onValueChange={handleValueChange}
          />
        );
      case "actor":
        return (
          <ActorSelect
            key={question.id}
            question={question}
            onValueChange={handleValueChange}
          />
        );
      case "dropdown":
        return (
          <DropDown
            key={question.id}
            question={question}
            onValueChange={handleValueChange}
            value={question?.default_values}
          />
        );
      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
   

    // Zorunlu soruların tümünün cevaplanıp cevaplanmadığını kontrol et
    const missingCompulsoryQuestions = compulsoryQuestions.filter(
      (question) => {
        const questionId = question.id;
        const responseKey = `${questionId}`;
        return (
          !responses.hasOwnProperty(responseKey) ||
          responses[responseKey] === ""
        );
      }
    );
    
    if (missingCompulsoryQuestions.length > 0) {
      // Zorunlu sorulardan herhangi biri boş bırakılmışsa hata ver
      Alert.alert("Hata", "Zorunlu olan soruların cevapları eksik!");
      setLoading(false)
      return;
    }

    const addPrefix = (obj) => {
      const updatedObj = {};
      Object.keys(obj).forEach((key) => {
        updatedObj[`formcreator_field_${key}`] = obj[key];
      });
      return updatedObj;
    };

    const updatedData = addPrefix(responses);
    const finalyData = {
      input: {
        plugin_formcreator_forms_id: route.params?.itemId,
        ...updatedData,
      },
    };

  
    const submitFinaly = await submitForm(finalyData);
    

    setLoading(false);
  };
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      className=""
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 16 }}
        className="flex-1"
      >
        <View className="flex-1 pb-80">
          {formSections.length > 0 ? (
            formSections.map((section) => (
              <View key={section.id} className="mb-4">
                <Text className="text-title-medium font-medium text-paradise">
                  {section.name}
                </Text>
                {section.questions.map((question, index) => {
                  if (
                    !question ||
                    question.show_rule === 2 ||
                    !renderQuestion(question)
                  ) {
                    return null;
                  }

                  return (
                    <View
                      key={question.id}
                      className="my-2 bg-gray-300 px-2 py-1 rounded-md shadow-lg"
                    >
                      {renderQuestion(question)}
                    </View>
                  );
                })}
              </View>
            ))
          ) : (
            <Text>Loading...</Text>
          )}
          {/* Submit butonu formSections döngüsünden sonra */}
          <Button title="Submit" onPress={handleSubmit} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default FormScreen;

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: "bold",
  },
  containerMulti: {
    borderWidth: 1,
    borderColor: "red",
  },
  dropdownMenu: {
    backgroundColor: "rgba(186, 189, 182, 0.2)", // bg-gray-300/20
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    height: "12px",
  },
  inputGroup: {
    borderRadius: 5,
    paddingLeft: "4px",
  },
  input: {
    borderColor: "red",
    borderWidth: 1,
    borderRadius: 5,
  },
  listContainer: {
    borderWidth: 1,
    borderRadius: 5,
  },
  dropdown: {
    height: 50,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: "white",
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center", // Center dropdown if needed
  },
  dropdownContainer: {
    zIndex: 1000, // Ensure dropdown is on top of other elements
  },
  dropdown: {
    height: 50,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: "white",
  },
  dropdownContainerStyle: {
    zIndex: 1001, // Dropdown menu should be above other content
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  container: {
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  questionText: {
    fontSize: 16,
    marginBottom: 10,
    color: "#333",
  },
  dateButton: {
    backgroundColor: "#e0e0e0",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
    color: "#000",
  },

  container: {
    padding: 10,
  },
  questionText: {
    fontSize: 16,
    marginBottom: 10,
  },

  checkbox: {
    padding: 10,
    marginRight: 10, // Checkbox ile metin arasına boşluk ekler
    backgroundColor: "yellow",
    width: 20,
    height: 20,
    borderRadius: 20,
  },
});
