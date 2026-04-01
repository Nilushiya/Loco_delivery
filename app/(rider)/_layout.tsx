import { Stack } from 'expo-router';

export default function RiderLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ title: 'Dashboard' }} />
            <Stack.Screen name="orderDetails" options={{ title: 'Order Details' }} />
        </Stack>
    );
}
