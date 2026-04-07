import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import apiClient from "../../api/client";

type ActiveOrder = {
  id: number;
  seatNumber: string;
  total: number;
  items: { quantity?: number; menuItem?: { name?: string }; name?: string }[];
  user?: { firstname?: string; lastname?: string; phoneNumber?: string };
  station?: { name?: string };
  train?: { trainName?: string; name?: string; trainNo?: string };
  restaurant?: { name?: string };
  restaurantName?: string;
};

const SwipeToDeliver = ({ onDelivered }: { onDelivered: () => void }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const widthRef = useRef(0);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 5,
        onPanResponderMove: (_, gesture) => {
          const clamped = Math.max(0, Math.min(gesture.dx, widthRef.current - 64));
          translateX.setValue(clamped);
        },
        onPanResponderRelease: (_, gesture) => {
          const threshold = (widthRef.current - 64) * 0.7;
          if (gesture.dx >= threshold) {
            Animated.timing(translateX, {
              toValue: widthRef.current - 64,
              duration: 150,
              useNativeDriver: true,
            }).start(() => onDelivered());
          } else {
            Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
          }
        },
      }),
    [onDelivered, translateX]
  );

  return (
    <View
      style={styles.swipeContainer}
      onLayout={(e) => {
        widthRef.current = e.nativeEvent.layout.width;
      }}
    >
      <Text style={styles.swipeText}>Swipe to Deliver</Text>
      <Animated.View
        style={[styles.swipeThumb, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <Ionicons name="arrow-forward" size={22} color="#FFF" />
      </Animated.View>
    </View>
  );
};

export default function ActiveOrderScreen() {
  const router = useRouter();
  const { order } = useLocalSearchParams<{ order?: string }>();
  const [isDelivering, setIsDelivering] = useState(false);

  const parsedOrder: ActiveOrder | null = useMemo(() => {
    if (!order || typeof order !== "string") return null;
    try {
      return JSON.parse(order) as ActiveOrder;
    } catch {
      return null;
    }
  }, [order]);

  if (!parsedOrder) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Order details not found.</Text>
      </View>
    );
  }

  const customerName = `${parsedOrder.user?.firstname || ""} ${parsedOrder.user?.lastname || ""}`.trim() || "Customer";
  const trainName = parsedOrder.train?.trainName || parsedOrder.train?.name || parsedOrder.train?.trainNo || "Train";
  const shopName = parsedOrder.restaurant?.name || parsedOrder.restaurantName || "Restaurant";

  const handleDeliver = async () => {
    if (isDelivering) return;
    setIsDelivering(true);
    try {
      const storedId = await SecureStore.getItemAsync("userId");
      const deliveryPersonId = storedId ? Number(storedId) : null;
      if (!deliveryPersonId) {
        Alert.alert("Error", "Delivery person ID not found.");
        return;
      }

      await apiClient.put(`/order/delivery/${parsedOrder.id}`, {
        deliveryPersonId,
      });

      Alert.alert("Delivered", "Order marked as delivered.");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to mark order as delivered.");
    } finally {
      setIsDelivering(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Active Order</Text>
        <Text style={styles.orderId}>#{parsedOrder.id}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Customer</Text>
        <View style={styles.row}>
          <Ionicons name="person" size={18} color="#666" />
          <Text style={styles.rowText}>{customerName}</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="call" size={18} color="#666" />
          <Text style={styles.rowText}>{parsedOrder.user?.phoneNumber || "—"}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Delivery</Text>
        <View style={styles.row}>
          <Ionicons name="location" size={18} color="#FF5A1F" />
          <Text style={styles.rowText}>{parsedOrder.station?.name || "Pickup Station"}</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="train" size={18} color="#FF5A1F" />
          <Text style={styles.rowText}>{trainName}</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="apps" size={18} color="#FF5A1F" />
          <Text style={styles.rowText}>Seat {parsedOrder.seatNumber}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        {(parsedOrder.items || []).map((item, idx) => {
          const qty = item.quantity ?? 1;
          const name = item.menuItem?.name || item.name || "Item";
          return (
            <View key={idx} style={styles.itemRow}>
              <Text style={styles.itemQty}>{qty}x</Text>
              <Text style={styles.itemName}>{name}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.rowBetween}>
          <Text style={styles.rowLabel}>Shop</Text>
          <Text style={styles.rowValue}>{shopName}</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.rowLabel}>Total</Text>
          <Text style={styles.rowValue}>Rs. {parsedOrder.total}</Text>
        </View>
      </View>

      <SwipeToDeliver onDelivered={handleDeliver} />
    </ScrollView>
  );
}

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
  errorText: {
    color: "#C62828",
    fontWeight: "700",
  },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#221813",
  },
  orderId: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "700",
    color: "#FF5A1F",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#F0E9E6",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#221813",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  rowText: {
    marginLeft: 10,
    fontSize: 15,
    color: "#312621",
    fontWeight: "600",
  },
  itemRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  itemQty: {
    width: 28,
    fontWeight: "700",
    color: "#FF5A1F",
  },
  itemName: {
    fontSize: 15,
    color: "#312621",
    fontWeight: "600",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  rowLabel: {
    color: "#7A6D65",
    fontWeight: "600",
  },
  rowValue: {
    color: "#221813",
    fontWeight: "700",
  },
  swipeContainer: {
    margin: 16,
    backgroundColor: "#FFF1ED",
    borderRadius: 16,
    height: 56,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F3C6BA",
    overflow: "hidden",
  },
  swipeText: {
    textAlign: "center",
    color: "#C62828",
    fontWeight: "700",
  },
  swipeThumb: {
    position: "absolute",
    left: 0,
    width: 56,
    height: 56,
    backgroundColor: "#FF5A1F",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
