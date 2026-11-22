import { Ionicons } from '@react-native-vector-icons/ionicons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import type { DestinationSummary, ExperienceCard } from '@irife/contracts';
import { AppTextInput as TextInput } from '../../src/components/AppTextInput';
import { AppText as Text } from '../../src/components/AppText';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { getDestinations, getExperiences } from '../../src/services/api/discovery';
import { theme } from '../../src/theme';

export default function MapScreen() {
  const [destinations, setDestinations] = useState<DestinationSummary[]>([]);
  const [experiences, setExperiences] = useState<ExperienceCard[]>([]);
  const [selectedDestinationId, setSelectedDestinationId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    Promise.all([
      getDestinations({ page: 1, limit: 50 }),
      getExperiences({ page: 1, limit: 50 }),
    ]).then(([destinationResult, experienceResult]) => {
      if (!active) return;
      setDestinations(destinationResult.data);
      setExperiences(experienceResult.data);
    }).catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : 'Could not load places from IRIFE.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [reloadKey]);

  const filteredDestinations = useMemo(() => destinations.filter((item) => {
    const matchesSelected = !selectedDestinationId || item.id === selectedDestinationId;
    const matchesSearch = !search.trim() || item.name.toLowerCase().includes(search.trim().toLowerCase()) || (item.region ?? '').toLowerCase().includes(search.trim().toLowerCase());
    return matchesSelected && matchesSearch;
  }), [destinations, selectedDestinationId, search]);

  const filteredExperiences = useMemo(() => experiences.filter((item) => {
    const matchesDestination = !selectedDestinationId || item.destination.id === selectedDestinationId;
    const haystack = [item.title, item.summary ?? '', item.destination.name, item.provider.name].join(' ').toLowerCase();
    const matchesSearch = !search.trim() || haystack.includes(search.trim().toLowerCase());
    return matchesDestination && matchesSearch;
  }), [experiences, selectedDestinationId, search]);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>EXPLORE MOROCCO</Text>
          <Text style={styles.title}>Places worth discovering</Text>
          <Text style={styles.subtitle}>Search published destinations and local experiences across Morocco.</Text>
        </View>
        <View style={styles.mapIcon}><Ionicons name="compass" size={22} color={theme.colors.primary} /></View>
      </View>

      <View style={styles.searchShell}>
        <Ionicons name="search-outline" size={19} color={theme.colors.secondary} />
        <TextInput value={search} onChangeText={setSearch} placeholder="Search a city, experience or host" placeholderTextColor={theme.colors.secondary} accessibilityLabel="Search destinations, experiences and hosts" style={styles.searchInput} returnKeyType="search" />
        {search.length > 0 ? <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color={theme.colors.secondary} /></Pressable> : null}
      </View>

      <View style={styles.sectionHeading}>
        <View style={styles.sectionCopy}>
          <Text style={styles.sectionTitle}>Choose an area</Text>
          <Text style={styles.helper}>Filter the catalogue by destination</Text>
        </View>
        {loading ? <ActivityIndicator color={theme.colors.primary} /> : null}
      </View>

      <View style={styles.chips}>
        <Pressable accessibilityRole="button" accessibilityState={{ selected: selectedDestinationId === null }} onPress={() => setSelectedDestinationId(null)} style={[styles.chip, selectedDestinationId === null && styles.chipSelected]}>
          <Text style={[styles.chipText, selectedDestinationId === null && styles.chipTextSelected]}>All Morocco</Text>
        </Pressable>
        {destinations.map((destination) => {
          const selected = selectedDestinationId === destination.id;
          return <Pressable key={destination.id} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => setSelectedDestinationId(selected ? null : destination.id)} style={[styles.chip, selected && styles.chipSelected]}>
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{destination.name}</Text>
          </Pressable>;
        })}
      </View>

      {error ? <View style={styles.notice}><Ionicons name="cloud-offline-outline" size={22} color={theme.colors.danger} /><Text style={styles.noticeTitle}>Could not load the IRIFE catalogue</Text><Text style={styles.noticeText}>{error}</Text><Pressable style={styles.retryButton} onPress={() => setReloadKey((value) => value + 1)}><Text style={styles.retryText}>Try again</Text></Pressable></View> : null}

      {loading ? <View style={styles.loading}><ActivityIndicator size="large" color={theme.colors.primary} /><Text style={styles.helper}>Loading destinations and experiences…</Text></View> : null}

      {!loading && !error ? (
        <>
          <View style={styles.sectionHeading}>
            <View style={styles.sectionCopy}>
              <Text style={styles.sectionTitle}>Destinations</Text>
              <Text style={styles.helper}>{filteredDestinations.length} {filteredDestinations.length === 1 ? 'place' : 'places'} found</Text>
            </View>
            <Ionicons name="location-outline" size={19} color={theme.colors.primary} />
          </View>
          {filteredDestinations.length === 0 ? <Text style={styles.emptyText}>No destinations match this search.</Text> : filteredDestinations.map((destination) => (
            <Pressable key={destination.id} accessibilityRole="button" onPress={() => setSelectedDestinationId(destination.id)} style={({ pressed }) => [styles.destinationCard, pressed && styles.pressed]}>
              <View style={styles.destinationIcon}><Ionicons name="location" size={20} color={theme.colors.primaryDark} /></View>
              <View style={styles.destinationCopy}>
                <Text style={styles.destinationTitle}>{destination.name}</Text>
                <Text style={styles.destinationSummary}>{destination.summary || destination.region || 'Discover local places and experiences.'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.secondary} />
            </Pressable>
          ))}

          <View style={styles.sectionHeading}>
            <View style={styles.sectionCopy}>
              <Text style={styles.sectionTitle}>Experiences nearby in the catalogue</Text>
              <Text style={styles.helper}>{filteredExperiences.length} published {filteredExperiences.length === 1 ? 'experience' : 'experiences'}</Text>
            </View>
            <Ionicons name="sparkles-outline" size={19} color={theme.colors.gold} />
          </View>
          {filteredExperiences.length === 0 ? <View style={styles.notice}><Ionicons name="compass-outline" size={23} color={theme.colors.primary} /><Text style={styles.noticeTitle}>No published experiences yet</Text><Text style={styles.noticeText}>Try another destination or clear your search. New experiences will appear here when local hosts publish them.</Text></View> : filteredExperiences.map((experience) => (
            <Pressable key={experience.id} accessibilityRole="button" onPress={() => router.push(`/experiences/${experience.id}`)} style={({ pressed }) => [styles.experienceCard, pressed && styles.pressed]}>
              <View style={styles.experienceIcon}><Ionicons name="compass-outline" size={21} color={theme.colors.primaryDark} /></View>
              <View style={styles.experienceCopy}>
                <Text style={styles.destinationLabel}>{experience.destination.name.toUpperCase()}</Text>
                <Text style={styles.experienceTitle}>{experience.title}</Text>
                {experience.summary ? <Text style={styles.experienceSummary} numberOfLines={2}>{experience.summary}</Text> : null}
                <Text style={styles.meta}>{experience.provider.name} · {experience.priceFrom ? 'From ' + experience.priceFrom + ' ' + experience.currency : 'Ask host for price'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.secondary} />
            </Pressable>
          ))}
        </>
      ) : null}

      <View style={styles.mapStatus}>
        <Ionicons name="map-outline" size={17} color={theme.colors.primary} />
        <Text style={styles.mapStatusText}>Interactive map and turn-by-turn routes are a separate integration. This screen currently shows live IRIFE catalogue data and does not display a fake map.</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  headerCopy: { flex: 1, gap: 7 },
  eyebrow: { color: theme.colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  title: { color: theme.colors.ink, fontSize: 27, lineHeight: 34, fontWeight: '900' },
  subtitle: { color: theme.colors.secondary, fontSize: 13, lineHeight: 19 },
  mapIcon: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: theme.colors.softMint },
  searchShell: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  searchInput: { flex: 1, minHeight: 50, color: theme.colors.ink, fontSize: 12, paddingVertical: 8 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  sectionCopy: { flex: 1, gap: 3 },
  sectionTitle: { color: theme.colors.ink, fontSize: 16, fontWeight: '900' },
  helper: { color: theme.colors.secondary, fontSize: 10, lineHeight: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minHeight: 36, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 13, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  chipSelected: { backgroundColor: theme.colors.primaryDark, borderColor: theme.colors.primaryDark },
  chipText: { color: theme.colors.secondary, fontSize: 10, fontWeight: '800' },
  chipTextSelected: { color: theme.colors.white },
  destinationCard: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: 11, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  destinationIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: theme.colors.softMint },
  destinationCopy: { flex: 1, gap: 4 },
  destinationTitle: { color: theme.colors.ink, fontSize: 13, fontWeight: '900' },
  destinationSummary: { color: theme.colors.secondary, fontSize: 10, lineHeight: 15 },
  experienceCard: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 13, borderRadius: 17, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  experienceIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: theme.colors.softMint },
  experienceCopy: { flex: 1, gap: 4 },
  destinationLabel: { color: theme.colors.primary, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  experienceTitle: { color: theme.colors.ink, fontSize: 12, fontWeight: '900' },
  experienceSummary: { color: theme.colors.secondary, fontSize: 10, lineHeight: 15 },
  meta: { color: theme.colors.primaryDark, fontSize: 9, fontWeight: '800' },
  notice: { alignItems: 'flex-start', gap: 8, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  noticeTitle: { color: theme.colors.ink, fontSize: 13, fontWeight: '900' },
  noticeText: { color: theme.colors.secondary, fontSize: 10, lineHeight: 16 },
  retryButton: { minHeight: 37, justifyContent: 'center', paddingHorizontal: 13, borderRadius: 12, backgroundColor: theme.colors.primaryDark },
  retryText: { color: theme.colors.white, fontSize: 10, fontWeight: '900' },
  loading: { alignItems: 'center', gap: 10, padding: 22 },
  emptyText: { color: theme.colors.secondary, fontSize: 11, padding: 12 },
  mapStatus: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: 14, backgroundColor: theme.colors.softMint },
  mapStatusText: { flex: 1, color: theme.colors.primaryDark, fontSize: 9, lineHeight: 15 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
});
