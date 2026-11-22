import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Link, router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text as NativeText, View } from 'react-native';
import { AppText as Text } from '../../src/components/AppText';
import type { EnquirySummary } from '@irife/contracts';
import { useAuth } from '../../src/auth/AuthProvider';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { cancelMyEnquiry, getMyEnquiries } from '../../src/services/api/enquiries';
import { theme } from '../../src/theme';

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString();
}

function statusLabel(status: EnquirySummary['status']): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default function RequestsScreen() {
  const { user, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<EnquirySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) { setItems([]); setLoading(false); return; }
    setLoading(true); setError(null);
    try { setItems((await getMyEnquiries(1, 50)).data); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not load your requests.'); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { void load(); }, [load, reloadKey]);

  async function cancel(id: string) {
    setCancellingId(id);
    setError(null);
    try {
      const updated = await cancelMyEnquiry(id);
      setItems((current) => current.map((item) => item.id === id ? updated : item));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not cancel this request.');
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>YOUR TRAVEL ACTIVITY</Text>
        <Text style={styles.title}>My requests</Text>
        <Text style={styles.subtitle}>Follow the experiences you have asked local hosts about.</Text>
      </View>

      {authLoading || loading ? <View style={styles.loading}><ActivityIndicator size="large" color={theme.colors.primary} /><Text style={styles.description}>Loading your requests…</Text></View> : null}

      {!authLoading && !user ? (
        <View style={styles.emptyCard}>
          <View style={styles.iconWrap}><Ionicons name="person-circle-outline" size={29} color={theme.colors.primary} /></View>
          <Text style={styles.emptyTitle}>Sign in to view your requests</Text>
          <Text style={styles.description}>Your enquiries are private and linked to your traveler account.</Text>
          <Pressable accessibilityRole="button" onPress={() => router.push('/auth/sign-in')} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Sign in</Text><Ionicons name="arrow-forward" size={16} color={theme.colors.white} /></Pressable>
        </View>
      ) : null}

      {error ? <View style={styles.emptyCard}><Ionicons name="cloud-offline-outline" size={26} color={theme.colors.danger} /><Text style={styles.emptyTitle}>Could not load requests</Text><Text style={styles.description}>{error}</Text><Pressable onPress={() => setReloadKey((value) => value + 1)} style={styles.retry}><Text style={styles.retryText}>Try again</Text></Pressable></View> : null}

      {!authLoading && user && !loading && !error && items.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.iconWrap}><Ionicons name="paper-plane-outline" size={28} color={theme.colors.primary} /></View>
          <Text style={styles.emptyTitle}>Your next experience starts here</Text>
          <Text style={styles.description}>When you send an enquiry about a published experience, it will appear here.</Text>
          <Link href="/(tabs)/discover" asChild><Pressable style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Discover experiences</Text><Ionicons name="arrow-forward" size={15} color={theme.colors.primaryDark} /></Pressable></Link>
        </View>
      ) : null}

      {!loading && items.length > 0 ? <View style={styles.list}>
        {items.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.destination}>{item.experience.destination.name.toUpperCase()}</Text>
              <View style={[styles.status, item.status === 'ACCEPTED' ? styles.statusAccepted : item.status === 'DECLINED' ? styles.statusDeclined : styles.statusPending]}><Text style={styles.statusText}>{statusLabel(item.status)}</Text></View>
            </View>
            <Text style={styles.experienceTitle}>{item.experience.title}</Text>
            <Text style={styles.host}>Hosted by {item.experience.provider.name}</Text>
            <View style={styles.metaRow}><Ionicons name="people-outline" size={15} color={theme.colors.secondary} /><Text style={styles.metaText}>{item.guestCount} {item.guestCount === 1 ? 'guest' : 'guests'}</Text><Ionicons name="calendar-outline" size={15} color={theme.colors.secondary} /><Text style={styles.metaText}>Sent {formatDate(item.createdAt)}</Text></View>
            <Text numberOfLines={3} style={styles.message}>{item.message}</Text>
            {item.status === 'PENDING' ? (
              <Pressable accessibilityRole="button" disabled={cancellingId === item.id} onPress={() => void cancel(item.id)} style={styles.cancelButton}>
                {cancellingId === item.id ? <ActivityIndicator size="small" color={theme.colors.danger} /> : <Ionicons name="close-circle-outline" size={15} color={theme.colors.danger} />}
                <Text style={styles.cancelText}>{cancellingId === item.id ? 'Cancelling…' : 'Cancel request'}</Text>
              </Pressable>
            ) : null}
          </View>
        ))}
      </View> : null}

      <Link href="/(tabs)/profile" asChild><Pressable style={styles.backLink}><Ionicons name="person-outline" size={16} color={theme.colors.primary} /><Text style={styles.backText}>Back to your account</Text></Pressable></Link>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { gap: 8 }, eyebrow: { color: theme.colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  title: { color: theme.colors.ink, fontSize: 29, lineHeight: 35, fontWeight: '900' }, subtitle: { color: theme.colors.secondary, fontSize: 13, lineHeight: 20 },
  loading: { alignItems: 'center', gap: 10, padding: 24 }, description: { color: theme.colors.secondary, fontSize: 11, lineHeight: 18, textAlign: 'center' },
  emptyCard: { alignItems: 'center', gap: 12, padding: 23, borderRadius: 22, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  iconWrap: { width: 62, height: 62, alignItems: 'center', justifyContent: 'center', borderRadius: 21, backgroundColor: theme.colors.softMint },
  emptyTitle: { color: theme.colors.ink, fontSize: 16, fontWeight: '900', textAlign: 'center' },
  primaryButton: { minHeight: 45, width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, backgroundColor: theme.colors.primaryDark },
  primaryButtonText: { color: theme.colors.white, fontSize: 12, fontWeight: '900' },
  secondaryButton: { minHeight: 43, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 15, borderRadius: 14, backgroundColor: theme.colors.softMint },
  secondaryButtonText: { color: theme.colors.primaryDark, fontSize: 11, fontWeight: '900' },
  retry: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: theme.colors.primaryDark }, retryText: { color: theme.colors.white, fontSize: 11, fontWeight: '900' },
  list: { gap: 12 }, card: { gap: 8, padding: 15, borderRadius: 19, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  destination: { color: theme.colors.primary, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  status: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: theme.radius.pill }, statusPending: { backgroundColor: theme.colors.softMint }, statusAccepted: { backgroundColor: '#E3F1E7' }, statusDeclined: { backgroundColor: theme.colors.dangerSoft },
  statusText: { color: theme.colors.primaryDark, fontSize: 9, fontWeight: '900' }, experienceTitle: { color: theme.colors.ink, fontSize: 15, fontWeight: '900' },
  host: { color: theme.colors.secondary, fontSize: 10 }, metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }, metaText: { color: theme.colors.secondary, fontSize: 9 },
  message: { color: theme.colors.ink, fontSize: 11, lineHeight: 17, paddingTop: 4, borderTopWidth: 1, borderTopColor: theme.colors.border },
  cancelButton: { minHeight: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 11, backgroundColor: theme.colors.dangerSoft },
  cancelText: { color: theme.colors.danger, fontSize: 10, fontWeight: '900' },
  backLink: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10 }, backText: { color: theme.colors.primary, fontSize: 11, fontWeight: '800' },
});
