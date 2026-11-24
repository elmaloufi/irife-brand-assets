import { Ionicons } from '@react-native-vector-icons/ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useAuth } from '../../src/auth/AuthProvider';
import { AppText as Text } from '../../src/components/AppText';
import { AppTextInput as TextInput } from '../../src/components/AppTextInput';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { confirmEmailVerification, requestEmailVerification } from '../../src/services/auth/auth';
import { theme } from '../../src/theme';

export default function VerifyEmailScreen() {
  const { user, refreshUser } = useAuth();
  const { sent } = useLocalSearchParams<{ sent?: string }>();
  const [token, setToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [feedback, setFeedback] = useState(sent === '1'
    ? 'A verification code has been sent. Check your inbox and spam folder.'
    : 'We could not confirm delivery. You can request another code below.');
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    const code = token.trim();
    if (code.length < 32) {
      setError('Enter the complete verification code from your email.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await confirmEmailVerification(code);
      await refreshUser();
      router.replace('/(tabs)');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The code could not be verified. Request a new one.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function resend() {
    setIsResending(true);
    setError(null);
    setFeedback('');
    try {
      await requestEmailVerification();
      setFeedback('If your email is not verified, a fresh code will be sent. Check your inbox and spam folder.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The verification email could not be sent. Try again later.');
    } finally {
      setIsResending(false);
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={() => router.replace('/(tabs)')} style={styles.skipTop}>
          <Text style={styles.skipText}>Continue to IRIFE</Text>
          <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
        </Pressable>
        <View style={styles.iconWrap}>
          <Ionicons name={user?.emailVerifiedAt ? 'shield-checkmark' : 'mail-open'} size={30} color={theme.colors.gold} />
        </View>
        <Text style={styles.eyebrow}>ONE QUICK ACCOUNT STEP</Text>
        <Text style={styles.title}>{user?.emailVerifiedAt ? 'Your email is verified.' : 'Verify your email address.'}</Text>
        <Text style={styles.subtitle}>
          {user?.emailVerifiedAt
            ? 'Your email address is confirmed and ready for your IRIFE account.'
            : 'Confirm that you can receive messages at this address to help protect your account and travel requests.'}
        </Text>
        {user?.email ? <Text style={styles.email}>{user.email}</Text> : null}
      </View>

      {!user?.emailVerifiedAt ? (
        <View style={styles.panel}>
          <Text style={styles.label}>Verification code</Text>
          <View style={styles.inputShell}>
            <Ionicons name="key-outline" size={18} color={theme.colors.secondary} />
            <TextInput
              accessibilityLabel="Email verification code"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Paste the code from your email"
              placeholderTextColor="#9AA59F"
              style={styles.input}
              value={token}
              onChangeText={setToken}
            />
          </View>
          {feedback ? <Text accessibilityRole="status" style={styles.feedback}>{feedback}</Text> : null}
          {error ? <View accessibilityRole="alert" style={styles.error}><Ionicons name="alert-circle-outline" size={17} color={theme.colors.danger} /><Text style={styles.errorText}>{error}</Text></View> : null}
          <Pressable accessibilityRole="button" disabled={isSubmitting || token.trim().length < 32} onPress={() => void confirm()} style={[styles.primaryButton, (isSubmitting || token.trim().length < 32) && styles.disabled]}>
            {isSubmitting ? <ActivityIndicator color={theme.colors.white} /> : <><Text style={styles.primaryText}>Confirm email</Text><Ionicons name="checkmark" size={18} color={theme.colors.white} /></>}
          </Pressable>
          <Pressable accessibilityRole="button" disabled={isResending} onPress={() => void resend()} style={styles.resendButton}>
            {isResending ? <ActivityIndicator color={theme.colors.primary} /> : <Text style={styles.resendText}>Send a new code</Text>}
          </Pressable>
        </View>
      ) : (
        <View style={styles.panel}>
          <View style={styles.verifiedRow}><Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} /><Text style={styles.feedback}>Email verification complete.</Text></View>
          <Pressable accessibilityRole="button" onPress={() => router.replace('/(tabs)')} style={styles.primaryButton}>
            <Text style={styles.primaryText}>Continue to IRIFE</Text>
            <Ionicons name="arrow-forward" size={18} color={theme.colors.white} />
          </Pressable>
        </View>
      )}

      <View style={styles.footer}>
        <Ionicons name="lock-closed-outline" size={14} color={theme.colors.secondary} />
        <Text style={styles.footerText}>Your verification code is single-use and expires after 24 hours.</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { gap: 11 },
  skipTop: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', gap: 5, paddingVertical: 8 },
  skipText: { color: theme.colors.primary, fontSize: 11, fontWeight: '800' },
  iconWrap: { width: 62, height: 62, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: theme.colors.primaryDark },
  eyebrow: { color: theme.colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginTop: 8 },
  title: { color: theme.colors.ink, fontSize: 28, lineHeight: 35, fontWeight: '900' },
  subtitle: { color: theme.colors.secondary, fontSize: 13, lineHeight: 20 },
  email: { color: theme.colors.primaryDark, fontSize: 13, fontWeight: '900' },
  panel: { gap: 14, padding: 18, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  label: { color: theme.colors.ink, fontSize: 12, fontWeight: '800' },
  inputShell: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, borderRadius: 15, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.background },
  input: { flex: 1, color: theme.colors.ink, fontSize: 12, paddingVertical: 12 },
  feedback: { color: theme.colors.secondary, fontSize: 11, lineHeight: 17 },
  error: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: 13, backgroundColor: theme.colors.dangerSoft },
  errorText: { flex: 1, color: theme.colors.danger, fontSize: 11, lineHeight: 17 },
  primaryButton: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, borderRadius: 15, backgroundColor: theme.colors.primaryDark },
  primaryText: { color: theme.colors.white, fontSize: 12, fontWeight: '900' },
  disabled: { opacity: 0.45 },
  resendButton: { minHeight: 40, alignItems: 'center', justifyContent: 'center' },
  resendText: { color: theme.colors.primary, fontSize: 11, fontWeight: '900' },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 'auto' },
  footerText: { color: theme.colors.secondary, fontSize: 9 },
});
