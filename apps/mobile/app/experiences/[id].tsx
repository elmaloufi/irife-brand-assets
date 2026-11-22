import { Ionicons } from '@react-native-vector-icons/ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { AppText as Text } from '../../src/components/AppText';
import type { ExperienceDetail } from '@irife/contracts';
import { useAuth } from '../../src/auth/AuthProvider';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { getExperienceById } from '../../src/services/api/discovery';
import { createEnquiry } from '../../src/services/api/enquiries';
import { saveExperience } from '../../src/services/api/saved';
import { theme } from '../../src/theme';

export default function ExperienceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const [experience, setExperience] = useState<ExperienceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guestCount, setGuestCount] = useState('1');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true); setError(null);
    getExperienceById(id).then((result) => { if (active) setExperience(result); })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : 'Could not load this experience.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  async function saveCurrentExperience() {
    if (!experience) return;
    if (!user) { router.push('/auth/sign-in'); return; }
    setSaving(true); setSaveError(null);
    try { await saveExperience(experience.id); setSaved(true); }
    catch (cause) { setSaveError(cause instanceof Error ? cause.message : 'Could not save this experience.'); }
    finally { setSaving(false); }
  }

  async function submitEnquiry() {
    if (!experience) return;
    if (!user) { router.push('/auth/sign-in'); return; }
    const count = Number(guestCount);
    if (!Number.isInteger(count) || count < 1 || count > 20) { setSubmitError('Choose between 1 and 20 guests.'); return; }
    if (message.trim().length < 10) { setSubmitError('Please write at least 10 characters so the host understands your request.'); return; }
    setSubmitting(true); setSubmitError(null);
    try {
      await createEnquiry({ experienceId: experience.id, guestCount: count, message: message.trim() });
      router.replace('/(tabs)/requests');
    } catch (cause) { setSubmitError(cause instanceof Error ? cause.message : 'Could not send your enquiry.'); }
    finally { setSubmitting(false); }
  }

  return (
    <ScreenContainer>
      <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}><Ionicons name="chevron-back" size={19} color={theme.colors.primaryDark} /><Text style={styles.backText}>Back</Text></Pressable>
      {loading ? <View style={styles.loading}><ActivityIndicator size="large" color={theme.colors.primary} /><Text style={styles.description}>Loading experience…</Text></View> : null}
      {error ? <View style={styles.card}><Ionicons name="alert-circle-outline" size={25} color={theme.colors.danger} /><Text style={styles.title}>Experience unavailable</Text><Text style={styles.description}>{error}</Text></View> : null}
      {experience ? <>
        <View style={styles.hero}>
          <View style={styles.heroIcon}><Ionicons name="compass-outline" size={34} color={theme.colors.gold} /></View>
          <Text style={styles.destination}>{experience.destination.name.toUpperCase()}</Text>
          <Text style={styles.title}>{experience.title}</Text>
          <Text style={styles.provider}>With {experience.provider.name}</Text>
        </View>
        <View style={styles.infoRow}>
          {experience.durationMinutes ? <View style={styles.infoItem}><Ionicons name="time-outline" size={16} color={theme.colors.primary} /><Text style={styles.infoText}>{experience.durationMinutes} min</Text></View> : null}
          {experience.maxGroupSize ? <View style={styles.infoItem}><Ionicons name="people-outline" size={16} color={theme.colors.primary} /><Text style={styles.infoText}>Up to {experience.maxGroupSize}</Text></View> : null}
          <Text style={styles.price}>{experience.priceFrom ? `From ${experience.priceFrom} ${experience.currency}` : 'Contact host for price'}</Text>
        </View>
        <Pressable accessibilityRole="button" disabled={saving || saved} onPress={() => void saveCurrentExperience()} style={styles.saveButton}>
          {saving ? <ActivityIndicator size="small" color={theme.colors.primaryDark} /> : <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={17} color={theme.colors.primaryDark} />}
          <Text style={styles.saveButtonText}>{saving ? 'Saving…' : saved ? 'Saved to your collection' : 'Save this experience'}</Text>
        </Pressable>
        {saveError ? <Text accessibilityRole="alert" style={styles.errorText}>{saveError}</Text> : null}
        <View style={styles.card}><Text style={styles.sectionTitle}>About this experience</Text><Text style={styles.body}>{experience.description}</Text></View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Ask the local host</Text>
          <Text style={styles.description}>Send an enquiry to check details and availability. This does not charge you or confirm a booking.</Text>
          <Text style={styles.label}>Number of guests</Text>
          <TextInput accessibilityLabel="Number of guests" keyboardType="number-pad" value={guestCount} onChangeText={setGuestCount} style={styles.input} />
          <Text style={styles.label}>Your message</Text>
          <TextInput accessibilityLabel="Your message to the host" multiline value={message} onChangeText={setMessage} placeholder="Tell the host what you would like to know…" placeholderTextColor="#9AA59F" style={[styles.input, styles.messageInput]} textAlignVertical="top" />
          {submitError ? <Text accessibilityRole="alert" style={styles.errorText}>{submitError}</Text> : null}
          <Pressable accessibilityRole="button" disabled={submitting || authLoading} onPress={() => void submitEnquiry()} style={[styles.submit, (submitting || authLoading) && styles.disabled]}>
            {submitting ? <ActivityIndicator color={theme.colors.white} /> : <Text style={styles.submitText}>{user ? 'Send enquiry' : 'Sign in to enquire'}</Text>}
            {!submitting ? <Ionicons name="paper-plane-outline" size={17} color={theme.colors.white} /> : null}
          </Pressable>
        </View>
      </> : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4 }, backText: { color: theme.colors.primaryDark, fontSize: 12, fontWeight: '800' },
  loading: { minHeight: 160, alignItems: 'center', justifyContent: 'center', gap: 10 }, description: { color: theme.colors.secondary, fontSize: 11, lineHeight: 18 },
  hero: { alignItems: 'flex-start', gap: 8, padding: 22, borderRadius: 24, backgroundColor: theme.colors.primaryDark },
  heroIcon: { width: 60, height: 60, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: '#25564D' },
  destination: { color: theme.colors.gold, fontSize: 9, fontWeight: '900', letterSpacing: 1.5, marginTop: 8 },
  title: { color: theme.colors.white, fontSize: 24, lineHeight: 30, fontWeight: '900' }, provider: { color: '#D7E5DD', fontSize: 11 },
  infoRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 13 }, infoItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  infoText: { color: theme.colors.secondary, fontSize: 10 }, price: { color: theme.colors.primaryDark, fontSize: 11, fontWeight: '900' },
  saveButton: { minHeight: 43, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.softMint },
  saveButtonText: { color: theme.colors.primaryDark, fontSize: 11, fontWeight: '900' },
  card: { gap: 10, padding: 17, borderRadius: 19, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  sectionTitle: { color: theme.colors.ink, fontSize: 16, fontWeight: '900' }, body: { color: theme.colors.secondary, fontSize: 12, lineHeight: 20 },
  label: { color: theme.colors.ink, fontSize: 11, fontWeight: '800' }, input: { minHeight: 46, paddingHorizontal: 12, borderRadius: 13, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.background, color: theme.colors.ink, fontSize: 12 },
  messageInput: { minHeight: 100, paddingTop: 12 }, errorText: { color: theme.colors.danger, fontSize: 10, lineHeight: 16 },
  submit: { minHeight: 49, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 15, backgroundColor: theme.colors.primaryDark },
  submitText: { color: theme.colors.white, fontSize: 12, fontWeight: '900' }, disabled: { opacity: 0.5 },
});
