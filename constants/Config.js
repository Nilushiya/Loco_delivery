import { Platform } from 'react-native';
/**
 * APP CONFIGURATION
 * Handles environment switching between Development and Production.
 */

// Load from .env
const EXPO_PUBLIC_API_URL = process.env.EXPO_PUBLIC_API_URL;
const WEB_API_URL = "http://localhost:3001";
const MOBILE_API_URL = "http://192.168.8.178:3001"; // for mobile devices
const PROD_API_URL = process.env.EXPO_PUBLIC_PROD_API_URL;     // for production server

// Determine current environment
const ENV = {
  apiUrl: __DEV__
    ? (EXPO_PUBLIC_API_URL || (Platform.OS === 'web' ? WEB_API_URL : MOBILE_API_URL))
    : (PROD_API_URL || EXPO_PUBLIC_API_URL),
  envName: __DEV__ ? 'Dev' : 'Prod',
};

// Validation Check (Critical for Professional Apps)
// This prevents the app from running if the developer forgot to set up the .env
if (!ENV.apiUrl) {
  const errorMsg = `CONFIG ERROR: API URL is not defined. 
  Set EXPO_PUBLIC_API_URL for mobile testing.`;

  if (__DEV__) {
    console.error(errorMsg);
  } else {
    throw new Error(errorMsg);
  }
}

// Centralized Export
export const BASE_URL = ENV.apiUrl;

export const ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  LOGOUT: '/auth/logout',
  RESTAURANT_REGISTER: '/delivery-person/register',
  RESTAURANT_LOGIN: '/delivery-person/login',


  // User Role
  //   USER_PROFILE: '/user/profile',
  //   USER_DASHBOARD: '/user/dashboard',

  // Delivery Role
  //   DELIVERY_TASKS: '/delivery/tasks',
  //   UPDATE_STATUS: '/delivery/update-status',

  // Manager Role
  //   MANAGER_STATS: '/manager/dashboard',
  //   STATION_LOGS: '/manager/logs',
};

// pp Theme Constants (Bonus for "Good Architecture")
// export const THEME = {
//   primary: '#6200EE',
//   secondary: '#03DAC6',
//   error: '#B00020',
//   background: {
//     light: '#FFFFFF',
//     dark: '#121212',
//   },
// };
