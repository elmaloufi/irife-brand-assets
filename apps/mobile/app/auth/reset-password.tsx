import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { completePasswordReset, requestPasswordReset } from '../../src/services/auth/auth';
import { theme } from '../../src/theme';

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const token = useMemo(() => Array.isArray(params.token) ? params.token[0] ?? '' : params.token ?? '', [params.token]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);

  async function requestLink() {
    setBusy(true); setError(null); setMessage(null);
    try {
      await requestPasswordReset(email);
      setMessage('If an active account uses that email, a password reset link will be sent shortly. Check your inbox and spam folder.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not submit the request. Please try again.');
    } finally { setBusy(false); }
  }

  async function reset() {
    setBusy(true); setError(null); setMessage(null);
    if (password.length < 12) { setError('Use at least 12 characters for your new password.'); setBusy(false); return; }
    if (password !== confirmation) { setError('The passwords do not match.'); setBusy(false); return; }
    try {
      await completePasswordReset(token, password);
      setComplete(true);
      setMessage('Your password has been changed. All previous sessions have been revoked. Sign in again with your new password.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'This reset link may have expired. Request a new one.');
    } finally { setBusy(false); }
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={19} color={theme.colors.primaryDark} /><Text style={styles.backText}>Back</Text>
        </Pressable>
        <View style={styles.icon}><Ionicons name="key-outline" size={25} color={theme.colors.gold} /></View>
        <Text style={styles.eyebrow}>ACCOUNT RECOVERY</Text>
        <Text style={styles.title}>{token ? 'Choose a new password.' : 'Forgot your password?'}</Text>
        <Text style={styles.subtitle}>{token ? 'Create a new, unique passphrase to secure your IRIFE account.' : 'Enter the email address associated with your account. We will send a secure, time-limited reset link if it matches an active account.'}</Text>
      </View>

      {!token ? (
        <View style={styles.form}>
          <Text style={styles.label}>Email address</Text>
          <View style={styles.inputShell}>
            <Ionicons name="mail-outline" size={18} color={theme.colors.secondary} />
            <TextInput accessibilityLabel="Email address" autoCapitalize="none" autoComplete="email" keyboardType="email-address" placeholder="you@example.com" placeholderTextColor="#9AA59F" style={styles.input} value={email} onChangeText={setEmail} />
          </View>
          <Pressable accessibilityRole="button" disabled={busy || !email.includes('@')} onPress={() => void requestLink()} style={[styles.submit, (busy || !email.includes('@')) && styles.disabled]}>
            {busy ? <ActivityIndicator color={theme.colors.white} /> : <Text style={styles.submitText}>Send reset link</Text>}
            {!busy ? <Ionicons name="arrow-forward" size={17} color={theme.colors.white} /> : null}
          </Pressable>
        </View>
      ) : complete ? (
        <View style={styles.form}>
          <View style={styles.successIcon}><Ionicons name="checkmark-circle" size={28} color={theme.colors.primary} /></View>
          <Link href="/auth/sign-in" asChild><Pressable style={styles.submit}><Text style={styles.submitText}>Return to sign in</Text><Ionicons name="arrow-forward" size={17} color={theme.colors.white} /></Pressable></Link>
        </View>
      ) : (
        <View style={styles.form}>
          <Text style={styles.label}>New password</Text>
          <View style={styles.inputShell}><Ionicons name="lock-closed-outline" size={18} color={theme.colors.secondary} /><TextInput accessibilityLabel="New password" autoCapitalize="none" autoComplete="new-password" secureTextEntry placeholder="At least 12 characters" placeholderTextColor="#9AA59F" style={styles.input} value={password} onChangeText={setPassword} /></View>
          <Text style={styles.label}>Confirm new password</Text>
          <View style={styles.inputShell}><Ionicons name="lock-closed-outline" size={18} color={theme.colors.secondary} /><TextInput accessibilityLabel="Confirm new password" autoCapitalize="none" secureTextEntry placeholder="Enter it again" placeholderTextColor="#9AA59F" style={styles.input} value={confirmation} onChangeText={setConfirmation} /></View>
          <Pressable accessibilityRole="button" disabled={busy || password.length < 12 || !confirmation} onPress={() => void reset()} style={[styles.submit, (busy || password.length < 12 || !confirmation) && styles.disabled]}>
            {busy ? <ActivityIndicator color={theme.colors.white} /> : <Text style={styles.submitText}>Set new password</Text>}
            {!busy ? <Ionicons name="shield-checkmark-outline" size={17} color={theme.colors.white} /> : null}
          </Pressable>
        </View>
      )}

      {message ? <View style={styles.message}><Ionicons name="information-circle-outline" size={18} color={theme.colors.primary} /><Text style={styles.messageText}>{message}</Text></View> : null}
      {error ? <View accessibilityRole="alert" style={styles.error}><Ionicons name="alert-circle-outline" size={17} color={theme.colors.danger} /><Text style={styles.errorText}>{error}</Text></View> : null}
      {!token ? <View style={styles.bottom}><Text style={styles.bottomText}>Remembered your password?</Text><Link href="/auth/sign-in" asChild><Pressable><Text style={styles.link}>Sign in</Text></Pressable></Link></View> : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { gap: 9 }, back: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 4, marginBottom: 8 },
  backText: { color: theme.colors.primaryDark, fontSize: 12, fontWeight: '800' }, icon: { width: 54, height: 54, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: theme.colors.primaryDark },
  eyebrow: { color: theme.colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1.6, marginTop: 7 },
  title: { color: theme.colors.ink, fontSize: 29, lineHeight: 36, fontWeight: '900' }, subtitle: { color: theme.colors.secondary, fontSize: 13, lineHeight: 20 },
  form: { gap: 12 }, label: { color: theme.colors.ink, fontSize: 12, fontWeight: '800' },
  inputShell: { minHeight: 53, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  input: { flex: 1, color: theme.colors.ink, fontSize: 14, paddingVertical: 12 },
  submit: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, borderRadius: 16, backgroundColor: theme.colors.primaryDark },
  submitText: { color: theme.colors.white, fontSize: 12, fontWeight: '900' }, disabled: { opacity: 0.45 },
  message: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: 14, backgroundColor: theme.colors.softMint },
  messageText: { flex: 1, color: theme.colors.primaryDark, fontSize: 11, lineHeight: 17 },
  error: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: 14, backgroundColor: theme.colors.dangerSoft },
  errorText: { flex: 1, color: theme.colors.danger, fontSize: 11, lineHeight: 17 },
  successIcon: { alignItems: 'center', padding: 14 }, bottom: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 'auto' },
  bottomText: { color: theme.colors.secondary, fontSize: 12 }, link: { color: theme.colors.primary, fontSize: 12, fontWeight: '900' },
});
