import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import apiClient from "../../api/client";

type HistoryOrder = {
  id: number;
  status: string;
  total: number;
  seatNumber: string;
  createdAt?: string;
  items?: { quantity?: number; item?: { name?: string } }[];
  user?: { firstname?: string; lastname?: string; phoneNumber?: string };
  train?: { trainName?: string; name?: string; trainNo?: string };
  restaurant?: { name?: string };
  station?: { name?: string };
};

const OrdersScreen = () => {
  const [orders, setOrders] = useState<HistoryOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"Completed" | "Pending">("Pending");

  const fetchHistory = useCallback(async () => {
    try {
      const storedUserId = await SecureStore.getItemAsync("userId");
      const deliveryPersonId = storedUserId ? Number(storedUserId) : null;
      if (!deliveryPersonId) {
        setIsLoading(false);
        return;
      }

      const response = await apiClient.get(
        `/order/delivery/get?deliveryPersonId=${deliveryPersonId}`
      );

      const responseData = response?.data;
      const fetched =
        Array.isArray(responseData?.data)
          ? responseData.data
          : Array.isArray(responseData?.orders)
          ? responseData.orders
          : Array.isArray(responseData)
          ? responseData
          : [];

      setOrders(fetched);
    } catch (error) {
      console.error("Failed to load order history", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchHistory();
    setIsRefreshing(false);
  }, [fetchHistory]);

  const renderItem = ({ item }: { item: HistoryOrder }) => {
    const customer =
      `${item.user?.firstname || ""} ${item.user?.lastname || ""}`.trim() ||
      "Customer";
    const train =
      item.train?.trainName || item.train?.name || item.train?.trainNo || "Train";
    const shop = item.restaurant?.name || "Restaurant";
    const itemsCount = item.items?.reduce(
      (sum, i) => sum + (i.quantity || 1),
      0
    );

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.orderId}>Order #{item.id}</Text>
          <Text style={styles.status}>{item.status}</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="person-outline" size={16} color="#666" />
          <Text style={styles.rowText}>{customer}</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="call" size={16} color="#666" />
          <Text style={styles.rowText}>{item.user?.phoneNumber}</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="train-outline" size={16} color="#666" />
          <Text style={styles.rowText}>
            {train} • Seat {item.seatNumber}
          </Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.metaText}>
            Items: {itemsCount ?? item.items?.length ?? 0}
          </Text>
          <Text style={styles.total}>Rs. {item.total}</Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF5A1F" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order History</Text>
      <View style={styles.tabsContainer}>
        <Text
          style={[styles.tab, activeTab === "Pending" && styles.activeTab]}
          onPress={() => setActiveTab("Pending")}
        >
          Pending
        </Text>
        <Text
          style={[styles.tab, activeTab === "Completed" && styles.activeTab]}
          onPress={() => setActiveTab("Completed")}
        >
          Completed
        </Text>
      </View>
      <FlatList
        data={orders.filter((o) => {
          if (activeTab === "Completed") return o.status === "DELIVERED";
          return o.status !== "DELIVERED";
        })}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No orders found</Text>
          </View>
        }
      />
    </View>
  );
};

export default OrdersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9FB",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#221813",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  tabsContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 6,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: "#F0E9E6",
  },
  tab: {
    flex: 1,
    textAlign: "center",
    paddingVertical: 10,
    borderRadius: 10,
    fontWeight: "700",
    color: "#7A6D65",
  },
  activeTab: {
    backgroundColor: "#FF5A1F",
    color: "#FFF",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0E9E6",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "700",
    color: "#221813",
  },
  status: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FF5A1F",
    backgroundColor: "#FFF1ED",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  rowText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#312621",
    fontWeight: "600",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  metaText: {
    fontSize: 13,
    color: "#7A6D65",
    fontWeight: "600",
  },
  total: {
    fontSize: 16,
    fontWeight: "800",
    color: "#188048",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#5C4F48",
  },
});
