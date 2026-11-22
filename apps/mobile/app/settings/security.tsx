import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Link, router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { AppTextInput as TextInput } from '../../src/components/AppTextInput';
import { AppText as Text } from '../../src/components/AppText';
import { useAuth } from '../../src/auth/AuthProvider';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { getAccountSessions, revokeAccountSession, updateAccountPassword, type AccountSession } from '../../src/services/auth/auth';
import { theme } from '../../src/theme';

function formatDate(value: string | null): string {
  if (!value) return 'Not used yet';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleString();
}

export default function AccountSecurityScreen() {
  const { session, signOut, isSubmitting } = useAuth();
  const [sessions, setSessions] = useState<AccountSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [changing, setChanging] = useState(false);

  const loadSessions = useCallback(async () => {
    if (!session) { setSessions([]); setLoading(false); return; }
    setLoading(true); setSessionError(null);
    try { setSessions(await getAccountSessions(session)); }
    catch (error) { setSessionError(error instanceof Error ? error.message : 'Could not load account sessions.'); }
    finally { setLoading(false); }
  }, [session]);
  useEffect(() => { void loadSessions(); }, [loadSessions]);

  async function revoke(id: string, isCurrent: boolean) {
    if (!session) return;
    setRevoking(id); setSessionError(null);
    try {
      await revokeAccountSession(session, id);
      if (isCurrent) { await signOut().catch(() => undefined); router.replace('/auth/sign-in'); return; }
      await loadSessions();
    } catch (error) { setSessionError(error instanceof Error ? error.message : 'Could not revoke this session.'); }
    finally { setRevoking(null); }
  }

  async function changePassword() {
    setPasswordError(null);
    if (!session) return;
    if (newPassword.length < 12) { setPasswordError('Your new password must contain at least 12 characters.'); return; }
    if (newPassword !== confirmation) { setPasswordError('The new password and confirmation do not match.'); return; }
    if (newPassword === currentPassword) { setPasswordError('Choose a password different from your current one.'); return; }
    setChanging(true);
    try {
      await updateAccountPassword(session, currentPassword, newPassword);
      setCurrentPassword(''); setNewPassword(''); setConfirmation('');
      await signOut().catch(() => undefined);
      router.replace('/auth/sign-in');
    } catch (error) { setPasswordError(error instanceof Error ? error.message : 'Could not update your password.'); }
    finally { setChanging(false); }
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Link href="/settings" asChild><Pressable style={styles.back}><Ionicons name="chevron-back" size={19} color={theme.colors.primaryDark} /><Text style={styles.backText}>Settings</Text></Pressable></Link>
        <Text style={styles.eyebrow}>PROTECT YOUR ACCOUNT</Text>
        <Text style={styles.title}>Security</Text>
        <Text style={styles.subtitle}>Review signed-in devices and keep your password up to date.</Text>
      </View>
      <View style={styles.section}>
        <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Active sessions</Text><Pressable accessibilityRole="button" onPress={() => void loadSessions()}><Ionicons name="refresh-outline" size={18} color={theme.colors.primary} /></Pressable></View>
        <Text style={styles.description}>Sessions are linked to your account. Revoke a device if you no longer recognize it.</Text>
        {loading ? <View style={styles.loading}><ActivityIndicator color={theme.colors.primary} /><Text style={styles.description}>Loading sessions…</Text></View> : null}
        {!loading && sessions.length === 0 ? <View style={styles.empty}><Text style={styles.description}>No active sessions were returned.</Text></View> : null}
        {sessions.map((item) => <View key={item.id} style={styles.sessionCard}>
          <View style={styles.deviceIcon}><Ionicons name={item.isCurrent ? 'phone-portrait-outline' : 'laptop-outline'} size={21} color={theme.colors.primary} /></View>
          <View style={styles.sessionCopy}>
            <View style={styles.sessionTitleLine}><Text style={styles.sessionTitle}>{item.isCurrent ? 'This device' : 'Other device'}</Text>{item.isCurrent ? <Text style={styles.currentBadge}>CURRENT</Text> : null}</View>
            <Text style={styles.description}>Signed in: {formatDate(item.createdAt)}</Text>
            <Text style={styles.description}>Last active: {formatDate(item.lastUsedAt)}</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel={item.isCurrent ? 'Sign out this device' : 'Revoke session'} disabled={revoking === item.id || isSubmitting} onPress={() => void revoke(item.id, item.isCurrent)} style={styles.revokeButton}>
            {revoking === item.id ? <ActivityIndicator size="small" color={theme.colors.danger} /> : <Ionicons name="close-circle-outline" size={20} color={theme.colors.danger} />}
          </Pressable>
        </View>)}
        {sessionError ? <Text accessibilityRole="alert" style={styles.errorText}>{sessionError}</Text> : null}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Change password</Text>
        <Text style={styles.description}>Changing your password signs out every active device.</Text>
        <View style={styles.formCard}>
          <Text style={styles.label}>Current password</Text>
          <TextInput accessibilityLabel="Current password" autoCapitalize="none" autoComplete="current-password" secureTextEntry style={styles.input} value={currentPassword} onChangeText={setCurrentPassword} placeholder="Enter current password" placeholderTextColor="#9AA59F" />
          <Text style={styles.label}>New password</Text>
          <TextInput accessibilityLabel="New password" autoCapitalize="none" autoComplete="new-password" secureTextEntry style={styles.input} value={newPassword} onChangeText={setNewPassword} placeholder="At least 12 characters" placeholderTextColor="#9AA59F" />
          <Text style={styles.label}>Confirm new password</Text>
          <TextInput accessibilityLabel="Confirm new password" autoCapitalize="none" secureTextEntry style={styles.input} value={confirmation} onChangeText={setConfirmation} placeholder="Repeat new password" placeholderTextColor="#9AA59F" />
          {passwordError ? <Text accessibilityRole="alert" style={styles.errorText}>{passwordError}</Text> : null}
          <Pressable accessibilityRole="button" disabled={changing || currentPassword.length < 12 || newPassword.length < 12 || !confirmation} onPress={() => void changePassword()} style={[styles.submit, (changing || currentPassword.length < 12 || newPassword.length < 12 || !confirmation) && styles.disabled]}>
            {changing ? <ActivityIndicator color={theme.colors.white} /> : <Text style={styles.submitText}>Update password</Text>}
            {!changing ? <Ionicons name="lock-closed-outline" size={17} color={theme.colors.white} /> : null}
          </Pressable>
        </View>
      </View>
      <View style={styles.note}><Ionicons name="shield-checkmark-outline" size={18} color={theme.colors.primary} /><Text style={styles.noteText}>IRIFE stores password hashes on the server and session tokens in your device's secure storage. Never share your password or verification codes.</Text></View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { gap: 8 }, back: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8, paddingVertical: 4 },
  backText: { color: theme.colors.primaryDark, fontSize: 12, fontWeight: '800' }, eyebrow: { color: theme.colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  title: { color: theme.colors.ink, fontSize: 30, lineHeight: 36, fontWeight: '900' }, subtitle: { color: theme.colors.secondary, fontSize: 13, lineHeight: 20 },
  section: { gap: 10 }, sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: theme.colors.ink, fontSize: 16, fontWeight: '900' }, description: { color: theme.colors.secondary, fontSize: 10, lineHeight: 16 },
  loading: { minHeight: 75, alignItems: 'center', justifyContent: 'center', gap: 8 }, empty: { padding: 14, borderRadius: 15, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
  sessionCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 13, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  deviceIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: theme.colors.softMint },
  sessionCopy: { flex: 1, gap: 3 }, sessionTitleLine: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  sessionTitle: { color: theme.colors.ink, fontSize: 12, fontWeight: '900' }, currentBadge: { color: theme.colors.primary, fontSize: 8, fontWeight: '900', letterSpacing: 0.7 },
  revokeButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  formCard: { gap: 9, padding: 15, borderRadius: 18, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  label: { color: theme.colors.ink, fontSize: 11, fontWeight: '800' }, input: { minHeight: 48, paddingHorizontal: 12, borderRadius: 13, borderWidth: 1, borderColor: theme.colors.border, color: theme.colors.ink, backgroundColor: theme.colors.background, fontSize: 12 },
  errorText: { color: theme.colors.danger, fontSize: 10, lineHeight: 16 }, submit: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 15, backgroundColor: theme.colors.primaryDark },
  submitText: { color: theme.colors.white, fontSize: 12, fontWeight: '900' }, disabled: { opacity: 0.45 },
  note: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, padding: 13, borderRadius: 15, backgroundColor: theme.colors.softMint },
  noteText: { flex: 1, color: theme.colors.primaryDark, fontSize: 10, lineHeight: 16 },
});
