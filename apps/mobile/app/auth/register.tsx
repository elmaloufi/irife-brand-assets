import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { AppText as Text } from '../../src/components/AppText';
import { useAuth } from '../../src/auth/AuthProvider';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { theme } from '../../src/theme';

export default function RegisterScreen() {
  const { signUp, isSubmitting, error, clearError } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [visible, setVisible] = useState(false);

  async function submit() {
    clearError();
    try {
      await signUp(displayName, email, password);
      router.replace('/(tabs)/profile');
    } catch {
      // The provider exposes a safe, user-readable error.
    }
  }

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const canSubmit = displayName.trim().length >= 2 && email.includes('@') && password.length >= 12 && passwordsMatch;

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.top}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.primaryDark} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <View style={styles.brandMark}><Ionicons name="compass-outline" size={25} color={theme.colors.gold} /></View>
          <Text style={styles.eyebrow}>JOIN THE JOURNEY</Text>
          <Text style={styles.title}>Make room for new experiences.</Text>
          <Text style={styles.subtitle}>Create your IRIFE traveler account in a few simple steps.</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Your name</Text>
            <View style={styles.inputShell}>
              <Ionicons name="person-outline" size={18} color={theme.colors.secondary} />
              <TextInput accessibilityLabel="Your name" autoCapitalize="words" autoComplete="name" placeholder="Full name" placeholderTextColor="#9AA59F" style={styles.input} value={displayName} onChangeText={setDisplayName} />
            </View>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Email address</Text>
            <View style={styles.inputShell}>
              <Ionicons name="mail-outline" size={18} color={theme.colors.secondary} />
              <TextInput accessibilityLabel="Email address" autoCapitalize="none" autoComplete="email" keyboardType="email-address" placeholder="you@example.com" placeholderTextColor="#9AA59F" style={styles.input} value={email} onChangeText={setEmail} />
            </View>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Create password</Text>
            <View style={styles.inputShell}>
              <Ionicons name="lock-closed-outline" size={18} color={theme.colors.secondary} />
              <TextInput accessibilityLabel="Create password" autoCapitalize="none" autoComplete="new-password" placeholder="At least 12 characters" placeholderTextColor="#9AA59F" secureTextEntry={!visible} style={styles.input} value={password} onChangeText={setPassword} />
              <Pressable accessibilityRole="button" accessibilityLabel={visible ? 'Hide password' : 'Show password'} onPress={() => setVisible((value) => !value)} hitSlop={10}>
                <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={19} color={theme.colors.secondary} />
              </Pressable>
            </View>
            <Text style={styles.hint}>Use at least 12 characters. A longer, unique passphrase is best.</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Confirm password</Text>
            <View style={styles.inputShell}>
              <Ionicons name="lock-closed-outline" size={18} color={theme.colors.secondary} />
              <TextInput accessibilityLabel="Confirm password" autoCapitalize="none" autoComplete="new-password" placeholder="Enter your password again" placeholderTextColor="#9AA59F" secureTextEntry style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} />
            </View>
            {confirmPassword.length > 0 && !passwordsMatch ? <Text style={styles.mismatch}>Passwords do not match.</Text> : null}
          </View>
          {error ? <View accessibilityRole="alert" style={styles.error}><Ionicons name="alert-circle-outline" size={17} color={theme.colors.danger} /><Text style={styles.errorText}>{error}</Text></View> : null}
          <Pressable accessibilityRole="button" disabled={isSubmitting || !canSubmit} onPress={() => void submit()} style={[styles.submit, (isSubmitting || !canSubmit) && styles.disabled]}>
            {isSubmitting ? <ActivityIndicator color={theme.colors.white} /> : <Text style={styles.submitText}>Create my account</Text>}
            {!isSubmitting ? <Ionicons name="arrow-forward" size={18} color={theme.colors.white} /> : null}
          </Pressable>
          <View style={styles.footnote}><Ionicons name="shield-checkmark-outline" size={15} color={theme.colors.primary} /><Text style={styles.footnoteText}>New accounts are created with traveler permissions only.</Text></View>
        </View>

        <View style={styles.bottom}>
          <Text style={styles.bottomText}>Already have an account?</Text>
          <Link href="/auth/sign-in" asChild><Pressable><Text style={styles.link}>Sign in</Text></Pressable></Link>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 24 },
  top: { gap: 9 },
  back: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 3, marginBottom: 10 },
  backText: { color: theme.colors.primaryDark, fontSize: 12, fontWeight: '800' },
  brandMark: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primaryDark },
  eyebrow: { color: theme.colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1.7, marginTop: 8 },
  title: { color: theme.colors.ink, fontSize: 29, lineHeight: 36, fontWeight: '900', maxWidth: 330 },
  subtitle: { color: theme.colors.secondary, fontSize: 13, lineHeight: 20 },
  form: { gap: 14 },
  field: { gap: 7 },
  label: { color: theme.colors.ink, fontSize: 12, fontWeight: '800' },
  inputShell: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  input: { flex: 1, color: theme.colors.ink, fontSize: 14, paddingVertical: 12 },
  hint: { color: theme.colors.secondary, fontSize: 10 },
  mismatch: { color: theme.colors.danger, fontSize: 10, fontWeight: '700' },
  error: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: 13, backgroundColor: theme.colors.dangerSoft },
  errorText: { flex: 1, color: theme.colors.danger, fontSize: 11, lineHeight: 17 },
  submit: { minHeight: 53, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 17, backgroundColor: theme.colors.primaryDark },
  submitText: { color: theme.colors.white, fontSize: 13, fontWeight: '900' },
  disabled: { opacity: 0.45 },
  footnote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  footnoteText: { color: theme.colors.secondary, fontSize: 10 },
  bottom: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 'auto', paddingTop: 10 },
  bottomText: { color: theme.colors.secondary, fontSize: 12 },
  link: { color: theme.colors.primary, fontSize: 12, fontWeight: '900' },
});
