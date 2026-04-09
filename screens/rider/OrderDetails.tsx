import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { deliverOrder } from "../../redux/slices/orderSlice";
import { AppDispatch } from "../../redux/store";

export const OrderDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const order = useSelector((state: any) =>
    state.orders.orders.find((o: any) => o.id === id),
  );

  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    if (!order) {
      Alert.alert("Error", "Order not found", [
        { text: "OK", onPress: () => router.back() },
      ]);
    }
  }, [order]);

  if (!order) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF5A1F" />
      </View>
    );
  }

  const handleDeliver = async () => {
    setLoading(true);
    try {
      await dispatch(deliverOrder(order.id)).unwrap();
      Alert.alert("Success", "Order marked as delivered!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to deliver order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
      </View>

      <View style={styles.content}>
        {/* Order Info */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.orderId}>{order.id}</Text>
            <View
              style={[
                styles.statusBadge,
                order.status === "Delivered"
                  ? styles.deliveredBadge
                  : styles.pendingBadge,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  order.status === "Delivered"
                    ? styles.deliveredText
                    : styles.pendingText,
                ]}
              >
                {order.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Train & Seat Info */}
        <View style={[styles.card, styles.highlightCard]}>
          <Text style={styles.sectionTitle}>Delivery Location</Text>
          <View style={styles.trainRow}>
            <Ionicons name="train" size={24} color="#FF5A1F" />
            <Text style={styles.trainNumber}>
              {order.trainNumber} - {order.trainName}
            </Text>
          </View>

          <View style={styles.seatContainerBox}>
            <View style={styles.seatBox}>
              <Text style={styles.seatLabel}>SEAT NO</Text>
              <Text style={styles.seatNumberBig}>{order.seatNumber}</Text>
            </View>
            {order.coachNumber && (
              <View style={styles.coachBox}>
                <Text style={styles.coachLabel}>COACH</Text>
                <Text style={styles.coachNumberBig}>{order.coachNumber}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Customer Info</Text>
          <View style={styles.iconRow}>
            <Ionicons name="person" size={20} color="#666" />
            <Text style={styles.infoText}>{order.customerName}</Text>
          </View>
          <View style={styles.iconRow}>
            <Ionicons name="call" size={20} color="#666" />
            <Text style={styles.infoText}>{order.customerPhone}</Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.foodItems.map((item: any, index: number) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemQuantity}>{item.quantity}x</Text>
              <Text style={styles.itemName}>{item.name}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>Rs. {order.totalAmount}</Text>
          </View>
        </View>

        {/* Special Instructions */}
        {order.specialInstructions ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Special Instructions</Text>
            <Text style={styles.instructionsText}>
              {order.specialInstructions}
            </Text>
          </View>
        ) : null}

        {/* Delivery Button */}
        {order.status === "Pending" && (
          <TouchableOpacity
            style={styles.deliverButton}
            onPress={handleDeliver}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color="#FFF"
                  style={styles.buttonIcon}
                />
                <Text style={styles.deliverButtonText}>Mark as Delivered</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  highlightCard: {
    backgroundColor: "#FFF2EC",
    borderWidth: 1,
    borderColor: "#FFD8C9",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pendingBadge: {
    backgroundColor: "#FFF3E0",
  },
  deliveredBadge: {
    backgroundColor: "#E8F5E9",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  pendingText: {
    color: "#E65100",
  },
  deliveredText: {
    color: "#2E7D32",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  trainRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  trainNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF5A1F",
    marginLeft: 10,
  },
  seatContainerBox: {
    flexDirection: "row",
    gap: 16,
  },
  seatBox: {
    flex: 1,
    backgroundColor: "#FF5A1F",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  coachBox: {
    flex: 1,
    backgroundColor: "#FFA17A",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  seatLabel: {
    color: "#FFEAE0",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  coachLabel: {
    color: "#FFEAE0",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  seatNumberBig: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "900",
  },
  coachNumberBig: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "900",
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: "#444",
    marginLeft: 12,
    fontWeight: "500",
  },
  itemRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  itemQuantity: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF5A1F",
    width: 30,
  },
  itemName: {
    fontSize: 16,
    color: "#444",
    flex: 1,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  instructionsText: {
    fontSize: 15,
    fontStyle: "italic",
    color: "#666",
    lineHeight: 22,
  },
  deliverButton: {
    backgroundColor: "#FF5A1F",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 10,
    elevation: 3,
    shadowColor: "#FF5A1F",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
  },
  buttonIcon: {
    marginRight: 8,
  },
  deliverButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
