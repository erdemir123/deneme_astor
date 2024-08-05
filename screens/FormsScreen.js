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
import React, { useEffect, useState, useCallback, useRef } from "react";
import { debounce } from "lodash";
import useTicketCalls from "../hooks/useTicketCalls";
import { Image } from "react-native";

export default function SupportScreen({ navigation }) {
  const { getAllTickets } = useTicketCalls();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const fetchedTickets = await getAllTickets(); // Assuming getAllTickets returns tickets
        setTickets(fetchedTickets); // Update tickets state with fetched tickets
        setFilteredTickets(fetchedTickets); // Initialize filteredTickets with all tickets
      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    const lowercasedQuery = query.toLowerCase();
    const filtered = tickets.filter((ticket) => {
      const matchesName = ticket.name.toLowerCase().includes(lowercasedQuery);
      const matchesStatus = selectedStatus
        ? ticket.status.toString() === selectedStatus
        : true; // If no status selected, match all
      return matchesName && matchesStatus;
    });
    setFilteredTickets(filtered);
  };

  const debouncedSearch = useRef(debounce(handleSearch, 200)).current;

  useEffect(() => {
    return () => {
      debouncedSearch.cancel(); // Cleanup on unmount
    };
  }, [debouncedSearch]);

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 5:
        return "#FF6347"; // Koyu turuncu/kırmızı
      case 4:
        return "#FFA500"; // Turuncu
      case 3:
        return "#FFFF00"; // Sarı
      case 2:
        return "#9ACD32"; // Açık yeşil
      case 1:
        return "#32CD32"; // Yeşil
      default:
        return "#d1a890"; // Varsayılan olarak beyaz renk
    }
  };

  const status = [
    { label: "Tümü", value: null },
    { label: "Yeni", value: "1" },
    { label: "İşleniyor (atanmış)", value: "2" },
    { label: "İşleniyor (planlanmış)", value: "3" },
    { label: "Bekliyor", value: "4" },
    { label: "Çözülmüş", value: "5" },
    { label: "Kapalı", value: "6" },
  ];

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
            {item.name}
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
        className="flex-1 "
      />
    );
  }

  return (
    <View className="relative flex-1">
      <Image
        source={require("../assets/images/yapim.jpg")}
        className="flex-1 w-[100%] items-center"
      />
      <Text className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-10 text-red-500 font-semibold text-title-large">
        Yapım Aşamasında
      </Text>

      {/* <TextInput
        placeholder="Ara..."
        value={searchQuery}
        onChangeText={(text) => debouncedSearch(text)}
        style={styles.searchInput}
      />
      <View style={styles.filterContainer}>
        {status.map((statusItem) => (
          <TouchableOpacity
            key={statusItem.value}
            onPress={() => setSelectedStatus(statusItem.value)}
            style={[
              styles.statusButton,
              selectedStatus === statusItem.value && styles.selectedStatusButton,
            ]}
          >
            <Text
              style={[
                styles.statusButtonText,
                selectedStatus === statusItem.value &&
                  styles.selectedStatusButtonText,
              ]}
            >
              {statusItem.label}
            </Text>
          </TouchableOpacity>
        ))}
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
      </TouchableOpacity> */}
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
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
  },
  statusButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  selectedStatusButton: {
    backgroundColor: "#ddd",
  },
  statusButtonText: {
    color: "#000",
  },
  selectedStatusButtonText: {
    color: "#000",
    fontWeight: "bold",
  },
});
