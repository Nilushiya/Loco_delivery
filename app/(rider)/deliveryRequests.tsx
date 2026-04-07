import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  AppState,
} from "react-native";
import apiClient from "../../api/client"; // Ensure this path is correct based on your folder structure

export type ApiResponse = {
  success: boolean;
  message: string;
  data?: DeliveryOrder[];
  orders?: DeliveryOrder[]; // Handling in case API returns orders instead of data
};
export type DeliveryOrder = {
  id: number;
  seatNumber: string;
  total: number;
  orderedAt: string;
  cancelledAt: string | null;
  acceptedAt: string | null;
  rejectedAt: string | null;
  pickedupAt: string | null;
  handedOverAt: string | null;
  outForDeliveryAt: string | null;
  deliveredAt: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  restaurantId: number;
  pickupPersonId: number | null;
  deliveryPersonId: number | null;
  stationId: number;
  trainId: number;
  items: any[];
  user: any;
  train: any;
  station: {
    id: number;
    name: string;
    locationLongitude: string;
    locationLatitude: string;
    createdAt: string;
    updatedAt: string;
  };
};

import * as SecureStore from 'expo-secure-store';

const POLLING_INTERVAL_MS = 4000; // 4 seconds

const DeliveryRequestsScreen = () => {
  const [deliveryPersonId, setDeliveryPersonId] = useState<number | null>(null);

  const [requests, setRequests] = useState<DeliveryOrder[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isFetchingRef = useRef(false);

  // Get the ID from SecureStore on mount
  useEffect(() => {
    const fetchId = async () => {
      try {
        const storedId = await SecureStore.getItemAsync('userId');
        if (storedId) {
          setDeliveryPersonId(Number(storedId));
        } else {
          setIsInitialLoading(false); // No id, stop loading animation
        }
      } catch (err) {
        console.error("Failed to load user ID", err);
        setIsInitialLoading(false);
      }
    };
    fetchId();
  }, []);

  // Fetch Delivery Requests Function
  const fetchDeliveryRequests = useCallback(async () => {
    // Prevent overlapping network requests, or fetching if no valid ID
    if (!deliveryPersonId || isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    try {
      const response = await apiClient.get(`/order/delivery/get?deliveryPersonId=${deliveryPersonId}`);
      
      // Extremely safe payload unpacking to prevent "Cannot read property 'orders' of undefined"
      const responseData = response ? response.data : null;
      let fetchedOrders: DeliveryOrder[] = [];
      
      if (responseData && Array.isArray(responseData.orders)) {
        fetchedOrders = responseData.orders;
      } else if (responseData && Array.isArray(responseData.data)) {
        fetchedOrders = responseData.data;
      }

      if (Array.isArray(fetchedOrders)) {
        setRequests((prevRequests) => {
          const newOrders = fetchedOrders.filter(
            (newOrder) => !prevRequests.some((prevOrder) => prevOrder.id === newOrder.id)
          );

          if (newOrders.length === 0) return prevRequests;
          return [...newOrders, ...prevRequests];
        });
      }
    } catch (error) {
      console.error("Failed to fetch delivery requests", error);
    } finally {
      isFetchingRef.current = false;
      setIsInitialLoading(false);
    }
  }, [deliveryPersonId]);

  // Handle Polling and Application State
  useEffect(() => {
    // Initial fetch
    fetchDeliveryRequests().finally(() => setIsInitialLoading(false));

    let intervalId: NodeJS.Timeout;

    // Start polling function
    const startPolling = () => {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(fetchDeliveryRequests, POLLING_INTERVAL_MS) as any;
    };

    // Subscribing to Application State (Background / Foreground)
    // We only poll when the app is active
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        fetchDeliveryRequests(); // Immediate fetch on resume
        startPolling();
      } else {
        clearInterval(intervalId);
      }
    });

    startPolling();

    // Cleanup interval and event listener on unmount
    return () => {
      if (intervalId) clearInterval(intervalId);
      subscription.remove();
    };
  }, [fetchDeliveryRequests]);

  // Handle Manual Pull-to-Refresh
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // When manually refreshing, we might optionally want to clear existing and get fresh
    // setRequests([]); 
    await fetchDeliveryRequests();
    setIsRefreshing(false);
  }, [fetchDeliveryRequests]);

  // Handle Accept Action
  const handleAccept = async (orderId: number) => {
    // Optimistic UI Update: Remove item immediately
    setRequests((prev) => prev.filter((order) => order.id !== orderId));

    try {
      // Replace with your API call to accept the order
      // await apiClient.post(`/delivery-person/accept/${orderId}`);
      console.log(`Accepted order ${orderId}`);
    } catch (error) {
      console.error("Failed to accept order, reverting UI", error);
      Alert.alert("Error", "Could not accept the order. Please try again.");
      // If it fails, trigger a refetch to restore the item
      fetchDeliveryRequests();
    }
  };

  // Handle Reject Action
  const handleReject = async (orderId: number) => {
    // Optimistic UI Update: Remove item immediately
    setRequests((prev) => prev.filter((order) => order.id !== orderId));

    try {
      // Replace with your API call to reject/ignore the order locally
      // e.g. await apiClient.post(`/delivery-person/reject/${orderId}`) or just local dismissal
      console.log(`Rejected order ${orderId}`);
    } catch (error) {
      console.error("Failed to reject order", error);
      Alert.alert("Error", "Could not reject the order.");
      fetchDeliveryRequests();
    }
  };

  // Render individual request card
  const renderRequestCard = ({ item }: { item: DeliveryOrder }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderId}>Order #{item.id}</Text>
        <Text style={styles.fee}>₹{item.total}</Text>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>📍 Pickup:</Text>
          <Text style={styles.detailText}>{item.station?.name || "Station"}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>💺 Drop (Seat):</Text>
          <Text style={styles.detailText}>{item.seatNumber}</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleReject(item.id)}
        >
          <Text style={styles.rejectText}>Reject</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleAccept(item.id)}
        >
          <Text style={styles.acceptText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Delivery Requests</Text>

      {isInitialLoading ? (
        <ActivityIndicator size="large" color="#FF5A1F" style={styles.loader} />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRequestCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Data not found</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default DeliveryRequestsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9FB",
  },
  loader: {
    marginTop: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#221813",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0E9E6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5EFEA",
  },
  orderId: {
    fontSize: 16,
    fontWeight: "700",
    color: "#221813",
  },
  fee: {
    fontSize: 18,
    fontWeight: "800",
    color: "#188048",
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#7A6D65",
    width: 90,
    fontWeight: "600",
  },
  detailText: {
    fontSize: 14,
    color: "#312621",
    flex: 1,
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  rejectButton: {
    backgroundColor: "#FFF1ED",
  },
  rejectText: {
    color: "#C62828",
    fontWeight: "700",
    fontSize: 15,
  },
  acceptButton: {
    backgroundColor: "#FF5A1F",
  },
  acceptText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#5C4F48",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#8A7D76",
  },
});
