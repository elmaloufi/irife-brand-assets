import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text as NativeText,
  View,
} from 'react-native';
import { AppText as Text } from '../../src/components/AppText';
import type { DestinationSummary, ExperienceCard } from '@irife/contracts';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { getDestinations, getExperiences } from '../../src/services/api/discovery';
import { theme } from '../../src/theme';

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong while loading discovery.';
}

export default function DiscoverScreen() {
  const [destinations, setDestinations] = useState<DestinationSummary[]>([]);
  const [experiences, setExperiences] = useState<ExperienceCard[]>([]);
  const [selectedDestinationId, setSelectedDestinationId] = useState<string | null>(null);
  const [destinationsLoading, setDestinationsLoading] = useState(true);
  const [experiencesLoading, setExperiencesLoading] = useState(true);
  const [destinationsError, setDestinationsError] = useState<string | null>(null);
  const [experiencesError, setExperiencesError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setDestinationsLoading(true);
    setDestinationsError(null);

    getDestinations({ page: 1, limit: 50 })
      .then((result) => {
        if (active) setDestinations(result.data);
      })
      .catch((error: unknown) => {
        if (active) setDestinationsError(messageOf(error));
      })
      .finally(() => {
        if (active) setDestinationsLoading(false);
      });

    return () => { active = false; };
  }, [reloadKey]);

  useEffect(() => {
    let active = true;
    setExperiencesLoading(true);
    setExperiencesError(null);

    getExperiences({
      page: 1,
      limit: 20,
      ...(selectedDestinationId ? { destinationId: selectedDestinationId } : {}),
    })
      .then((result) => {
        if (active) setExperiences(result.data);
      })
      .catch((error: unknown) => {
        if (active) setExperiencesError(messageOf(error));
      })
      .finally(() => {
        if (active) setExperiencesLoading(false);
      });

    return () => { active = false; };
  }, [selectedDestinationId, reloadKey]);

  const selectedDestination = destinations.find(
    (destination) => destination.id === selectedDestinationId,
  );

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>DISCOVER WITH IRIFE</Text>
        <Text style={styles.title}>Find your Morocco.</Text>
        <Text style={styles.subtitle}>
          Explore places and experiences shared by local providers.
        </Text>
      </View>

      <Link href="/(tabs)/map" asChild>
        <Pressable style={({ pressed }) => [styles.search, pressed && styles.pressed]}>
          <Ionicons name="map-outline" size={19} color={theme.colors.primary} />
          <Text style={styles.searchText}>Explore Morocco on the map</Text>
          <View style={styles.searchAction}>
            <Ionicons name="arrow-forward" size={15} color={theme.colors.white} />
          </View>
        </Pressable>
      </Link>

      <View style={styles.sectionHeading}>
        <View>
          <Text style={styles.sectionTitle}>Choose a destination</Text>
          <Text style={styles.sectionSubtitle}>Browse the places currently published on IRIFE</Text>
        </View>
        {destinationsLoading && <ActivityIndicator color={theme.colors.primary} />}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.destinationList}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: selectedDestinationId === null }}
          onPress={() => setSelectedDestinationId(null)}
          style={[styles.destinationChip, selectedDestinationId === null && styles.destinationChipSelected]}
        >
          <Text style={[styles.destinationChipText, selectedDestinationId === null && styles.destinationChipTextSelected]}>
            All places
          </Text>
        </Pressable>
        {destinations.map((destination) => {
          const selected = selectedDestinationId === destination.id;
          return (
            <Pressable
              key={destination.id}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setSelectedDestinationId(destination.id)}
              style={[styles.destinationChip, selected && styles.destinationChipSelected]}
            >
              <Text style={[styles.destinationChipText, selected && styles.destinationChipTextSelected]}>
                {destination.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {destinationsError ? (
        <View style={styles.noticeCard}>
          <Ionicons name="cloud-offline-outline" size={24} color={theme.colors.danger} />
          <Text style={styles.noticeTitle}>Could not connect to IRIFE</Text>
          <Text style={styles.noticeText}>{destinationsError}</Text>
          <Pressable style={styles.retryButton} onPress={() => setReloadKey((value) => value + 1)}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : !destinationsLoading && destinations.length === 0 ? (
        <View style={styles.noticeCard}>
          <Ionicons name="compass-outline" size={25} color={theme.colors.primary} />
          <Text style={styles.noticeTitle}>Destinations are being prepared</Text>
          <Text style={styles.noticeText}>
            The catalogue will appear here when destinations are published by the IRIFE team.
          </Text>
        </View>
      ) : null}

      <View style={styles.sectionHeading}>
        <View>
          <Text style={styles.sectionTitle}>
            {selectedDestination ? `Experiences in ${selectedDestination.name}` : 'Experiences to discover'}
          </Text>
          <Text style={styles.sectionSubtitle}>Published experiences from active local providers</Text>
        </View>
        {experiencesLoading && <ActivityIndicator color={theme.colors.primary} />}
      </View>

      {experiencesError ? (
        <View style={styles.noticeCard}>
          <Ionicons name="alert-circle-outline" size={24} color={theme.colors.danger} />
          <Text style={styles.noticeTitle}>Experiences are unavailable</Text>
          <Text style={styles.noticeText}>{experiencesError}</Text>
          <Pressable style={styles.retryButton} onPress={() => setReloadKey((value) => value + 1)}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : experiencesLoading ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.noticeText}>Loading published experiences…</Text>
        </View>
      ) : experiences.length === 0 ? (
        <View style={styles.noticeCard}>
          <View style={styles.emptyIcon}>
            <Ionicons name="sparkles-outline" size={23} color={theme.colors.primary} />
          </View>
          <Text style={styles.noticeTitle}>New experiences are on their way</Text>
          <Text style={styles.noticeText}>
            {selectedDestination
              ? 'There are no published experiences for this destination yet.'
              : 'No experiences have been published yet. Check back as local providers join IRIFE.'}
          </Text>
        </View>
      ) : (
        <View style={styles.experienceList}>
          {experiences.map((experience) => (
            <View key={experience.id} style={styles.experienceCard}>
              <View style={styles.experienceArt}>
                <View style={styles.artSun} />
                <View style={styles.artArch} />
                <Ionicons name="compass-outline" size={25} color={theme.colors.white} />
              </View>
              <View style={styles.experienceCopy}>
                <Text style={styles.experienceLocation}>{experience.destination.name.toUpperCase()}</Text>
                <Text style={styles.experienceTitle}>{experience.title}</Text>
                {!!experience.summary && <Text style={styles.experienceSummary}>{experience.summary}</Text>}
                <View style={styles.experienceMeta}>
                  <Text style={styles.metaText}>{experience.provider.name}</Text>
                  {experience.durationMinutes !== null && (
                    <Text style={styles.metaText}>{experience.durationMinutes} min</Text>
                  )}
                </View>
                <Text style={styles.priceText}>
                  {experience.priceFrom ? `From ${experience.priceFrom} ${experience.currency}` : 'Contact provider for price'}
                </Text>
                <Link href={`/experiences/${experience.id}`} asChild>
                  <Pressable style={styles.detailsButton}>
                    <Text style={styles.detailsButtonText}>View experience</Text>
                    <Ionicons name="arrow-forward" size={14} color={theme.colors.primary} />
                  </Pressable>
                </Link>
              </View>
            </View>
          ))}
        </View>
      )}

      <Link href="/(tabs)/map" asChild>
        <Pressable style={styles.mapLink}>
          <Text style={styles.mapLinkText}>Explore the Smart Map</Text>
          <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
        </Pressable>
      </Link>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { gap: 8 },
  eyebrow: { color: theme.colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  title: { color: theme.colors.ink, fontSize: 29, lineHeight: 35, fontWeight: '900' },
  subtitle: { color: theme.colors.secondary, fontSize: 13, lineHeight: 20 },
  search: {
    minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 11,
    paddingLeft: 15, paddingRight: 8, borderRadius: 18, borderWidth: 1,
    borderColor: theme.colors.border, backgroundColor: theme.colors.surface,
  },
  searchText: { flex: 1, color: theme.colors.secondary, fontSize: 12 },
  searchAction: {
    width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, backgroundColor: theme.colors.primary,
  },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  sectionTitle: { color: theme.colors.ink, fontSize: 17, fontWeight: '900' },
  sectionSubtitle: { color: theme.colors.secondary, fontSize: 10, marginTop: 4 },
  destinationList: { gap: 8, paddingVertical: 2 },
  destinationChip: {
    minHeight: 39, justifyContent: 'center', paddingHorizontal: 14,
    borderRadius: theme.radius.pill, borderWidth: 1, borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  destinationChipSelected: { borderColor: theme.colors.primaryDark, backgroundColor: theme.colors.primaryDark },
  destinationChipText: { color: theme.colors.secondary, fontSize: 10, fontWeight: '800' },
  destinationChipTextSelected: { color: theme.colors.white },
  noticeCard: {
    alignItems: 'flex-start', gap: 9, padding: 18, borderRadius: 21,
    borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface,
  },
  noticeTitle: { color: theme.colors.ink, fontSize: 14, fontWeight: '900' },
  noticeText: { color: theme.colors.secondary, fontSize: 11, lineHeight: 17 },
  retryButton: {
    minHeight: 38, justifyContent: 'center', paddingHorizontal: 14,
    borderRadius: 12, backgroundColor: theme.colors.primaryDark,
  },
  retryText: { color: theme.colors.white, fontSize: 11, fontWeight: '900' },
  loadingCard: { alignItems: 'center', gap: 12, padding: 28 },
  emptyIcon: {
    width: 45, height: 45, alignItems: 'center', justifyContent: 'center',
    borderRadius: 15, backgroundColor: theme.colors.softMint,
  },
  experienceList: { gap: 14 },
  detailsButton: { minHeight: 35, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 9, borderRadius: 11, backgroundColor: theme.colors.softMint },
  detailsButtonText: { color: theme.colors.primaryDark, fontSize: 10, fontWeight: '900' },
  experienceCard: {
    overflow: 'hidden', borderRadius: 22, borderWidth: 1,
    borderColor: theme.colors.border, backgroundColor: theme.colors.surface,
  },
  experienceArt: {
    height: 112, overflow: 'hidden', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', backgroundColor: theme.colors.primaryDark,
  },
  artSun: {
    position: 'absolute', width: 76, height: 76, top: 14, right: 34,
    borderRadius: 38, backgroundColor: theme.colors.gold, opacity: 0.95,
  },
  artArch: {
    position: 'absolute', width: 112, height: 154, bottom: -82,
    borderTopLeftRadius: 60, borderTopRightRadius: 60,
    borderWidth: 13, borderColor: theme.colors.terracotta, backgroundColor: '#F4E9D9',
  },
  experienceCopy: { padding: 16, gap: 7 },
  experienceLocation: { color: theme.colors.primary, fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  experienceTitle: { color: theme.colors.ink, fontSize: 17, fontWeight: '900' },
  experienceSummary: { color: theme.colors.secondary, fontSize: 11, lineHeight: 17 },
  experienceMeta: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  metaText: { color: theme.colors.secondary, fontSize: 10, fontWeight: '700' },
  priceText: { color: theme.colors.primaryDark, fontSize: 12, fontWeight: '900', marginTop: 2 },
  mapLink: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  mapLinkText: { color: theme.colors.primary, fontSize: 11, fontWeight: '900' },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
});
