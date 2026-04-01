import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Order, OrderService } from '../../services/api';

interface OrderState {
    orders: Order[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    assignedStation: string;
}

const initialState: OrderState = {
    orders: [],
    status: 'idle',
    error: null,
    assignedStation: 'ST-001' // Mock assigned station for rider
};

// Async thunks
export const fetchOrders = createAsyncThunk(
    'orders/fetchOrders',
    async (stationId: string) => {
        const response = await OrderService.getOrders(stationId);
        return response.data;
    }
);

export const deliverOrder = createAsyncThunk(
    'orders/deliverOrder',
    async (orderId: string) => {
        const response = await OrderService.deliverOrder(orderId);
        return response.data.order;
    }
);

const orderSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrders.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchOrders.fulfilled, (state, action: PayloadAction<Order[]>) => {
                state.status = 'succeeded';
                state.orders = action.payload;
            })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Failed to fetch orders';
            })
            .addCase(deliverOrder.fulfilled, (state, action: PayloadAction<Order>) => {
                const index = state.orders.findIndex(order => order.id === action.payload.id);
                if (index !== -1) {
                    state.orders[index] = action.payload;
                }
            });
    },
});

export default orderSlice.reducer;
