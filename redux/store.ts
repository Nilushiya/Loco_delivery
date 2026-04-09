import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import orderReducer from "./slices/orderSlice";
import restaurantRegistrationReducer from "./slices/restaurantRegistrationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    orders: orderReducer,
    restaurantRegistration: restaurantRegistrationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
