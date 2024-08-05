import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  StyleSheet,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import React, { useEffect, useState, useCallback } from "react";
import { debounce } from "lodash";
import useTicketCalls from "../hooks/useTicketCalls";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../toolkit/services/AuthSlice";
import { useFocusEffect } from "@react-navigation/native";

export default function SupportScreen({ navigation }) {
  const user = useSelector(selectCurrentUser)
  const { getAllTickets } = useTicketCalls();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [activeFilter, setActiveFilter] = useState("Tümü");

  useFocusEffect(
    useCallback(() => {
      const fetchTickets = async () => {
        setLoading(true);
        try {
          const fetchedTickets = await getAllTickets();
          setTickets(fetchedTickets);
          setFilteredTickets(fetchedTickets);
        } catch (error) {
          console.error("Error fetching tickets:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchTickets();
    }, [])
  );


  const status = [
    { label: "Yeni", value: "1" },
    { label: "İşleniyor (atanmış)", value: "2" },
    { label: "İşleniyor (planlanmış)", value: "3" },
    { label: "Bekliyor", value: "4" },
    { label: "Çözülmüş", value: "5" },
    { label: "Kapalı", value: "6" },
  ];

  const handleSearch = useCallback(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    let filtered = tickets.filter((ticket) =>
      ticket.name.toLowerCase().includes(lowercasedQuery)
    );

    // Aktif filtreye göre ek filtreleme
    if (activeFilter === "İşleniyor") {
      filtered = filtered.filter((ticket) => ticket.status === 2);
    } else if (activeFilter === "Çözümlenmiş") {
      filtered = filtered.filter((ticket) => ticket.status === 5);
    }

    setFilteredTickets(filtered);
  }, [searchQuery, activeFilter, tickets]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setSearchQuery("");
    if (filter === "Tümü") {
      setFilteredTickets(tickets);
    } else if (filter === "İşleniyor") {
      setFilteredTickets(tickets.filter((ticket) => ticket.status === 2));
    } else if (filter === "Çözümlenmiş") {
      setFilteredTickets(tickets.filter((ticket) => ticket.status === 5));
    }
  };

  // Debounced search function to avoid too many re-renders
  const debouncedSearch = useCallback(debounce(handleSearch, 300), [handleSearch]);

  useEffect(() => {
    debouncedSearch();
  }, [searchQuery, debouncedSearch]);

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 5:
        return "#FF6347";
      case 4:
        return "#D7D7D7";
      case 3:
        return "#AD9FCF"; 
      case 2:
        return "#9ACD32"; 
      case 1:
        return "#32CD32"; 
      default:
        return "#DDDDDD";
    }
  };

  const getItemLayout = (data, index) => ({
    length: 60,
    offset: 60 * index,
    index,
  });

  const renderItem = React.useCallback(
    ({ item }) => {
      const ticketStatus = status.find(
        (s) => s.value === item.status.toString()
      );
      return (
        <TouchableOpacity
          className="flex py-4 mt-2 px-2 justify-center items-center"
          onPress={() =>
            navigation.navigate("CreateSupport", { itemId: item.id })
          }
          style={[
            styles.item,
            { backgroundColor: getUrgencyColor(item.status) },
          ]}
        >
          <Text className="text-title-medium font-semibold text-default py-1 text-center">
            {`${item.name} - ${item.id} -${item.users_id_recipient}`}
          </Text>
          <Text className="text-title-medium font-semibold text-gray-600 ml-2 py-1">
            {item.date_creation}
          </Text>
          <Text className="text-title-medium font-semibold text-gray-600 ml-2 py-1">
            {ticketStatus ? ticketStatus.label : "Bilinmeyen Durum"}
          </Text>
        </TouchableOpacity>
      );
    },
    [navigation, status]
  );

  const sortedTickets = filteredTickets.sort(
    (a, b) => new Date(b.date_creation) - new Date(a.date_creation)
  );

  if (loading) {
    return (
      <ActivityIndicator
        size={"large"}
        color="red"
        style={styles.loader}
        animating={true}
        className="flex-1"
      />
    );
  }

  return (
    <View className="relative flex-1">
      <View className="flex flex-row gap-2 mt-2 py-2 mx-1">
        <TextInput
          placeholder="Ara..."
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
          className="w-[40%] border ml-4 h-8 mt-2 pl-2 rounded-md"
        />
        <TouchableOpacity
          className={`h-8 flex justify-center items-center px-2 rounded-md ${
            activeFilter === "Tümü" ? "bg-red-500" : "bg-gray-300"
          }`}
          onPress={() => handleFilterChange("Tümü")}
        >
          <Text className="text-white font-medium">Tümü</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`h-8 flex justify-center items-center px-2 rounded-md ${
            activeFilter === "İşleniyor" ? "bg-red-500" : "bg-gray-300"
          }`}
          onPress={() => handleFilterChange("İşleniyor")}
        >
          <Text className="text-white font-medium">İşleniyor</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`h-8 flex justify-center items-center px-2 rounded-md ${
            activeFilter === "Çözümlenmiş" ? "bg-red-500" : "bg-gray-300"
          }`}
          onPress={() => handleFilterChange("Çözümlenmiş")}
        >
          <Text className="text-white font-medium">Çözümlenmiş</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={sortedTickets}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        getItemLayout={getItemLayout}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={21}
      />
      <TouchableOpacity
        className=" w-full h-24 mt-4 p-3  justify-center bg-red-500 items-center sticky bottom-0 left-0"
        onPress={() => navigation.navigate("CreateSupport")}
      >
        <MaterialCommunityIcons name="kabaddi" size={50} color="#FFF" />
        <Text className="text-center font-medium text-title-small text-whitekozy">
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
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    margin: 10,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
});
