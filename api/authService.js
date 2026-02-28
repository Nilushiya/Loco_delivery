import apiClient from './client';
import { ENDPOINTS } from '../constants/Config';
import { startLoading, authSuccess, authFailure } from '../redux/slices/authSlice';
import * as SecureStore from 'expo-secure-store';

const authService = {
  // LOGIN ACTION
  login: (email, password) => async (dispatch) => {
    dispatch(startLoading()); 
    
    try {
      const response = await apiClient.post(ENDPOINTS.LOGIN, { email, password });
      
      const { token, role } = response.data;

      // Save to Secure Storage so the session persists
      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.setItemAsync('userRole', role);

      //  Update Redux state
      dispatch(authSuccess({ token, role }));
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed. Please try again.';
      dispatch(authFailure(errorMsg));
    }
  },

  // SIGNUP ACTION
  signup: (userData) => async (dispatch) => {
    dispatch(startLoading());
    
    try {
      const response = await apiClient.post(ENDPOINTS.SIGNUP, userData);
      const { token, role } = response.data;

      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.setItemAsync('userRole', role);

      dispatch(authSuccess({ token, role }));
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Signup failed.';
      dispatch(authFailure(errorMsg));
    }
  },
};

export default authService;