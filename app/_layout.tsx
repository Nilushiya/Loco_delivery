import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ActivityIndicator, useColorScheme, View } from 'react-native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { authSuccess } from '../redux/slices/authSlice';
import { store } from '../redux/store';

function RootLayoutNav() {
  const { token, role } = useSelector((state: any) => state.auth);
  const segments = useSegments();
  const router = useRouter();
  const dispatch = useDispatch();
  const [isReady, setIsReady] = useState(false);
  const colorScheme = useColorScheme();

  // 1. Check for existing session on startup
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const savedToken = await SecureStore.getItemAsync('userToken');
        const savedRole = await SecureStore.getItemAsync('userRole');

        if (savedToken && savedRole) {
          // If found, hydrate Redux state
          dispatch(authSuccess({ token: savedToken, role: savedRole }));
        }
      } catch (e) {
        console.error("Failed to load token", e);
      } finally {
        setIsReady(true);
      }
    };

    bootstrapAsync();
  }, []);

  // 2. Role-Based Navigation Logic
  useEffect(() => {
    if (!isReady) return; // Don't navigate until we've checked SecureStore

    const inAuthGroup = (segments[0] as string) === '(auth)';

    if (!token) {
      // If no token, force user to Login
      if (!inAuthGroup) {
        router.replace('/(rider)' as any);
      }
    } else {
      // If token exists, direct them to their specific folder
      if (role === 'User') {
        router.replace('/(user)' as any);
      } else if (role === 'Rider') {
        router.replace('/(rider)' as any);
      }
    }
  }, [token, role, isReady, segments]);

  // 3. Show a loading spinner while checking SecureStore
  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(user)" />
        <Stack.Screen name="(rider)" />
      </Stack>
    </ThemeProvider>
  );
}

// Wrap the whole thing in the Redux Provider
export default function RootLayout() {
  return (
    <Provider store={store}>
      <RootLayoutNav />
    </Provider>
  );
}