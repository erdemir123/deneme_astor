import React from "react";
import { View } from "react-native";
import { RadioButton } from "react-native-paper";

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
        onValueChange={(value) => onValueChange(question.id, value)}
        value={selectedValue}
      >
        {values.map((value, index) => (
          <RadioButton.Item
            key={index}
            label={value}
            value={value}
          />
        ))}
      </RadioButton.Group>
    </View>
  );
};

export default RadioGroup;
