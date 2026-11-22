import { useFonts } from 'expo-font';
import { Manrope_400Regular } from '@expo-google-fonts/manrope/400Regular';
import { Manrope_500Medium } from '@expo-google-fonts/manrope/500Medium';
import { Manrope_600SemiBold } from '@expo-google-fonts/manrope/600SemiBold';
import { Manrope_700Bold } from '@expo-google-fonts/manrope/700Bold';
import { IBMPlexSansArabic_400Regular } from '@expo-google-fonts/ibm-plex-sans-arabic/400Regular';
import { IBMPlexSansArabic_500Medium } from '@expo-google-fonts/ibm-plex-sans-arabic/500Medium';
import { IBMPlexSansArabic_600SemiBold } from '@expo-google-fonts/ibm-plex-sans-arabic/600SemiBold';
import { IBMPlexSansArabic_700Bold } from '@expo-google-fonts/ibm-plex-sans-arabic/700Bold';
import { Redirect, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, useColorScheme } from 'react-native';
import { AuthProvider, useAuth } from '../src/auth/AuthProvider';
import { getAuthRedirect } from '../src/auth/route-access.mjs';
import { AppErrorBoundary } from '../src/components/AppErrorBoundary';
import { PreferencesProvider, usePreferences } from '../src/services/preferences/PreferencesProvider';
import { theme } from '../src/theme';

function AuthenticatedNavigation({ dark }: { dark: boolean }) {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const redirect = getAuthRedirect({
    isLoading,
    hasSession: Boolean(user),
    segments,
  });

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: dark ? '#101B19' : theme.colors.background }}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (redirect === '/auth/sign-in') return <Redirect href="/auth/sign-in" />;
  if (redirect === '/(tabs)') return <Redirect href="/(tabs)" />;

  return (
    <>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: dark ? '#101B19' : theme.colors.background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth/sign-in" options={{ presentation: 'card' }} />
        <Stack.Screen name="auth/register" options={{ presentation: 'card' }} />
        <Stack.Screen name="auth/reset-password" options={{ presentation: 'card' }} />
        <Stack.Screen name="experiences/[id]" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="settings/security" />
      </Stack>
    </>
  );
}

function AppNavigation() {
  const { preferences } = usePreferences();
  const systemScheme = useColorScheme();
  const effectiveScheme = preferences.appearance === 'system' ? systemScheme : preferences.appearance;
  const dark = effectiveScheme === 'dark';

  return (
    <AuthProvider>
      <AuthenticatedNavigation dark={dark} />
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
        <AppNavigation />
      </PreferencesProvider>
    </AppErrorBoundary>
  );
}
