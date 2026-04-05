import * as SecureStore from 'expo-secure-store';
import { ENDPOINTS } from '../constants/Config';
import { authFailure, authSuccess, startLoading } from '../redux/slices/authSlice';
import apiClient from './client';

const decodeBase64Url = (value) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');

  if (typeof globalThis.atob === 'function') {
    return globalThis.atob(padded);
  }

  throw new Error('Base64 decoding is not available in this environment.');
};

const decodeJwtPayload = (token) => {
  const parts = token?.split('.');

  if (!parts || parts.length < 2) {
    throw new Error('Invalid token format.');
  }

  const decodedPayload = decodeBase64Url(parts[1]);
  return JSON.parse(decodedPayload);
};

const authService = {
  // LOGIN ACTION
  login: (email, password) => async (dispatch) => {
    dispatch(startLoading());

    try {
      const response = await apiClient.post(ENDPOINTS.RESTAURANT_LOGIN, { email, password });
      console.log("Login successful:", response.data);
      const token = response.data?.data;

      if (!token) {
        throw new Error('Token not found in login response.');
      }

      const decodedToken = decodeJwtPayload(token);
      const id = decodedToken?.id ?? null;
      const role = decodedToken?.role || 'PICKUP_PERSON';

      console.log("Received token:", token);
      console.log("Decoded token payload:", decodedToken);
      console.log("Received id:", id);
      console.log("Received role:", role);

      // Save to Secure Storage so the session persists
      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.setItemAsync('userId', String(id));
      await SecureStore.setItemAsync('userRole', role);

      //  Update Redux state
      dispatch(authSuccess({ token, id, role }));
      console.log("Auth state updated in Redux with token, id and role.", { token, id, role });
      return { token, id, role };

    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed. Please try again.';
      dispatch(authFailure(errorMsg));
      throw error;
    }
  },

  // SIGNUP ACTION
  signup: (userData) => async (dispatch) => {
    dispatch(startLoading());

    try {
      const response = await apiClient.post(ENDPOINTS.SIGNUP, userData);
      const { token, id, role } = response.data;
      console.log("Received token:", token);
      console.log("Received id:", id);
      console.log("Received role:", role);
      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.setItemAsync('userId', String(id));
      await SecureStore.setItemAsync('userRole', role);

      dispatch(authSuccess({ token, id, role }));
      return { token, id, role };

    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Signup failed.';
      dispatch(authFailure(errorMsg));
      throw error;
    }
  },
};

export default authService;
