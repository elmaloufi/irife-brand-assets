import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Link, router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text as NativeText, TextInput, View } from 'react-native';
import { AppText as Text } from '../../src/components/AppText';
import { useEffect, useState } from 'react';
import { useAuth } from '../../src/auth/AuthProvider';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { signOutAndNavigate } from '../../src/auth/sign-out-navigation.mjs';
import { theme } from '../../src/theme';

function AccountRow({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  description: string;
  href: '/requests' | '/settings' | '/saved';
}) {
  return (
    <Link href={href} asChild>
      <Pressable style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
        <View style={styles.rowIcon}><Ionicons name={icon} size={20} color={theme.colors.primary} /></View>
        <View style={styles.rowCopy}>
          <Text style={styles.rowTitle}>{title}</Text>
          <Text style={styles.rowDescription}>{description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.secondary} />
      </Pressable>
    </Link>
  );
}

export default function ProfileScreen() {
  const { user, isLoading, signOut, updateProfile, isSubmitting } = useAuth();
  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);
  useEffect(() => { setDisplayName(user?.displayName ?? ''); }, [user?.displayName]);
  async function saveName() {
    setProfileError(null); setProfileSaved(false);
    if (displayName.trim().length < 2 || displayName.trim().length > 120) { setProfileError('Name must be between 2 and 120 characters.'); return; }
    try { await updateProfile(displayName); setEditingName(false); setProfileSaved(true); }
    catch (cause) { setProfileError(cause instanceof Error ? cause.message : 'Could not update your profile.'); }
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>YOUR TRAVEL SPACE</Text>
        <Text style={styles.title}>Your account</Text>
        <Text style={styles.subtitle}>Keep your travel plans, requests and preferences together.</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}><Ionicons name="person" size={28} color={theme.colors.primaryDark} /></View>
        <View style={styles.profileCopy}>
          {editingName ? <TextInput accessibilityLabel="Display name" autoCapitalize="words" value={displayName} onChangeText={setDisplayName} style={styles.nameInput} maxLength={120} /> : <Text style={styles.profileTitle}>{isLoading ? 'Loading your account…' : user?.displayName ?? 'Welcome to IRIFE'}</Text>}
          <Text style={styles.profileSubtitle}>{user?.email ?? (isLoading ? 'Checking your secure session' : 'Sign in to save your travel world in one place.')}</Text>
        </View>
        {user ? <Pressable accessibilityRole="button" onPress={() => { setEditingName((value) => !value); setProfileError(null); }} style={styles.editButton}><Ionicons name={editingName ? 'close' : 'pencil'} size={15} color={theme.colors.primaryDark} /><Text style={styles.editButtonText}>{editingName ? 'Cancel' : 'Edit'}</Text></Pressable> : <View style={styles.previewBadge}><Text style={styles.previewBadgeText}>GUEST</Text></View>}
      </View>

      {editingName && user ? <View style={styles.editPanel}><Text style={styles.editHint}>Update the name shown on your traveler profile. Email changes require verification and are not enabled yet.</Text>{profileError ? <Text accessibilityRole="alert" style={styles.profileError}>{profileError}</Text> : null}<Pressable accessibilityRole="button" disabled={isSubmitting} onPress={() => void saveName()} style={[styles.saveButton,isSubmitting&&styles.disabled]}><Text style={styles.saveButtonText}>{isSubmitting?'Saving…':'Save profile name'}</Text></Pressable></View> : null}
      {profileSaved ? <Text style={styles.profileSuccess}>Profile updated successfully.</Text> : null}

      {!isLoading && !user ? (
        <View style={styles.authCard}>
          <Text style={styles.authTitle}>Your journey, all in one place</Text>
          <Text style={styles.authDescription}>Create an account or sign in to manage your profile and future experience requests.</Text>
          <Pressable accessibilityRole="button" onPress={() => router.push('/auth/sign-in')} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Sign in</Text><Ionicons name="arrow-forward" size={17} color={theme.colors.white} /></Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.push('/auth/register')} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Create an account</Text></Pressable>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your activity</Text>
        <View style={styles.group}>
          <AccountRow icon="document-text-outline" title="My requests" description="Review your experience enquiries" href="/requests" />
          <View style={styles.rowDivider} />
          <AccountRow icon="bookmark-outline" title="Saved places & trips" description="Your personal travel collection" href="/saved" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.group}>
          <AccountRow icon="settings-outline" title="Settings" description="Language, appearance and privacy" href="/settings" />
        </View>
      </View>

      {user ? (
        <Pressable accessibilityRole="button" disabled={isSubmitting} onPress={() => void signOutAndNavigate(signOut, () => router.replace('/(tabs)/profile'), () => Alert.alert('Sign-out could not be confirmed', 'Your local session was cleared, but the server could not confirm revocation. Reconnect and review active sessions.'))} style={styles.signOut}>
          <Ionicons name="log-out-outline" size={18} color={theme.colors.danger} />
          <Text style={styles.signOutText}>{isSubmitting ? 'Signing out…' : 'Sign out'}</Text>
        </Pressable>
      ) : null}

      <View style={styles.helpCard}>
        <View style={styles.helpIcon}><Ionicons name="help-circle-outline" size={22} color={theme.colors.primary} /></View>
        <View style={styles.helpCopy}>
          <Text style={styles.helpTitle}>Need a hand?</Text>
          <Text style={styles.helpDescription}>Help and traveler support will be added before public launch.</Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { gap: 8 },
  eyebrow: { color: theme.colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  title: { color: theme.colors.ink, fontSize: 30, lineHeight: 36, fontWeight: '900' },
  subtitle: { color: theme.colors.secondary, fontSize: 14, lineHeight: 21 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 17, borderRadius: theme.radius.card, backgroundColor: theme.colors.softMint },
  avatar: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.white },
  profileCopy: { flex: 1, gap: 4 },
  profileTitle: { color: theme.colors.primaryDark, fontSize: 15, fontWeight: '900' },
  profileSubtitle: { color: theme.colors.secondary, fontSize: 11, lineHeight: 16 },
  nameInput: { color: theme.colors.primaryDark, fontSize: 14, fontWeight: '900', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: theme.colors.primary },
  editButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 7, borderRadius: 11, backgroundColor: theme.colors.white },
  editButtonText: { color: theme.colors.primaryDark, fontSize: 9, fontWeight: '900' },
  editPanel: { gap: 10, padding: 14, borderRadius: 16, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
  editHint: { color: theme.colors.secondary, fontSize: 10, lineHeight: 15 },
  profileError: { color: theme.colors.danger, fontSize: 10 },
  profileSuccess: { color: theme.colors.primary, fontSize: 10, fontWeight: '800' },
  saveButton: { minHeight: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: theme.colors.primaryDark },
  saveButtonText: { color: theme.colors.white, fontSize: 11, fontWeight: '900' },
  disabled: { opacity: 0.5 },
  previewBadge: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: theme.radius.pill, backgroundColor: theme.colors.white },
  previewBadgeText: { color: theme.colors.primaryDark, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  authCard: { gap: 10, padding: 17, borderRadius: 20, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
  authTitle: { color: theme.colors.ink, fontSize: 16, fontWeight: '900' },
  authDescription: { color: theme.colors.secondary, fontSize: 12, lineHeight: 18 },
  primaryButton: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 15, backgroundColor: theme.colors.primaryDark },
  primaryButtonText: { color: theme.colors.white, fontSize: 12, fontWeight: '900' },
  secondaryButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: theme.colors.softMint },
  secondaryButtonText: { color: theme.colors.primaryDark, fontSize: 12, fontWeight: '900' },
  section: { gap: 11 },
  sectionTitle: { color: theme.colors.ink, fontSize: 17, fontWeight: '900' },
  group: { overflow: 'hidden', borderRadius: 18, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
  row: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  rowIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: theme.colors.softMint },
  rowCopy: { flex: 1, gap: 4 },
  rowTitle: { color: theme.colors.ink, fontSize: 13, fontWeight: '800' },
  rowDescription: { color: theme.colors.secondary, fontSize: 11 },
  signOut: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 15, backgroundColor: theme.colors.dangerSoft },
  signOutText: { color: theme.colors.danger, fontSize: 12, fontWeight: '900' },
  helpCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 18, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
  helpIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: theme.colors.softMint },
  helpCopy: { flex: 1, gap: 4 },
  helpTitle: { color: theme.colors.ink, fontSize: 13, fontWeight: '800' },
  helpDescription: { color: theme.colors.secondary, fontSize: 11, lineHeight: 16 },
  rowDivider: { height: 1, marginLeft: 68, backgroundColor: theme.colors.border },
  pressed: { opacity: 0.75 },
});
