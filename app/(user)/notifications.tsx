import { View, Text, StyleSheet } from 'react-native';

export default function Alerts() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to your Alerts</Text>
      <Text>Your role-specific content goes here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold' }
});