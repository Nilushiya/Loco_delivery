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
  Modal,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import apiClient from "../../api/client"; // Ensure this path is correct based on your folder structure
import { useFocusEffect } from "@react-navigation/native";
import { BASE_URL } from "../../constants/Config";

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
const ORDERS_ENDPOINT = "/order/get-by-status/HANDED_OVER";

const DeliveryRequestsScreen = () => {
  const [deliveryPersonId, setDeliveryPersonId] = useState<number | null>(null);

  const [requests, setRequests] = useState<DeliveryOrder[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isFetchingRef = useRef(false);
  const [popupOrderId, setPopupOrderId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastPollAt, setLastPollAt] = useState<string | null>(null);
  const [lastStatus, setLastStatus] = useState<number | null>(null);

  // Get IDs from SecureStore on mount
  useEffect(() => {
    const fetchId = async () => {
      try {
        const storedUserId = await SecureStore.getItemAsync('userId');

        if (storedUserId) {
          setDeliveryPersonId(Number(storedUserId));
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

  const fetchDeliveryRequests = useCallback(async () => {
    console.log("fetchDeliveryRequests called");
    // Prevent overlapping network requests
    if (isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    try {
      setErrorMessage(null);
      console.log("Fetching delivery requests with HANDED_OVER status...");
      const response = await apiClient.get(ORDERS_ENDPOINT, { timeout: 10000 });

      if (!response || response.status < 200 || response.status >= 300) {
        throw new Error(`Unexpected response status: ${response?.status ?? "unknown"}`);
      }

      console.log("Fetched delivery requests:", response.data);
      setLastPollAt(new Date().toISOString());
      setLastStatus(response.status);
      
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
          const prevIds = new Set(prevRequests.map((o) => o.id));
          const fetchedIds = new Set(fetchedOrders.map((o) => o.id));

          const newOrders = fetchedOrders.filter((o) => !prevIds.has(o.id));
          const stillValid = prevRequests.filter((o) => fetchedIds.has(o.id));

          if (newOrders.length > 0) {
            // Pop up the newest incoming order
            setPopupOrderId(newOrders[0].id);
          }

          if (newOrders.length === 0 && stillValid.length === prevRequests.length) {
            return prevRequests;
          }

          return [...newOrders, ...stillValid];
        });
      } else {
        setErrorMessage("Unexpected response format.");
      }
    } catch (error) {
      console.error("Failed to fetch delivery requests", error);
      const statusFromError = (error as any)?.response?.status ?? null;
      if (statusFromError) {
        setLastStatus(statusFromError);
      }
      setErrorMessage("Failed to load delivery requests.");
    } finally {
      isFetchingRef.current = false;
      setIsInitialLoading(false);
    }
  }, []);

  // Handle Polling and Application State
  useFocusEffect(
    useCallback(() => {
      console.log("DeliveryRequests screen focused");
      let intervalId: NodeJS.Timeout | null = null;

      const startPolling = () => {
        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(fetchDeliveryRequests, POLLING_INTERVAL_MS) as any;
      };

      // Initial fetch when screen is focused
      fetchDeliveryRequests().finally(() => setIsInitialLoading(false));
      startPolling();

      const subscription = AppState.addEventListener("change", (nextAppState) => {
        if (nextAppState === "active") {
          fetchDeliveryRequests();
          startPolling();
        } else if (intervalId) {
          clearInterval(intervalId);
        }
      });

      return () => {
        if (intervalId) clearInterval(intervalId);
        subscription.remove();
      };
    }, [fetchDeliveryRequests])
  );

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
    setPopupOrderId((prev) => (prev === orderId ? null : prev));

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
    setPopupOrderId((prev) => (prev === orderId ? null : prev));

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

  const currentOrder = popupOrderId
    ? requests.find((o) => o.id === popupOrderId) || null
    : null;

  return (
    <View style={styles.container}>
      {currentOrder && (
        <Modal transparent animationType="slide" visible={!!currentOrder}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>New Delivery Request!</Text>
                <Text style={styles.modalOrderId}>#{currentOrder.id}</Text>
              </View>
              
              <View style={styles.modalSection}>
                <View style={styles.iconBox}>
                  <Ionicons name="person" size={22} color="#FF5A1F" />
                </View>
                <View style={styles.modalTextGroup}>
                  <Text style={styles.modalLabel}>User Details</Text>
                  <Text style={styles.modalValue}>
                    {currentOrder.user?.firstname || 'Unknown User'} {currentOrder.user?.lastname || ''}
                  </Text>
                  {currentOrder.user?.phoneNumber && (
                    <Text style={styles.modalSubValue}>{currentOrder.user.phoneNumber}</Text>
                  )}
                </View>
              </View>

              <View style={styles.modalSection}>
                <View style={[styles.iconBox, { backgroundColor: '#E8F5E9' }]}>
                  <Ionicons name="cash" size={22} color="#188048" />
                </View>
                <View style={styles.modalTextGroup}>
                  <Text style={styles.modalLabel}>Amount to Collect</Text>
                  <Text style={[styles.modalValue, { color: '#188048', fontSize: 26, fontWeight: '800' }]}>
                    ₹{currentOrder.total}
                  </Text>
                </View>
              </View>

              <View style={styles.modalSection}>
                <View style={styles.iconBox}>
                  <Ionicons name="train" size={22} color="#FF5A1F" />
                </View>
                <View style={styles.modalTextGroup}>
                  <Text style={styles.modalLabel}>Seat Details</Text>
                  <Text style={styles.modalValue}>Seat: {currentOrder.seatNumber}</Text>
                  <Text style={styles.modalSubValue}>
                    Train: {currentOrder.train?.trainName || currentOrder.train?.name || currentOrder.train?.trainNo || 'Unknown Train'}
                  </Text>
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalRejectBtn]}
                  onPress={() => handleReject(currentOrder.id)}
                >
                  <Text style={styles.modalRejectText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalAcceptBtn]}
                  onPress={() => handleAccept(currentOrder.id)}
                >
                  <Text style={styles.modalAcceptText}>Accept Order</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      <Text style={styles.title}>New Delivery Requests</Text>
      <View style={styles.debugRow}>
        <Text style={styles.debugText}>API: {BASE_URL}{ORDERS_ENDPOINT}</Text>
      </View>
      <View style={styles.debugRow}>
        <Text style={styles.debugText}>Last poll: {lastPollAt ?? "—"}</Text>
      </View>
      <View style={styles.debugRow}>
        <Text style={styles.debugText}>Last status: {lastStatus ?? "—"}</Text>
      </View>
      {errorMessage ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

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
  errorBanner: {
    backgroundColor: "#FFF1ED",
    borderColor: "#F3C6BA",
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  errorText: {
    color: "#C62828",
    fontSize: 13,
    fontWeight: "600",
  },
  debugRow: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  debugText: {
    fontSize: 12,
    color: "#6B5E57",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E9E6',
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#221813',
  },
  modalOrderId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF5A1F',
    backgroundColor: '#FFF1ED',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  modalSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#FAFAFD',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F5',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF1ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalTextGroup: {
    flex: 1,
  },
  modalLabel: {
    fontSize: 13,
    color: '#7A6D65',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalValue: {
    fontSize: 18,
    color: '#221813',
    fontWeight: '700',
    marginBottom: 2,
  },
  modalSubValue: {
    fontSize: 14,
    color: '#7A6D65',
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalRejectBtn: {
    backgroundColor: '#FFF1ED',
  },
  modalRejectText: {
    color: '#C62828',
    fontWeight: '800',
    fontSize: 16,
  },
  modalAcceptBtn: {
    backgroundColor: '#FF5A1F',
    shadowColor: '#FF5A1F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  modalAcceptText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
});
