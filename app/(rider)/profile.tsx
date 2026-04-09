import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import apiClient from "../../api/client";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";

export default function RiderProfileScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedUserId = await SecureStore.getItemAsync("userId");
        const deliveryPersonId = storedUserId ? Number(storedUserId) : null;
        const id = deliveryPersonId ?? 2;

        const response = await apiClient.get(`/delivery-person/${id}`);
        const data = response?.data?.data ?? response?.data;
        setProfile(data || null);
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF5A1F" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.subtitle}>Profile not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {profile.image ? (
          <Image source={{ uri: profile.image }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {(profile.firstname?.[0] || "D").toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.headerText}>
          <Text style={styles.name}>
            {profile.firstname || ""} {profile.lastname || ""}
          </Text>
          <Text style={styles.email}>{profile.email || "—"}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Phone</Text>
        <Text style={styles.value}>{profile.phoneNumber || "—"}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Verified</Text>
        <Text style={styles.value}>
          {profile.isVerified ? "Yes" : "No"}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Created At</Text>
        <Text style={styles.value}>{new Date(profile.createdAt).toLocaleDateString() || "—"}</Text>
      </View>

      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={async () => {
          try {
            await SecureStore.deleteItemAsync("userToken");
            await SecureStore.deleteItemAsync("userId");
            await SecureStore.deleteItemAsync("userRole");
            router.replace("/(auth)/login");
          } catch (error) {
            console.error("Failed to clear storage", error);
          }
        }}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9FB",
    paddingTop: 50,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerText: {
    marginLeft: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#221813",
    marginBottom: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: "800",
    color: "#221813",
  },
  email: {
    fontSize: 13,
    color: "#7A6D65",
    marginTop: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#7A6D65",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#EEE",
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FFF1ED",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FF5A1F",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#F0E9E6",
  },
  label: {
    fontSize: 12,
    color: "#7A6D65",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  value: {
    fontSize: 16,
    color: "#221813",
    fontWeight: "700",
  },
  logoutBtn: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: "#FFF1ED",
    borderColor: "#F3C6BA",
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutText: {
    color: "#C62828",
    fontWeight: "800",
    fontSize: 16,
  },
});
