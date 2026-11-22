import { useFonts } from 'expo-font';
import { Manrope_400Regular } from '@expo-google-fonts/manrope/400Regular';
import { Manrope_500Medium } from '@expo-google-fonts/manrope/500Medium';
import { Manrope_600SemiBold } from '@expo-google-fonts/manrope/600SemiBold';
import { Manrope_700Bold } from '@expo-google-fonts/manrope/700Bold';
import { IBMPlexSansArabic_400Regular } from '@expo-google-fonts/ibm-plex-sans-arabic/400Regular';
import { IBMPlexSansArabic_500Medium } from '@expo-google-fonts/ibm-plex-sans-arabic/500Medium';
import { IBMPlexSansArabic_600SemiBold } from '@expo-google-fonts/ibm-plex-sans-arabic/600SemiBold';
import { IBMPlexSansArabic_700Bold } from '@expo-google-fonts/ibm-plex-sans-arabic/700Bold';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, useColorScheme } from 'react-native';
import { AuthProvider, useAuth } from '../src/auth/AuthProvider';
import { getAuthRouteGuards } from '../src/auth/route-access.mjs';
import { AppErrorBoundary } from '../src/components/AppErrorBoundary';
import { PreferencesProvider, usePreferences } from '../src/services/preferences/PreferencesProvider';
import { theme } from '../src/theme';

function AppNavigation() {
  const { preferences } = usePreferences();
  const { user, isLoading } = useAuth();
  const systemScheme = useColorScheme();
  const effectiveScheme = preferences.appearance === 'system' ? systemScheme : preferences.appearance;
  const dark = effectiveScheme === 'dark';
  const guards = getAuthRouteGuards({ isLoading, hasSession: Boolean(user) });

  return (
    <>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: dark ? '#101B19' : theme.colors.background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="+not-found" />

        <Stack.Protected guard={guards.authenticated}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="experiences/[id]" />
          <Stack.Screen name="saved" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="settings/security" />
        </Stack.Protected>

        <Stack.Protected guard={guards.public}>
          <Stack.Screen name="auth/sign-in" options={{ presentation: 'card' }} />
          <Stack.Screen name="auth/register" options={{ presentation: 'card' }} />
          <Stack.Screen name="auth/reset-password" options={{ presentation: 'card' }} />
        </Stack.Protected>
      </Stack>
    </>
  );
}

function AuthenticatedApp() {
  return (
    <AuthProvider>
      <AppNavigation />
    </AuthProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    IBMPlexSansArabic_400Regular,
    IBMPlexSansArabic_500Medium,
    IBMPlexSansArabic_600SemiBold,
    IBMPlexSansArabic_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <AppErrorBoundary>
      <PreferencesProvider>
        <AuthenticatedApp />
      </PreferencesProvider>
    </AppErrorBoundary>
  );
}
