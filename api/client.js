import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { BASE_URL } from '../constants/Config';
import { logout } from '../redux/slices/authSlice';
import { store } from '../redux/store';

const apiClient = axios.create({
  baseURL: BASE_URL,
});

// Add a request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Grab the token from the Redux auth state
    const state = store.getState();
    const token = state.auth.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response, // If status is 2xx, just return response
  async (error) => {
    // Check if the error is 401 (Expired/Invalid) or 403 (No Permission)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {

      console.log("Unauthorized or Forbidden - Logging out...");

      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userId');
      await SecureStore.deleteItemAsync('userRole');

      // Clear the Redux state
      store.dispatch(logout());

      //  Alert the user
      alert("Your session has expired or you do not have permission.");
    }
    return Promise.reject(error);
  }
);

export default apiClient;
