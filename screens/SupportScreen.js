import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    FlatList,
  } from "react-native";
  import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
  import React, { useEffect, useState } from "react";
  import useTicketCalls from "../hooks/useTicketCalls";
  
  export default function SupportScreen({ navigation }) {
    const { getAllTickets } = useTicketCalls();
    const [tickets, setTickets] = useState([]);
  
    useEffect(() => {
      const fetchTickets = async () => {
        try {
          const fetchedTickets = await getAllTickets(); // Assuming getAllTickets returns tickets
          setTickets(fetchedTickets); // Update tickets state with fetched tickets
        } catch (error) {
          console.error('Error fetching tickets:', error);
        }
      };
      fetchTickets();
    }, []);
    const getUrgencyColor = (urgency) => {
      switch (urgency) {
        case 5:
          return '#FF6347'; // Koyu turuncu/kırmızı
        case 4:
          return '#FFA500'; // Turuncu
        case 3:
          return '#FFFF00'; // Sarı
        case 2:
          return '#9ACD32'; // Açık yeşil
        case 1:
          return '#32CD32'; // Yeşil
        default:
          return '#FFFFFF'; // Varsayılan olarak beyaz renk
      }
    };
    console.log(tickets.length,"length")
    return (
      <View className="relative flex-1">
        <View className="flex-1">
        <FlatList
          data={tickets}
          renderItem={({ item }) => (
            <TouchableOpacity className="flex flex-row py-3  mt-2 px-2 h-12 justify-center items-center  " onPress={() => navigation.navigate("CreateSupport", { itemId: item.id })} style={[styles.item, { backgroundColor: getUrgencyColor(item.urgency) }]}> 
              <Text className="text-title-medium font-semibold text-default">{item.name}</Text>
              <Text className="text-title-medium font-semibold text-default ml-2">{item.date_creation}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id.toString()}
        />
        </View>
        <TouchableOpacity
          className=" w-full h-24 mt-4 p-3  justify-center bg-red-500 items-center sticky bottom-0 left-0"
          onPress={() => navigation.navigate("CreateSupport")}
        >
          <MaterialCommunityIcons name="kabaddi" size={50} color="#FFF" />
  
          <Text className="text-center font-medium text-title-small  text-whitekozy">
            Yeni Destek kaydı aç
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  
  const styles = StyleSheet.create({
    item: {
      padding: 20,
      marginVertical: 8,
      marginHorizontal: 16,
      borderRadius: 8,
    },
  });
  