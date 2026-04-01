import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Order } from '../services/api';

interface OrderCardProps {
    order: Order;
    onPress: () => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onPress }) => {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.header}>
                <Text style={styles.orderId}>{order.id}</Text>
                <View style={[styles.statusBadge, order.status === 'Delivered' ? styles.deliveredBadge : styles.pendingBadge]}>
                    <Text style={styles.statusText}>{order.status}</Text>
                </View>
            </View>

            <View style={styles.row}>
                <Ionicons name="person-outline" size={16} color="#555" />
                <Text style={styles.customerText}>{order.customerName} ({order.customerPhone})</Text>
            </View>

            <View style={styles.trainInfoContainer}>
                <View style={styles.trainRow}>
                    <Ionicons name="train-outline" size={18} color="#FF5A1F" />
                    <Text style={styles.trainText}>{order.trainName} • {order.trainNumber}</Text>
                </View>

                <View style={styles.seatContainer}>
                    <Text style={styles.seatLabel}>SEAT</Text>
                    <Text style={styles.seatNumber}>{order.seatNumber}</Text>
                </View>
            </View>

            {order.coachNumber && (
                <Text style={styles.coachText}>Coach: {order.coachNumber}</Text>
            )}

            <View style={styles.itemsContainer}>
                <Text style={styles.itemsLabel}>Items:</Text>
                <Text style={styles.itemsText} numberOfLines={1}>
                    {order.foodItems.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                </Text>
            </View>

            <View style={styles.footer}>
                <Text style={styles.amountLabel}>Total</Text>
                <Text style={styles.amountValue}>Rs. {order.totalAmount}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        marginHorizontal: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderLeftWidth: 4,
        borderLeftColor: '#FF5A1F',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    orderId: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#888',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    pendingBadge: {
        backgroundColor: '#FFF3E0',
    },
    deliveredBadge: {
        backgroundColor: '#E8F5E9',
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    customerText: {
        marginLeft: 8,
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
    },
    trainInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FEEDE6',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    trainRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    trainText: {
        marginLeft: 8,
        fontSize: 15,
        fontWeight: '600',
        color: '#FF5A1F',
        flexShrink: 1,
    },
    seatContainer: {
        alignItems: 'center',
        backgroundColor: '#FF5A1F',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        marginLeft: 8,
    },
    seatLabel: {
        fontSize: 10,
        color: '#FFF',
        fontWeight: 'bold',
    },
    seatNumber: {
        fontSize: 18,
        color: '#FFF',
        fontWeight: '900',
    },
    coachText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
        marginBottom: 8,
    },
    itemsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    itemsLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
        marginRight: 4,
    },
    itemsText: {
        fontSize: 14,
        color: '#444',
        flex: 1,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        paddingTop: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    amountLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: 'bold',
    },
    amountValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2E7D32',
    },
});
