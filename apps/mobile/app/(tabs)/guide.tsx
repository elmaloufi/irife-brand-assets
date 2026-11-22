import { Ionicons } from '@react-native-vector-icons/ionicons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import type { DestinationSummary, ExperienceCard } from '@irife/contracts';
import { AppButton } from '../../src/components/AppButton';
import { AppText as Text } from '../../src/components/AppText';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { getDestinations, getExperiences } from '../../src/services/api/discovery';
import { theme } from '../../src/theme';

export default function GuideScreen() {
  const [destinations, setDestinations] = useState<DestinationSummary[]>([]);
  const [selectedDestinationId, setSelectedDestinationId] = useState<string | null>(null);
  const [experiences, setExperiences] = useState<ExperienceCard[]>([]);
  const [loadingDestinations, setLoadingDestinations] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  useEffect(() => {
    let active = true;
    getDestinations({ page: 1, limit: 50 })
      .then((result) => { if (active) setDestinations(result.data); })
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : 'Could not load destinations.'); })
      .finally(() => { if (active) setLoadingDestinations(false); });
    return () => { active = false; };
  }, []);

  async function buildPlan() {
    if (!selectedDestinationId) {
      setError('Choose a destination to find experiences.');
      return;
    }
    setLoadingPlan(true);
    setError(null);
    setHasGenerated(false);
    try {
      const result = await getExperiences({ page: 1, limit: 20, destinationId: selectedDestinationId });
      setExperiences(result.data);
      setHasGenerated(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not prepare your suggestions.');
    } finally {
      setLoadingPlan(false);
    }
  }

  const selectedDestination = destinations.find((item) => item.id === selectedDestinationId);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.brandIcon}><Ionicons name="sparkles" size={22} color={theme.colors.primaryDark} /></View>
          <View style={styles.brandCopy}>
            <Text style={styles.eyebrow}>ITRI · SMART TRIP PLANNER</Text>
            <Text style={styles.title}>Shape your Morocco journey</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>Choose a city and discover experiences currently published by local hosts on IRIFE.</Text>
      </View>

      <View style={styles.introCard}>
        <Text style={styles.introTitle}>Start with a destination</Text>
        <Text style={styles.introText}>Your suggestions are drawn from the live IRIFE experience catalogue, so every result opens a real experience page.</Text>
        <View style={styles.featureRow}>
          <View style={styles.feature}><Ionicons name="checkmark-circle" size={15} color={theme.colors.primary} /><Text style={styles.featureText}>Published experiences</Text></View>
          <View style={styles.feature}><Ionicons name="map-outline" size={15} color={theme.colors.primary} /><Text style={styles.featureText}>Open full details</Text></View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Where would you like to go?</Text>
          {loadingDestinations ? <ActivityIndicator color={theme.colors.primary} /> : null}
        </View>
        {loadingDestinations ? <View style={styles.loading}><ActivityIndicator color={theme.colors.primary} /><Text style={styles.helper}>Loading destinations…</Text></View> : null}
        {!loadingDestinations && destinations.length === 0 ? <Text style={styles.helper}>No destinations are published yet. Try again when the catalogue is available.</Text> : null}
        <View style={styles.destinationGrid}>
          {destinations.map((destination) => {
            const selected = selectedDestinationId === destination.id;
            return (
              <Pressable key={destination.id} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => { setSelectedDestinationId(destination.id); setHasGenerated(false); setExperiences([]); setError(null); }} style={[styles.destinationChip, selected && styles.destinationChipSelected]}>
                <Ionicons name="location-outline" size={15} color={selected ? theme.colors.white : theme.colors.primary} />
                <Text style={[styles.destinationText, selected && styles.destinationTextSelected]}>{destination.name}</Text>
                {selected ? <Ionicons name="checkmark" size={14} color={theme.colors.white} /> : null}
              </Pressable>
            );
          })}
        </View>
        <AppButton label={loadingPlan ? 'Finding experiences…' : 'Build my suggestions'} icon="sparkles" onPress={() => void buildPlan()} disabled={loadingDestinations || loadingPlan || !selectedDestinationId} />
      </View>

      {error ? <View style={styles.errorCard}><Ionicons name="alert-circle-outline" size={19} color={theme.colors.danger} /><Text style={styles.errorText}>{error}</Text><Pressable onPress={() => void buildPlan()}><Text style={styles.retry}>Try again</Text></Pressable></View> : null}

      {loadingPlan ? <View style={styles.loading}><ActivityIndicator size="large" color={theme.colors.primary} /><Text style={styles.helper}>Finding published experiences…</Text></View> : null}

      {hasGenerated && !loadingPlan ? (
        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <View style={styles.sectionCopy}>
              <Text style={styles.sectionTitle}>{selectedDestination ? 'Experiences in ' + selectedDestination.name : 'Your suggestions'}</Text>
              <Text style={styles.helper}>{experiences.length} published {experiences.length === 1 ? 'experience' : 'experiences'} found</Text>
            </View>
            <Ionicons name="sparkles-outline" size={21} color={theme.colors.gold} />
          </View>
          {experiences.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="compass-outline" size={27} color={theme.colors.primary} />
              <Text style={styles.emptyTitle}>More experiences are on the way</Text>
              <Text style={styles.helper}>No local hosts have published an experience for this destination yet. Choose another city to explore.</Text>
            </View>
          ) : experiences.map((experience) => (
            <Pressable key={experience.id} accessibilityRole="button" onPress={() => router.push(`/experiences/${experience.id}`)} style={({ pressed }) => [styles.experienceCard, pressed && styles.pressed]}>
              <View style={styles.experienceIcon}><Ionicons name="compass-outline" size={22} color={theme.colors.primaryDark} /></View>
              <View style={styles.experienceCopy}>
                <Text style={styles.destinationLabel}>{experience.destination.name.toUpperCase()}</Text>
                <Text style={styles.experienceTitle}>{experience.title}</Text>
                {experience.summary ? <Text style={styles.experienceSummary} numberOfLines={2}>{experience.summary}</Text> : null}
                <Text style={styles.meta}>{experience.durationMinutes ? experience.durationMinutes + ' min · ' : ''}{experience.priceFrom ? 'From ' + experience.priceFrom + ' ' + experience.currency : 'Ask host for price'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.secondary} />
            </Pressable>
          ))}
        </View>
      ) : null}

      <View style={styles.note}>
        <Ionicons name="information-circle-outline" size={17} color={theme.colors.primary} />
        <Text style={styles.noteText}>This version builds suggestions from the published catalogue. Conversational AI itinerary generation will be enabled when the ITRI service is connected.</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { gap: 10 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  brandIcon: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: theme.colors.softMint },
  brandCopy: { flex: 1, gap: 4 },
  eyebrow: { color: theme.colors.primary, fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  title: { color: theme.colors.ink, fontSize: 25, lineHeight: 31, fontWeight: '900' },
  subtitle: { color: theme.colors.secondary, fontSize: 13, lineHeight: 20 },
  introCard: { gap: 10, padding: 18, borderRadius: 22, backgroundColor: theme.colors.hero },
  introTitle: { color: theme.colors.white, fontSize: 19, fontWeight: '900' },
  introText: { color: '#D8E7E1', fontSize: 11, lineHeight: 18 },
  featureRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  featureText: { color: '#E8D8B9', fontSize: 9, fontWeight: '800' },
  section: { gap: 12 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  sectionCopy: { flex: 1, gap: 3 },
  sectionTitle: { color: theme.colors.ink, fontSize: 17, fontWeight: '900' },
  helper: { color: theme.colors.secondary, fontSize: 10, lineHeight: 16 },
  loading: { alignItems: 'center', gap: 9, padding: 18 },
  destinationGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  destinationChip: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  destinationChipSelected: { backgroundColor: theme.colors.primaryDark, borderColor: theme.colors.primaryDark },
  destinationText: { color: theme.colors.ink, fontSize: 11, fontWeight: '800' },
  destinationTextSelected: { color: theme.colors.white },
  errorCard: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 14, backgroundColor: theme.colors.dangerSoft },
  errorText: { flex: 1, color: theme.colors.danger, fontSize: 10, lineHeight: 16 },
  retry: { color: theme.colors.primaryDark, fontSize: 10, fontWeight: '900' },
  emptyCard: { alignItems: 'center', gap: 9, padding: 18, borderRadius: 18, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  emptyTitle: { color: theme.colors.ink, fontSize: 14, fontWeight: '900' },
  experienceCard: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 13, borderRadius: 17, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  experienceIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: theme.colors.softMint },
  experienceCopy: { flex: 1, gap: 4 },
  destinationLabel: { color: theme.colors.primary, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  experienceTitle: { color: theme.colors.ink, fontSize: 12, fontWeight: '900' },
  experienceSummary: { color: theme.colors.secondary, fontSize: 10, lineHeight: 15 },
  meta: { color: theme.colors.primaryDark, fontSize: 9, fontWeight: '800' },
  note: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: 14, backgroundColor: theme.colors.softMint },
  noteText: { flex: 1, color: theme.colors.primaryDark, fontSize: 10, lineHeight: 16 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
});
