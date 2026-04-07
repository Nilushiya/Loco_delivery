import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function RiderLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#FF5A1F',
                tabBarInactiveTintColor: '#8A7D76',
                tabBarStyle: { backgroundColor: '#FFF', borderTopColor: '#EEE' },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="grid-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="deliveryRequests"
                options={{
                    title: 'Orders',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="receipt-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="orderDetails"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="activeOrder"
                options={{
                    href: null,
                }}
            />
        </Tabs>
    );
}
