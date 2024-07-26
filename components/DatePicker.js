import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';

const DatePicker = ({ defaultDate, label, func }) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(defaultDate ? new Date(defaultDate) : new Date());

  useEffect(() => {
    if (defaultDate) {
      setSelectedDate(new Date(defaultDate));
    } else {
      setSelectedDate(new Date());
    }
  }, [defaultDate]);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    if (date instanceof Date) {
      setSelectedDate(date);
      const formattedDate = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)} ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}`;
      func(formattedDate); // Call func with the formatted date
    } else {
      console.log('Invalid date format or undefined.');
    }
    hideDatePicker();
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      <Text style={{ fontSize: 16 }}>{label}:</Text>
      <TouchableOpacity onPress={showDatePicker}>
        <Text style={{ fontSize: 16 }}>
          {selectedDate.toLocaleString()} {/* Display date and time */}
        </Text>
      </TouchableOpacity>
      <Icon name="calendar-today" size={20} color="red" />
      {/* <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime" 
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        textColor="black"
        buttonTextColorIOS="black"
      /> */}
    </View>
  );
};

export default DatePicker;
