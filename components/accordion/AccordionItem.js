import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AccordionItem = ({ title, content, isOpen, onPress }) => {
  const animatedHeight = useSharedValue(isOpen ? 1 : 0);

  React.useEffect(() => {
    animatedHeight.value = withTiming(isOpen ? 1 : 0, {
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    });
  }, [isOpen]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value === 1 ? 'auto' : 0,
    opacity: animatedHeight.value,
    overflow: 'hidden',
  }));

  return (
    <View style={styles.item}>
      <TouchableOpacity onPress={onPress} style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        <Icon name={isOpen ? 'expand-less' : 'expand-more'} size={24} color="black" />
      </TouchableOpacity>
      <Animated.View style={animatedStyle}>
        {content}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontWeight: 'bold',
  },
});

export default AccordionItem;
