import { View, Text, FlatList, ScrollViewBase, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import useFormCalls from "../hooks/useFormCalls";


export default function FormScreen({ route, navigation }) {
  const [formQuestions, setFormQuestions] = useState([]);
  const { getFormSection, getFormSectionQuestion } = useFormCalls();

  useEffect(() => {
    const getFormSectionFunc = async () => {
      try {
        const sections = await getFormSection(route.params?.itemId);
        console.log("Fetched sections:", sections); // Kontrol et

        if (sections) {
          const questionsData = await Promise.all(
            sections.map(async (section) => {
              console.log("Fetching questions for section:", section.id); // Kontrol et
              const questions = await getFormSectionQuestion(section.id);
              console.log("Fetched questions:", questions); // Kontrol et

              const sortedQuestions = questions.sort((a, b) => a.row - b.row);
              const idList = sortedQuestions.map((item) => item.id);
              const questionConditions = []; // Burada gerçek verileri kullanın
              const filteredConditions = questionConditions.filter((item) =>
                idList.includes(item.plugin_formcreator_questions_id)
              );

              const updatedQuestions = sortedQuestions.map((question) => {
                const questionCondition = filteredConditions.filter(
                  (condition) => condition.items_id === question.id
                );
                return {
                  ...question,
                  question_filled_value: "",
                  condition: questionCondition,
                };
              });
              return {
                ...section,
                questions: updatedQuestions,
              };
            })
          );
          console.log("Processed questions data:", questionsData); // Kontrol et
          setFormQuestions(questionsData);
        }
      } catch (error) {
        console.error("Error fetching form sections or questions:", error);
      }
    };
    getFormSectionFunc();
  }, [route.params?.itemId]);

  console.log(formQuestions[0]?.questions, "formQuestions");

  
  return (
    <View>
      <ScrollView>
        {formQuestions.map((section) => (
          <View key={section.id}>
            <Text>Section Name: {section.name}</Text>
            {section.questions.map((question) => (
              <Text key={question.id}>
                Question Text: {question.name}
              </Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
