export interface Order {
    id: string;
    customerName: string;
    customerPhone: string;
    trainName: string;
    trainNumber: string;
    seatNumber: string;
    coachNumber?: string;
    foodItems: { name: string; quantity: number }[];
    totalAmount: number;
    status: 'Pending' | 'Delivered';
    specialInstructions?: string;
    stationId: string;
}

const MOCK_ORDERS: Order[] = [
    {
        id: "ORD-1234",
        customerName: "John Doe",
        customerPhone: "0771234567",
        trainName: "Udarata Menike",
        trainNumber: "1015",
        seatNumber: "A-12",
        coachNumber: "C1",
        foodItems: [
            { name: "Rice & Curry", quantity: 1 },
            { name: "Coca Cola", quantity: 1 }
        ],
        totalAmount: 1250,
        status: "Pending",
        specialInstructions: "Extra spicy for the curry and cold drink.",
        stationId: "ST-001"
    },
    {
        id: "ORD-1235",
        customerName: "Jane Smith",
        customerPhone: "0712345678",
        trainName: "Yal Devi",
        trainNumber: "4077",
        seatNumber: "B-24",
        coachNumber: "C2",
        foodItems: [
            { name: "Chicken Kottu", quantity: 1 }
        ],
        totalAmount: 850,
        status: "Delivered",
        specialInstructions: "",
        stationId: "ST-001"
    },
    {
        id: "ORD-1236",
        customerName: "Kamal Perera",
        customerPhone: "0723456789",
        trainName: "Udarata Menike",
        trainNumber: "1015",
        seatNumber: "C-05",
        coachNumber: "C3",
        foodItems: [
            { name: "Vegetable Fried Rice", quantity: 2 }
        ],
        totalAmount: 1600,
        status: "Pending",
        specialInstructions: "No onions, please.",
        stationId: "ST-001"
    }
];

export const OrderService = {
    getOrders: async (stationId: string): Promise<{ data: Order[] }> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Deep clone to prevent mutation of mock database
                const orders = JSON.parse(JSON.stringify(MOCK_ORDERS.filter(o => o.stationId === stationId)));
                resolve({ data: orders });
            }, 500);
        });
    },
    deliverOrder: async (orderId: string): Promise<{ data: { message: string, order: Order } }> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const orderIndex = MOCK_ORDERS.findIndex(o => o.id === orderId);
                if (orderIndex !== -1) {
                    MOCK_ORDERS[orderIndex].status = "Delivered";
                    resolve({ data: { message: "Success", order: MOCK_ORDERS[orderIndex] } });
                } else {
                    reject(new Error("Order not found"));
                }
            }, 500);
        });
    },
    getOrderById: async (orderId: string): Promise<{ data: Order }> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const order = MOCK_ORDERS.find(o => o.id === orderId);
                if (order) {
                    resolve({ data: JSON.parse(JSON.stringify(order)) });
                } else {
                    reject(new Error("Order not found"));
                }
            }, 500);
        });
    }
};
