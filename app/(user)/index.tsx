import { StyleSheet } from 'react-native';
import { ThemedText, ThemedView } from '../../components/Themed';

export default function Dashboard() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Dashboard</ThemedText>
      
      {/* This text uses global theme by default */}
      <ThemedText>Welcome to your app!</ThemedText>
      
      {/* This text uses a custom color ONLY for this instance */}
      <ThemedText lightColor="blue" darkColor="lightblue">
        I am blue in light mode and lightblue in dark mode.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});