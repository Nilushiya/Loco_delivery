import { StyleSheet, Text, View } from "react-native";

export default function RiderProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Delivery person profile screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9FB",
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#221813",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#7A6D65",
  },
});
