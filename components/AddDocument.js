import React, { useState } from "react";
import { View, Text, Button, Modal, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import useTicketCalls from "../hooks/useTicketCalls";
import { useSelector } from "react-redux";
import { selectCurrentUser_id } from "../toolkit/services/AuthSlice";

const AddDocument = ({ isModalVisible, setModalVisible, ticketId,followItems }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const user_id = useSelector(selectCurrentUser_id);
  const navigation = useNavigation();
  const { uploadDocument, DocumentItem } = useTicketCalls();

  const handleImagePick = async (source) => {
    try {
      let result;
      if (source === "camera") {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
      }

      if (!result.canceled) {
        setSelectedImage(result);
      }
    } catch (err) {
      console.error("Error picking image:", err);
    }
  };

  const addDocuments = async (fileUri, id) => {
    setLoading(true); // Start loading before async call
    try {
      const result = await uploadDocument(fileUri, id, user_id);
      console.log("object",result.id)
      if (result.id) {
       console.log({input: {
        documents_id: result.id,
        itemtype: followItems ? "ITILFollowup" : "Ticket",
        items_id: ticketId,
        users_id: user_id,
        // date_mod: "2024-07-02 16:46:04",
        // date_creation: "2024-07-02 16:46:04",
        // date: "2024-07-02 16:46:04",
      }},)
        const resultDocument =await DocumentItem({
          input: {
            documents_id: result.id,
            itemtype: followItems ? "ITILFollowup" : "Ticket",
            items_id: ticketId,
            users_id: user_id,
            // date_mod: "2024-07-02 16:46:04",
            // date_creation: "2024-07-02 16:46:04",
            // date: "2024-07-02 16:46:04",
          },
        });
        console.log(" success" ,resultDocument)
        setUploadComplete(true);
      }
    } catch (error) {
      console.error("Error uploading document:", error);
    } finally {
      setLoading(false); // Stop loading after async call
    }
  };

  const handleAddDocument = async () => {
    if (selectedImage) {
      await addDocuments(selectedImage, ticketId);
    }
  };

  const handleComplete = () => {
    setModalVisible(false);
    navigation.navigate("Home");
  };

  return (
    <Modal
      visible={isModalVisible}
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text>Would you like to add a document to this ticket?</Text>
          {!loading && !uploadComplete && (
            <View style={styles.buttonContainer}>
              <Button
                title="Take Photo"
                onPress={() => handleImagePick("camera")}
              />
              <Button
                title="Pick from Gallery"
                onPress={() => handleImagePick("gallery")}
              />
            </View>
          )}
          {selectedImage && !loading && !uploadComplete && (
            <Button title="Submit" onPress={handleAddDocument} />
          )}
          {loading && <Text>yükleniyor...</Text>}
          {uploadComplete && (
            <Button title="Tamam" onPress={handleComplete} />
          )}
          {!loading && !uploadComplete && (
            <Button
              title="Cancel"
              onPress={() => setModalVisible(false)}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
});

export default AddDocument;
