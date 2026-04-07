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

    const [trainFilter, setTrainFilter] = useState('');
    const [seatFilter, setSeatFilter] = useState('');
    const [popupOrderId, setPopupOrderId] = useState<string | null>(null);
    const prevOrderIdsRef = useRef<Set<string>>(new Set());
    const didInitRef = useRef(false);
    const dismissedIdsRef = useRef<Set<string>>(new Set());

    const loadOrders = async () => {
        try {
            setStatus('loading');
            const response = await apiClient.get(`/order/get-by-status/HANDED_OVER`);
            
            let fetchedOrders: any[] = [];
            if (response.data && Array.isArray(response.data.orders)) {
                fetchedOrders = response.data.orders;
            } else if (response.data && Array.isArray(response.data.data)) {
                fetchedOrders = response.data.data;
            } else if (Array.isArray(response.data)) {
                fetchedOrders = response.data;
            }
            
            const mappedOrders = fetchedOrders.map((item: any) => ({
                id: item.id?.toString() || 'N/A',
                customerName: item.user ? `${item.user.firstname || ''} ${item.user.lastname || ''}`.trim() : 'Unknown',
                customerPhone: item.user?.phoneNumber || '',
                trainName: item.train?.trainName || item.train?.name || 'Train',
                trainNumber: item.train?.trainNo || item.train?.pin || item.train?.id || '',
                seatNumber: item.seatNumber || '',
                foodItems: Array.isArray(item.items)
                    ? item.items.map((i: any) => ({ name: i.item?.name || i.menuItem?.name || 'Item', quantity: i.quantity || 1 }))
                    : [],
                totalAmount: item.total || 0,
                status: item.status, 
                stationId: item.stationId?.toString() || '',
                trainId: item.trainId,
                stationIdNum: item.stationId,
                raw: item,
            }));

            const visibleOrders = mappedOrders.filter(o => !dismissedIdsRef.current.has(o.id));
            setOrders(visibleOrders);
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
        const currentIds = new Set(orders.map(o => o.id));

        if (didInitRef.current) {
            const newOrders = orders.filter(o => !prevOrderIdsRef.current.has(o.id));
            if (newOrders.length > 0) {
                setPopupOrderId(newOrders[0].id);
            }
        } else {
            didInitRef.current = true;
        }

        prevOrderIdsRef.current = currentIds;
    }, [orders]);

    const filteredOrders = orders.filter(order => {
        const matchTrain = !trainFilter || order.trainNumber?.includes(trainFilter) || order.trainName?.toLowerCase().includes(trainFilter.toLowerCase());
        const matchSeat = !seatFilter || order.seatNumber?.toLowerCase().includes(seatFilter.toLowerCase());
        return matchTrain && matchSeat;
    });

    const acceptOrder = async (order: any) => {
        try {
            const storedUserId = await SecureStore.getItemAsync('userId');
            const deliveryPersonId = storedUserId ? Number(storedUserId) : null;
            if (!deliveryPersonId || !order?.raw) return;

            await apiClient.put('/order/claim-delivery', {
                orderId: order.raw.id,
                deliveryPersonId,
                trainId: order.raw.trainId,
                stationId: order.raw.stationId,
            });

            dismissedIdsRef.current.add(order.id);
            setOrders(prev => prev.filter(o => o.id !== order.id));
            setPopupOrderId(null);
            router.navigate({
                pathname: '/(rider)/activeOrder',
                params: { order: JSON.stringify(order.raw) },
            } as any);
        } catch (error) {
            console.error('Failed to accept order', error);
        }
    };

    const closeOrderCard = (orderId: string) => {
        dismissedIdsRef.current.add(orderId);
        setOrders(prev => prev.filter(o => o.id !== orderId));
        if (popupOrderId === orderId) setPopupOrderId(null);
    };

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

    if (status === 'loading' && orders.length === 0) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#FF5A1F" />
            </View>
        );
    }

    const popupOrder = popupOrderId ? orders.find(o => o.id === popupOrderId) : null;
    const popupOrderRaw = popupOrder?.raw || null;

    return (
        <View style={styles.container}>
            {popupOrder && (
                <Modal transparent animationType="slide" visible={!!popupOrder}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>New Delivery Request</Text>
                                <Text style={styles.modalOrderId}>#{popupOrder.id}</Text>
                            </View>

                            <View style={styles.modalSection}>
                                <View style={styles.modalIconBox}>
                                    <Ionicons name="person" size={20} color="#FF5A1F" />
                                </View>
                                <View style={styles.modalTextGroup}>
                                    <Text style={styles.modalLabel}>Customer</Text>
                                    <Text style={styles.modalValue}>{popupOrder.customerName || "Customer"}</Text>
                                    {popupOrder.customerPhone ? (
                                        <Text style={styles.modalSubValue}>{popupOrder.customerPhone}</Text>
                                    ) : null}
                                </View>
                            </View>

                            <View style={styles.modalSection}>
                                <View style={styles.modalIconBox}>
                                    <Ionicons name="train" size={20} color="#FF5A1F" />
                                </View>
                                <View style={styles.modalTextGroup}>
                                    <Text style={styles.modalLabel}>Train & Seat</Text>
                                    <Text style={styles.modalValue}>
                                        {popupOrder.trainNumber} - {popupOrder.trainName}
                                    </Text>
                                    <Text style={styles.modalSubValue}>Seat: {popupOrder.seatNumber}</Text>
                                </View>
                            </View>

                            <View style={styles.modalSection}>
                                <View style={[styles.modalIconBox, styles.modalCashBox]}>
                                    <Ionicons name="cash" size={20} color="#188048" />
                                </View>
                                <View style={styles.modalTextGroup}>
                                    <Text style={styles.modalLabel}>Amount to Collect</Text>
                                    <Text style={[styles.modalValue, styles.modalAmount]}>
                                        Rs. {popupOrder.totalAmount}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={[styles.modalBtn, styles.modalDismissBtn]}
                                    onPress={() => setPopupOrderId(null)}
                                >
                                    <Text style={styles.modalDismissText}>Reject</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalBtn, styles.modalViewBtn]}
                                    onPress={() => {
                                        acceptOrder({ ...popupOrder, raw: popupOrderRaw });
                                    }}
                                >
                                    <Text style={styles.modalViewText}>Accept</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
            {renderHeader()}
            {renderFilters()}

            <FlatList
                data={filteredOrders}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={styles.cardWrap}>
                        <OrderCard
                            order={item}
                            onPress={() => router.navigate('/(rider)/orderDetails' as any)}
                        />
                        <View style={styles.cardActions}>
                            <TouchableOpacity
                                style={[styles.cardBtn, styles.cardCloseBtn]}
                                onPress={() => closeOrderCard(item.id)}
                            >
                                <Text style={styles.cardCloseText}>Close</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.cardBtn, styles.cardAcceptBtn]}
                                onPress={() => acceptOrder(item)}
                            >
                                <Text style={styles.cardAcceptText}>Accept</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                refreshControl={
                    <RefreshControl refreshing={status === 'loading'} onRefresh={loadOrders} />
                }
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconWrap}>
                            <Ionicons name="bicycle-outline" size={44} color="#FF5A1F" />
                        </View>
                        <Text style={styles.emptyTitle}>No new orders yet</Text>
                        <Text style={styles.emptySubtitle}>
                            We’ll show new delivery requests here as soon as they’re handed over.
                        </Text>
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
    listContainer: {
        paddingBottom: 24,
        paddingTop: 8,
    },
    cardWrap: {
        marginBottom: 8,
    },
    cardActions: {
        flexDirection: 'row',
        gap: 10,
        marginHorizontal: 16,
        marginTop: -4,
        marginBottom: 8,
    },
    cardBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardCloseBtn: {
        backgroundColor: '#FFF1ED',
    },
    cardCloseText: {
        color: '#C62828',
        fontWeight: '700',
    },
    cardAcceptBtn: {
        backgroundColor: '#FF5A1F',
    },
    cardAcceptText: {
        color: '#FFF',
        fontWeight: '800',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
        paddingHorizontal: 24,
    },
    emptyIconWrap: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#FFF1ED',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#221813',
        marginBottom: 6,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#7A6D65',
        textAlign: 'center',
        lineHeight: 20,
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
    modalSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
        backgroundColor: '#FAFAFD',
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#F0F0F5',
    },
    modalIconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFF1ED',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    modalCashBox: {
        backgroundColor: '#E8F5E9',
    },
    modalTextGroup: {
        flex: 1,
    },
    modalLabel: {
        fontSize: 12,
        color: '#7A6D65',
        textTransform: 'uppercase',
        fontWeight: '700',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    modalValue: {
        fontSize: 16,
        color: '#221813',
        fontWeight: '700',
    },
    modalSubValue: {
        fontSize: 13,
        color: '#7A6D65',
        fontWeight: '500',
        marginTop: 2,
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
