import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Link, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Animated, ImageBackground, KeyboardAvoidingView,
  Platform, Pressable, ScrollView, StatusBar, StyleSheet, View,
} from 'react-native';
import { AppTextInput as TextInput } from '../../src/components/AppTextInput';
import { AppText as Text } from '../../src/components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/auth/AuthProvider';
import { theme } from '../../src/theme';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=1400&q=88';

export default function SignInScreen() {
  const { signIn, isSubmitting, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(22)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 850, useNativeDriver: true }),
      Animated.timing(rise, { toValue: 0, duration: 850, useNativeDriver: true }),
    ]).start();
    return () => { fade.stopAnimation(); rise.stopAnimation(); };
  }, [fade, rise]);

  async function submit() {
    clearError();
    try {
      await signIn(email.trim(), password);
      router.replace('/(tabs)/profile');
    } catch {
      // AuthProvider exposes a safe, user-readable error.
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView bounces={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <ImageBackground source={{ uri: HERO_IMAGE }} resizeMode="cover" style={styles.hero} imageStyle={styles.heroImage}>
            <View style={styles.heroShade} />
            <View style={styles.heroTop}>
              <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} style={styles.backButton} hitSlop={10}>
                <Ionicons name="arrow-back" size={19} color="#FFFFFF" />
              </Pressable>
              <View style={styles.languagePill}>
                <Ionicons name="globe-outline" size={13} color="#F0D7A7" />
                <Text style={styles.languageText}>EN</Text>
              </View>
            </View>
            <Animated.View style={[styles.heroCopy, { opacity: fade, transform: [{ translateY: rise }] }]}>
              <View style={styles.brandRow}>
                <View style={styles.brandIcon}><Ionicons name="compass" size={22} color="#F0D7A7" /></View>
                <Text style={styles.brandName}>IRIFE</Text>
              </View>
              <Text style={styles.heroEyebrow}>MOROCCO, BEYOND THE ORDINARY</Text>
              <Text style={styles.heroTitle}>Your next story{'\n'}starts here.</Text>
              <Text style={styles.heroSubtitle}>Find the places, people and moments{'\n'}that make a journey yours.</Text>
              <View style={styles.heroRule}><View style={styles.heroRuleLine} /><Ionicons name="sparkles" size={13} color="#F0D7A7" /><View style={styles.heroRuleLine} /></View>
            </Animated.View>
          </ImageBackground>

          <Animated.View style={[styles.panel, { opacity: fade, transform: [{ translateY: rise }] }]}>
            <View style={styles.panelHeading}>
              <View>
                <Text style={styles.panelEyebrow}>WELCOME BACK</Text>
                <Text style={styles.panelTitle}>Sign in to IRIFE</Text>
              </View>
              <View style={styles.secureSeal}><Ionicons name="shield-checkmark" size={19} color={theme.colors.gold} /></View>
            </View>

            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label}>Email address</Text>
                <View style={styles.inputShell}>
                  <Ionicons name="mail-outline" size={18} color={theme.colors.secondary} />
                  <TextInput accessibilityLabel="Email address" autoCapitalize="none" autoComplete="email" keyboardType="email-address" placeholder="you@example.com" placeholderTextColor="#9AA59F" returnKeyType="next" style={styles.input} value={email} onChangeText={setEmail} />
                </View>
              </View>
              <View style={styles.field}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Password</Text>
                  <Link href="/auth/reset-password" asChild><Pressable accessibilityRole="link" hitSlop={8}><Text style={styles.forgotLink}>Forgot password?</Text></Pressable></Link>
                </View>
                <View style={styles.inputShell}>
                  <Ionicons name="lock-closed-outline" size={18} color={theme.colors.secondary} />
                  <TextInput accessibilityLabel="Password" autoCapitalize="none" autoComplete="current-password" placeholder="Enter your password" placeholderTextColor="#9AA59F" secureTextEntry={!visible} returnKeyType="done" style={styles.input} value={password} onChangeText={setPassword} onSubmitEditing={() => void submit()} />
                  <Pressable accessibilityRole="button" accessibilityLabel={visible ? 'Hide password' : 'Show password'} onPress={() => setVisible(value => !value)} hitSlop={10}>
                    <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={19} color={theme.colors.secondary} />
                  </Pressable>
                </View>
              </View>
              {error ? <View accessibilityRole="alert" style={styles.error}><Ionicons name="alert-circle-outline" size={17} color={theme.colors.danger} /><Text style={styles.errorText}>{error}</Text></View> : null}
              <Pressable accessibilityRole="button" disabled={isSubmitting || !email.trim() || password.length === 0} onPress={() => void submit()} style={[styles.submit, (isSubmitting || !email.trim() || password.length === 0) && styles.disabled]}>
                {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <><Text style={styles.submitText}>Continue your journey</Text><Ionicons name="arrow-forward" size={18} color="#FFFFFF" /></>}
              </Pressable>
              <View style={styles.privacyNote}><Ionicons name="lock-closed" size={13} color={theme.colors.primary} /><Text style={styles.privacyText}>Your account and personal details stay protected.</Text></View>
            </View>

            <View style={styles.bottom}>
              <Text style={styles.bottomText}>New to IRIFE?</Text>
              <Link href="/auth/register" asChild><Pressable accessibilityRole="link"><Text style={styles.createLink}>Create an account</Text></Pressable></Link>
            </View>
          </Animated.View>

          <View style={styles.footer}><Text style={styles.footerText}>MADE FOR THE WAY YOU TRAVEL</Text><View style={styles.footerDot} /><Text style={styles.footerText}>MOROCCO</Text></View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#102F2A' },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, backgroundColor: '#102F2A', paddingBottom: 12 },
  hero: { minHeight: 390, justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 8, paddingBottom: 54, overflow: 'hidden' },
  heroImage: { opacity: 0.96 },
  heroShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(7, 29, 25, 0.56)' },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.32)', backgroundColor: 'rgba(12,35,30,0.24)' },
  languagePill: { minHeight: 34, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, borderRadius: 99, borderWidth: 1, borderColor: 'rgba(240,215,167,0.5)', backgroundColor: 'rgba(12,35,30,0.3)' },
  languageText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  heroCopy: { gap: 10, paddingTop: 34 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  brandIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(240,215,167,0.7)', backgroundColor: 'rgba(12,35,30,0.32)' },
  brandName: { color: '#FFFFFF', fontSize: 22, fontWeight: '900', letterSpacing: 4 },
  heroEyebrow: { color: '#F0D7A7', fontSize: 9, fontWeight: '900', letterSpacing: 2.1 },
  heroTitle: { color: '#FFFFFF', fontSize: 39, lineHeight: 45, fontWeight: '900', letterSpacing: -1.1 },
  heroSubtitle: { color: 'rgba(255,255,255,0.86)', fontSize: 13, lineHeight: 20 },
  heroRule: { flexDirection: 'row', alignItems: 'center', gap: 10, width: 118, marginTop: 8 },
  heroRuleLine: { flex: 1, height: 1, backgroundColor: 'rgba(240,215,167,0.68)' },
  panel: { marginTop: -30, marginHorizontal: 14, paddingHorizontal: 22, paddingTop: 25, paddingBottom: 22, borderRadius: 27, backgroundColor: '#FAF8F2', shadowColor: '#061C18', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.22, shadowRadius: 22, elevation: 12 },
  panelHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 23 },
  panelEyebrow: { color: theme.colors.primary, fontSize: 9, fontWeight: '900', letterSpacing: 1.8, marginBottom: 6 },
  panelTitle: { color: '#173B34', fontSize: 24, lineHeight: 30, fontWeight: '900', letterSpacing: -0.5 },
  secureSeal: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EDE5D6' },
  form: { gap: 17 },
  field: { gap: 8 },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: '#263C36', fontSize: 12, fontWeight: '800' },
  inputShell: { minHeight: 55, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 15, borderRadius: 15, borderWidth: 1, borderColor: '#E6E1D7', backgroundColor: '#FFFFFF' },
  input: { flex: 1, color: '#203A34', fontSize: 14, paddingVertical: 13 },
  forgotLink: { color: theme.colors.primary, fontSize: 11, fontWeight: '800' },
  error: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: 13, backgroundColor: theme.colors.dangerSoft },
  errorText: { flex: 1, color: theme.colors.danger, fontSize: 11, lineHeight: 17 },
  submit: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 2, borderRadius: 16, backgroundColor: '#123F36' },
  submitText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900', letterSpacing: 0.2 },
  disabled: { opacity: 0.48 },
  privacyNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  privacyText: { color: '#708078', fontSize: 10 },
  bottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 22, paddingTop: 17, borderTopWidth: 1, borderTopColor: '#EAE5DB' },
  bottomText: { color: '#718079', fontSize: 12 },
  createLink: { color: '#176F60', fontSize: 12, fontWeight: '900' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, paddingTop: 18, paddingBottom: 6 },
  footerText: { color: 'rgba(255,255,255,0.58)', fontSize: 8, fontWeight: '800', letterSpacing: 1.5 },
  footerDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#D8B477' },
});
