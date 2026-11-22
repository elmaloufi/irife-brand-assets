import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/auth/AuthProvider';
import { AppErrorBoundary } from '../src/components/AppErrorBoundary';
import { theme } from '../src/theme';

export default function RootLayout() {
  return (
    <AppErrorBoundary>
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth/sign-in" options={{ presentation: 'card' }} />
        <Stack.Screen name="auth/register" options={{ presentation: 'card' }} />
        <Stack.Screen name="experiences/[id]" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="settings/security" />
      </Stack>
    </AuthProvider>
    </AppErrorBoundary>
  );
}
