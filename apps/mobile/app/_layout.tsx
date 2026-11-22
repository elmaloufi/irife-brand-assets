import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { AuthProvider } from '../src/auth/AuthProvider';
import { AppErrorBoundary } from '../src/components/AppErrorBoundary';
import { PreferencesProvider, usePreferences } from '../src/services/preferences/PreferencesProvider';
import { theme } from '../src/theme';

function AppNavigation() {
  const { preferences } = usePreferences();
  const systemScheme = useColorScheme();
  const effectiveScheme = preferences.appearance === 'system' ? systemScheme : preferences.appearance;
  const dark = effectiveScheme === 'dark';
  return (
    <AuthProvider>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: dark ? '#101B19' : theme.colors.background } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth/sign-in" options={{ presentation: 'card' }} />
        <Stack.Screen name="auth/register" options={{ presentation: 'card' }} />
        <Stack.Screen name="experiences/[id]" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="settings/security" />
      </Stack>
    </AuthProvider>
  );
}

export default function RootLayout() {
  return (
    <AppErrorBoundary>
      <PreferencesProvider>
        <AppNavigation />
      </PreferencesProvider>
    </AppErrorBoundary>
  );
}
