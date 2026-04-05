import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  restaurant: null,
  isSubmitting: false,
  successMessage: "",
  error: null,
};

const restaurantRegistrationSlice = createSlice({
  name: "restaurantRegistration",
  initialState,
  reducers: {
    registrationStart: (state) => {
      state.isSubmitting = true;
      state.error = null;
      state.successMessage = "";
    },
    registrationSuccess: (state, action) => {
      state.isSubmitting = false;
      state.restaurant = action.payload;
      state.successMessage = "Restaurant registered successfully.";
      state.error = null;
    },
    registrationFailure: (state, action) => {
      state.isSubmitting = false;
      state.error = action.payload;
      state.successMessage = "";
    },
    resetRegistrationState: () => initialState,
  },
});

export const {
  registrationStart,
  registrationSuccess,
  registrationFailure,
  resetRegistrationState,
} = restaurantRegistrationSlice.actions;

export default restaurantRegistrationSlice.reducer;
