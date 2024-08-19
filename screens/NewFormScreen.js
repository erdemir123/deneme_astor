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
} from "react-native";
import { RadioButton } from "react-native-paper";
import SectionedMultiSelect from "react-native-sectioned-multi-select";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import useFormCalls from "../hooks/useFormCalls";
import RadioGroup from "../components/RadioGroup";

const NewFormScreen = ({ route, navigation }) => {
  const [formSections, setFormSections] = useState([]);
  const [responses, setResponses] = useState({});
  const [relatedItems, setRelatedItems] = useState({});
  const { getFormSection, getFormSectionQuestion, useFormConditions } = useFormCalls();

  useEffect(() => {
    const fetchFormSections = async () => {
      try {
        const conditions = await useFormConditions();
        const sections = await getFormSection(route.params?.itemId);
        if (sections) {
          const sectionsWithQuestions = await Promise.all(
            sections.map(async (section) => {
              const questions = await getFormSectionQuestion(section.id);
              const sortedQuestions = questions.sort((a, b) => a.row - b.row);
              const idList = sortedQuestions.map((item) => item.id);
              const filteredConditions = conditions.filter((condition) =>
                idList.includes(condition.plugin_formcreator_questions_id)
              );

              const questionsWithConditions = sortedQuestions.map(
                (question) => {
                  const questionCondition = filteredConditions.filter(
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

          setFormSections(sectionsWithQuestions);
        }
      } catch (error) {
        console.log("Error fetching form data:", error);
        Alert.alert("Hata5", "Form verileri alınırken bir hata oluştu.");
      }
    };

    fetchFormSections();
  }, [route.params?.itemId]);

  const handleValueChange = (questionId, value) => {
    // Tüm soruları toplayın
    const allQuestions = formSections.flatMap((section) => section.questions);
  
    // Önceki ilişkili soruları bulun
    const oldRelatedItems = allQuestions.filter((item) =>
      item.condition.some(
        (condItem) =>
          condItem?.plugin_formcreator_questions_id == questionId
      )
    );
  
    // Yeni ilişkili soruları bulun
    const newRelatedItems = allQuestions.filter((item) =>
      item.condition.some(
        (condItem) =>
          condItem?.plugin_formcreator_questions_id == questionId &&
          condItem.show_value == value
      )
    );
  
    // Önceki ilişkili soruların ilişkili olduğu diğer soruları bulun
    const oldRelatedItemsIds = oldRelatedItems.map(item => item.id);
    const allRelatedItems = allQuestions.filter(item =>
      item.condition.some(condItem => oldRelatedItemsIds.includes(condItem.plugin_formcreator_questions_id))
    );
  
    // Yeni cevaba göre açılan sorular
    const newQuestionsToShow = newRelatedItems.flatMap((item) =>
      item.condition.map(condItem =>
        allQuestions.find(q => q.id === condItem.plugin_formcreator_questions_id)
      )
    );
  
    // Form bölümlerini güncelle
    const updatedFormSections = formSections.map((section) => {
      const updatedQuestions = section.questions.map((question) => {
        if (newRelatedItems.some((item) => item.id === question.id)) {
          // Yeni ilişkili soruların show_rule değerini 1 yap
          return { ...question, show_rule: 1 };
        }
        if (oldRelatedItems.some((item) => item.id === question.id)) {
          // Önceki ilişkili soruların show_rule değerini 2 yap
          return { ...question, show_rule: 2 };
        }
        if (allRelatedItems.some((item) => item.id === question.id)) {
          // Önceki ilişkili sorulara bağlı diğer soruların show_rule değerini 2 yap
          return { ...question, show_rule: 2 };
        }
        if (newQuestionsToShow.some((item) => item?.id === question.id)) {
          // Yeni cevaba göre açılan soruların show_rule değerini 1 yap
          return { ...question, show_rule: 1 };
        }
        return question;
      });
      return { ...section, questions: updatedQuestions };
    });
  
    // İlişkili soruları ve yanıtları güncelle
    setFormSections(updatedFormSections);
  
    setRelatedItems((prevRelatedItems) => {
      // Önceki ilişkili soruları temizle
      const updatedRelatedItems = { ...prevRelatedItems };
      oldRelatedItems.forEach((item) => {
        if (!newRelatedItems.find((newItem) => newItem.id === item.id)) {
          delete updatedRelatedItems[item.id];
        }
      });
  
      // Yeni ilişkili soruları ekle
      return {
        ...updatedRelatedItems,
        [questionId]: newRelatedItems,
      };
    });
  
    setResponses((prevResponses) => {
      const updatedResponses = { ...prevResponses };
  
      // Yanıtları güncelle veya sil
      oldRelatedItems.forEach((item) => {
        if (!newRelatedItems.find((newItem) => newItem.id === item.id)) {
          // Eğer eski ilişkili sorular varsa ve yeni ilişkili sorular yoksa, yanıtı sil
          delete updatedResponses[item.id];
        }
      });
  
      // Yanıtları güncelle
      return {
        ...updatedResponses,
        [questionId]: value,
      };
    });
  };
  
  const renderQuestion = (question) => {
    if (question.show_rule === 2 ) {
        return null;
      }

    switch (question.fieldtype) {
      case "textarea":
        return (
          <TextInput
            key={question.id}
            placeholder={question.name}
            value={responses[question.id] || ""}
            onChangeText={(text) => handleValueChange(question.id, text)}
            multiline
            style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}
          />
        );
      case "radios":
        return (
          <View key={question.id} style={{ marginBottom: 10 }}>
            <Text>{question.name}</Text>
            <RadioGroup
            key={question.id}
            question={question}
            onValueChange={handleValueChange}
            selectedValue={responses[question.id] || ""}
          />
            
          </View>
        );
      case "text":
        return (
          <TextInput
            key={question.id}
            placeholder={question.name}
            value={responses[question.id] || ""}
            onChangeText={(text) => handleValueChange(question.id, text)}
            style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}
          />
        );
      case "actor":
        return (
          <SectionedMultiSelect
            key={question.id}
            items={question.values || []}
            uniqueKey="id"
            selectText={question.name}
            onSelectedItemsChange={(selectedItems) => handleValueChange(question.id, selectedItems)}
            selectedItems={responses[question.id] || []}
            single={true}
            searchPlaceholderText="Ara..."
            IconRenderer={Icon}
            styles={{
              selectToggle: {
                borderWidth: 1,
                padding: 8,
                marginBottom: 10,
              },
            }}
          />
        );
      default:
        return null;
    }
  };

  const handleSubmit = () => {
    console.log("Form responses:", responses);
    Alert.alert("Başarılı", "Form başarıyla gönderildi.");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 12 }}>
        {formSections.map((section) => (
          <View key={section.id} style={{ marginBottom: 20 }}>
            <Text style={{ fontWeight: "bold", fontSize: 18 }}>{section.name}</Text>
            {section.questions.map((question) => renderQuestion(question))}
          </View>
        ))}
        <Button title="Gönder" onPress={handleSubmit} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default NewFormScreen;
