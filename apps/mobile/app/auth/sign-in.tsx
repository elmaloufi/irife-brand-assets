import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../../src/auth/AuthProvider';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { theme } from '../../src/theme';

export default function SignInScreen() {
  const { signIn, isSubmitting, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);

  async function submit() {
    clearError();
    try {
      await signIn(email, password);
      router.replace('/(tabs)/profile');
    } catch {
      // The provider exposes a safe, user-readable error.
    }
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.top}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.primaryDark} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <View style={styles.brandMark}><Ionicons name="sparkles" size={24} color={theme.colors.gold} /></View>
          <Text style={styles.eyebrow}>WELCOME BACK</Text>
          <Text style={styles.title}>Your next story starts here.</Text>
          <Text style={styles.subtitle}>Sign in to keep your Moroccan journeys and experiences together.</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Email address</Text>
            <View style={styles.inputShell}>
              <Ionicons name="mail-outline" size={18} color={theme.colors.secondary} />
              <TextInput
                accessibilityLabel="Email address"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                placeholder="you@example.com"
                placeholderTextColor="#9AA59F"
                returnKeyType="next"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputShell}>
              <Ionicons name="lock-closed-outline" size={18} color={theme.colors.secondary} />
              <TextInput
                accessibilityLabel="Password"
                autoCapitalize="none"
                autoComplete="current-password"
                placeholder="Your password"
                placeholderTextColor="#9AA59F"
                secureTextEntry={!visible}
                returnKeyType="done"
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                onSubmitEditing={() => void submit()}
              />
              <Pressable accessibilityRole="button" accessibilityLabel={visible ? 'Hide password' : 'Show password'} onPress={() => setVisible((value) => !value)} hitSlop={10}>
                <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={19} color={theme.colors.secondary} />
              </Pressable>
            </View>
          </View>
          {error ? <View accessibilityRole="alert" style={styles.error}><Ionicons name="alert-circle-outline" size={17} color={theme.colors.danger} /><Text style={styles.errorText}>{error}</Text></View> : null}
          <Link href="/auth/reset-password" asChild><Pressable accessibilityRole="link" style={styles.forgotLink}><Text style={styles.link}>Forgot password?</Text></Pressable></Link>
          <Pressable
            accessibilityRole="button"
            disabled={isSubmitting || !email.trim() || password.length < 12}
            onPress={() => void submit()}
            style={[styles.submit, (isSubmitting || !email.trim() || password.length < 12) && styles.disabled]}
          >
            {isSubmitting ? <ActivityIndicator color={theme.colors.white} /> : <Text style={styles.submitText}>Sign in securely</Text>}
            {!isSubmitting ? <Ionicons name="arrow-forward" size={18} color={theme.colors.white} /> : null}
          </Pressable>
          <View style={styles.footnote}><Ionicons name="shield-checkmark-outline" size={15} color={theme.colors.primary} /><Text style={styles.footnoteText}>Your session is stored using the device's secure storage.</Text></View>
        </View>

        <View style={styles.bottom}>
          <Text style={styles.bottomText}>New to IRIFE?</Text>
          <Link href="/auth/register" asChild><Pressable><Text style={styles.link}>Create an account</Text></Pressable></Link>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 28 },
  top: { gap: 10 },
  back: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 3, marginBottom: 12 },
  backText: { color: theme.colors.primaryDark, fontSize: 12, fontWeight: '800' },
  brandMark: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primaryDark },
  eyebrow: { color: theme.colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1.7, marginTop: 8 },
  title: { color: theme.colors.ink, fontSize: 31, lineHeight: 38, fontWeight: '900', maxWidth: 310 },
  subtitle: { color: theme.colors.secondary, fontSize: 13, lineHeight: 20, maxWidth: 330 },
  form: { gap: 17 },
  field: { gap: 8 },
  label: { color: theme.colors.ink, fontSize: 12, fontWeight: '800' },
  inputShell: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  input: { flex: 1, color: theme.colors.ink, fontSize: 14, paddingVertical: 13 },
  error: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: 13, backgroundColor: theme.colors.dangerSoft },
  errorText: { flex: 1, color: theme.colors.danger, fontSize: 11, lineHeight: 17 },
  submit: { minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 17, backgroundColor: theme.colors.primaryDark },
  submitText: { color: theme.colors.white, fontSize: 13, fontWeight: '900' },
  disabled: { opacity: 0.45 },
  footnote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  footnoteText: { color: theme.colors.secondary, fontSize: 10 },
  forgotLink: { alignSelf: 'flex-end', paddingVertical: 2 },
  bottom: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 'auto', paddingTop: 12 },
  bottomText: { color: theme.colors.secondary, fontSize: 12 },
  link: { color: theme.colors.primary, fontSize: 12, fontWeight: '900' },
});
