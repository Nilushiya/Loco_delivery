import { Platform } from 'react-native';
/**
 * APP CONFIGURATION
 * Handles environment switching between Development and Production.
 */

// Load from .env
const WEB_API_URL = process.env.EXPO_PUBLIC_WEB_API_URL;       // for web (localhost)
const MOBILE_API_URL = process.env.EXPO_PUBLIC_MOBILE_API_URL; // for mobile devices
const PROD_API_URL = process.env.EXPO_PUBLIC_PROD_API_URL;     // for production server

// Determine current environment
const ENV = {
  apiUrl: __DEV__
    ? Platform.OS === 'web'
      ? WEB_API_URL
      : MOBILE_API_URL
    : PROD_API_URL,
  envName: __DEV__ ? 'Dev' : 'Prod',
};

// Validation Check (Critical for Professional Apps)
// This prevents the app from running if the developer forgot to set up the .env
if (!ENV.apiUrl) {
  const errorMsg = `CONFIG ERROR: EXPO_PUBLIC_API_URL is not defined. 
  Check your .env.${__DEV__ ? 'development' : 'production'} file.`;

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