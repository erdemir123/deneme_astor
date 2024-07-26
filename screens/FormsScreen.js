import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import { MaterialIcons as Icon } from "@expo/vector-icons";

const MyComponent = () => {
  const items = [
    {
      id: 'first-list',
      name: 'First List',
      children: [
        { id: 'first-list-1', name: 'Item 1-1' },
        { id: 'first-list-2', name: 'Item 1-2' },
      ],
    },
    {
      id: 'second-list',
      name: 'Second List',
      children: [
        { id: 'second-list-1', name: 'Item 2-1' },
        { id: 'second-list-2', name: 'Item 2-2' },
      ],
    },
  ];

  // Başlangıçta belirli öğeleri seçmek için dizi kullanarak ayarlama
  const initialSelectedItems = ['first-list-1', 'second-list-2'];

  const [selectedItems, setSelectedItems] = useState(initialSelectedItems);
  const [selectedInfo, setSelectedInfo] = useState([]);

  useEffect(() => {
    const selectedInfo = initialSelectedItems.map(selectedItemId => {
      let parentName = '';
      items.forEach(parent => {
        const child = parent.children.find(child => child.id === selectedItemId);
        if (child) {
          parentName = parent.name;
        }
      });
      return { id: selectedItemId, parentName };
    });
    setSelectedInfo(selectedInfo);
  }, []);

  const onSelectedItemsChange = (selectedItems) => {
    setSelectedItems(selectedItems);
    const selectedInfo = selectedItems.map(selectedItemId => {
      let parentName = '';
      items.forEach(parent => {
        const child = parent.children.find(child => child.id === selectedItemId);
        if (child) {
          parentName = parent.name;
        }
      });
      return { id: selectedItemId, parentName };
    });
    setSelectedInfo(selectedInfo);
  };

  return (
    <View style={styles.container}>
      <SectionedMultiSelect
        items={items}
        IconRenderer={Icon}
        uniqueKey="id"
        subKey="children"
        selectText="Select items..."
        showDropDowns={true}
        readOnlyHeadings={true}
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
        onSelectedItemsChange={onSelectedItemsChange}
        selectedItems={selectedItems}
      />
      {selectedInfo.map(info => (
        <Text key={info.id}>{`ID: ${info.id}, Parent: ${info.parentName}`}</Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
    padding: 10,
  },
  selectToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  selectToggleText: {
    fontSize: 16,
    color: '#000',
    marginLeft: 10,
  },
  chipContainer: {
    borderRadius: 5,
    backgroundColor: '#f2f2f2',
    padding: 5,
    margin: 2,
  },
  chipText: {
    color: '#333',
    fontSize: 14,
  },
  itemText: {
    color: '#333',
    fontSize: 16,
  },
  subItemText: {
    color: '#666',
    fontSize: 14,
    paddingLeft: 20,
  },
  selectedItemText: {
    color: '#000',
    fontWeight: 'bold',
  },
  selectedSubItemText: {
    color: '#000',
    fontWeight: 'bold',
    paddingLeft: 20,
  },
  confirmText: {
    color: '#000',
    fontSize: 16,
  },
  searchBar: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default MyComponent;
