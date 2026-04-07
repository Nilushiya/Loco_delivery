import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import apiClient from '../../api/client';
import { OrderCard } from '../../components/OrderCard';

export const Dashboard = () => {
    const router = useRouter();

    const [orders, setOrders] = useState<any[]>([]);
    const [status, setStatus] = useState<'idle' | 'loading' | 'succeeded' | 'failed'>('idle');
    const [assignedStation, setAssignedStation] = useState('Loading...');

    const [activeTab, setActiveTab] = useState<'Pending' | 'Delivered'>('Pending');
    const [trainFilter, setTrainFilter] = useState('');
    const [seatFilter, setSeatFilter] = useState('');
    const [popupOrderId, setPopupOrderId] = useState<string | null>(null);
    const prevOrderIdsRef = useRef<Set<string>>(new Set());
    const didInitRef = useRef(false);

    const loadOrders = async () => {
        try {
            setStatus('loading');
            const deliveryPersonId = await SecureStore.getItemAsync('userId');
            if (!deliveryPersonId) {
                setStatus('failed');
                return;
            }
            
            const response = await apiClient.get(`/order/delivery/get?deliveryPersonId=${deliveryPersonId}`);
            
            let fetchedOrders: any[] = [];
            if (response.data && Array.isArray(response.data.orders)) {
                fetchedOrders = response.data.orders;
            } else if (response.data && Array.isArray(response.data.data)) {
                fetchedOrders = response.data.data;
            }
            
            const mappedOrders = fetchedOrders.map((item: any) => ({
                id: item.id?.toString() || 'N/A',
                customerName: item.user ? `${item.user.firstname || ''} ${item.user.lastname || ''}`.trim() : 'Unknown',
                customerPhone: item.user?.phoneNumber || '',
                trainName: item.train?.trainName || item.train?.name || 'Train',
                trainNumber: item.train?.trainNo || item.train?.id || '',
                seatNumber: item.seatNumber || '',
                foodItems: Array.isArray(item.items) ? item.items.map((i: any) => ({ name: i.menuItem?.name || 'Item', quantity: i.quantity || 1 })) : [],
                totalAmount: item.total || 0,
                status: item.status, 
                stationId: item.stationId?.toString() || ''
            }));
            
            setOrders(mappedOrders);
            setStatus('succeeded');
            
            if (fetchedOrders.length > 0 && fetchedOrders[0].station) {
               setAssignedStation(fetchedOrders[0].station.name);
            } else {
               setAssignedStation('No Station');
            }
        } catch (error) {
            console.error('Failed to load orders', error);
            setStatus('failed');
        }
    };

    useEffect(() => {
        loadOrders();
        // Simulate real-time updates with polling every 30 seconds
        const intervalId = setInterval(() => {
            loadOrders();
        }, 30000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const pendingOrders = orders.filter(o => o.status === 'OUT_FOR_DELIVERY');
        const pendingIds = new Set(pendingOrders.map(o => o.id));

        if (didInitRef.current) {
            const newOrders = pendingOrders.filter(o => !prevOrderIdsRef.current.has(o.id));
            if (newOrders.length > 0) {
                setPopupOrderId(newOrders[0].id);
            }
        } else {
            didInitRef.current = true;
        }

        prevOrderIdsRef.current = pendingIds;
    }, [orders]);

    const filteredOrders = orders.filter(order => {
        const expectedStatus = activeTab === 'Pending' ? 'OUT_FOR_DELIVERY' : 'DELIVERED';
        const matchTab = order.status === expectedStatus;
        const matchTrain = !trainFilter || order.trainNumber?.includes(trainFilter) || order.trainName?.toLowerCase().includes(trainFilter.toLowerCase());
        const matchSeat = !seatFilter || order.seatNumber?.toLowerCase().includes(seatFilter.toLowerCase());
        return matchTab && matchTrain && matchSeat;
    });

    const renderHeader = () => (
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Rider Dashboard</Text>
            <View style={styles.stationContainer}>
                <Ionicons name="location-outline" size={16} color="#FF5A1F" />
                <Text style={styles.stationText}>Station: {assignedStation}</Text>
            </View>
        </View>
    );

    const renderFilters = () => (
        <View style={styles.filterContainer}>
            <View style={styles.inputContainer}>
                <Ionicons name="train-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Train No / Name"
                    value={trainFilter}
                    onChangeText={setTrainFilter}
                    placeholderTextColor="#999"
                />
            </View>
            <View style={styles.inputContainer}>
                <Ionicons name="apps-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Seat No"
                    value={seatFilter}
                    onChangeText={setSeatFilter}
                    placeholderTextColor="#999"
                />
            </View>
        </View>
    );

    const renderTabs = () => (
        <View style={styles.tabsContainer}>
            <TouchableOpacity
                style={[styles.tab, activeTab === 'Pending' && styles.activeTab]}
                onPress={() => setActiveTab('Pending')}
            >
                <Text style={[styles.tabText, activeTab === 'Pending' && styles.activeTabText]}>Pending</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.tab, activeTab === 'Delivered' && styles.activeTab]}
                onPress={() => setActiveTab('Delivered')}
            >
                <Text style={[styles.tabText, activeTab === 'Delivered' && styles.activeTabText]}>Delivered</Text>
            </TouchableOpacity>
        </View>
    );

    if (status === 'loading' && orders.length === 0) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#FF5A1F" />
            </View>
        );
    }

    const popupOrder = popupOrderId ? orders.find(o => o.id === popupOrderId) : null;

    return (
        <View style={styles.container}>
            {popupOrder && (
                <Modal transparent animationType="slide" visible={!!popupOrder}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>New Order</Text>
                                <Text style={styles.modalOrderId}>{popupOrder.id}</Text>
                            </View>

                            <View style={styles.modalRow}>
                                <Ionicons name="train-outline" size={18} color="#FF5A1F" />
                                <Text style={styles.modalText}>
                                    {popupOrder.trainNumber} - {popupOrder.trainName}
                                </Text>
                            </View>
                            <View style={styles.modalRow}>
                                <Ionicons name="apps-outline" size={18} color="#FF5A1F" />
                                <Text style={styles.modalText}>Seat: {popupOrder.seatNumber}</Text>
                            </View>
                            <View style={styles.modalRow}>
                                <Ionicons name="cash-outline" size={18} color="#188048" />
                                <Text style={[styles.modalText, styles.modalAmount]}>
                                    Rs. {popupOrder.totalAmount}
                                </Text>
                            </View>

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={[styles.modalBtn, styles.modalDismissBtn]}
                                    onPress={() => setPopupOrderId(null)}
                                >
                                    <Text style={styles.modalDismissText}>Dismiss</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalBtn, styles.modalViewBtn]}
                                    onPress={() => {
                                        setPopupOrderId(null);
                                        router.navigate({
                                            pathname: '/(rider)/orderDetails',
                                            params: { id: popupOrder.id },
                                        } as any);
                                    }}
                                >
                                    <Text style={styles.modalViewText}>View Order</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
            {renderHeader()}
            {renderFilters()}
            {renderTabs()}

            <FlatList
                data={filteredOrders}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <OrderCard
                        order={item}
                        onPress={() => router.navigate('/(rider)/orderDetails' as any)}
                    />
                )}
                refreshControl={
                    <RefreshControl refreshing={status === 'loading'} onRefresh={loadOrders} />
                }
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="documents-outline" size={64} color="#DDD" />
                        <Text style={styles.emptyText}>No {activeTab.toLowerCase()} orders found.</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: '#FFF',
        padding: 20,
        paddingTop: 50, // for safe area
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    stationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEEDE6',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    stationText: {
        marginLeft: 6,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FF5A1F',
    },
    filterContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#FFF',
        gap: 12,
    },
    inputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 40,
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: '#333',
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    tab: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#FF5A1F',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#888',
    },
    activeTabText: {
        color: '#FF5A1F',
    },
    listContainer: {
        paddingBottom: 24,
        paddingTop: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#999',
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
        padding: 20,
        paddingBottom: 30,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: -4 },
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#221813',
    },
    modalOrderId: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FF5A1F',
        backgroundColor: '#FFF1ED',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    modalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    modalText: {
        marginLeft: 8,
        fontSize: 15,
        color: '#312621',
        fontWeight: '600',
    },
    modalAmount: {
        color: '#188048',
        fontWeight: '800',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 14,
    },
    modalBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalDismissBtn: {
        backgroundColor: '#FFF1ED',
    },
    modalDismissText: {
        color: '#C62828',
        fontWeight: '700',
    },
    modalViewBtn: {
        backgroundColor: '#FF5A1F',
    },
    modalViewText: {
        color: '#FFF',
        fontWeight: '800',
    },
});
