import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import restaurantRegistrationReducer from "./slices/restaurantRegistrationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    restaurantRegistration: restaurantRegistrationReducer,
  },
});
