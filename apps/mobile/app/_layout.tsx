import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/auth/AuthProvider';
import { theme } from '../src/theme';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth/sign-in" options={{ presentation: 'card' }} />
        <Stack.Screen name="auth/register" options={{ presentation: 'card' }} />
        <Stack.Screen name="settings" />
      </Stack>
    </AuthProvider>
  );
}
