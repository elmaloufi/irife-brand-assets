import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';
import type { DestinationSummary, ExperienceCard } from '@irife/contracts';
import { AppButton } from '../../src/components/AppButton';
import { AppText as Text } from '../../src/components/AppText';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { getDestinations, getExperiences } from '../../src/services/api/discovery';
import { theme } from '../../src/theme';

export default function HomeScreen() {
  const router = useRouter();
  const [destinations, setDestinations] = useState<DestinationSummary[]>([]);
  const [experiences, setExperiences] = useState<ExperienceCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    Promise.all([
      getDestinations({ page: 1, limit: 6 }),
      getExperiences({ page: 1, limit: 4 }),
    ]).then(([destinationResult, experienceResult]) => {
      if (!active) return;
      setDestinations(destinationResult.data);
      setExperiences(experienceResult.data);
    }).catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : 'Could not load the IRIFE catalogue.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [reloadKey]);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={styles.brandMark}><Ionicons name="compass" size={23} color={theme.colors.gold} /></View>
          <View>
            <Text style={styles.brandName}>IRIFE</Text>
            <Text style={styles.brandCaption}>MADE FOR YOUR JOURNEY</Text>
          </View>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Open account settings" onPress={() => router.push('/settings')} style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={20} color={theme.colors.primaryDark} />
        </Pressable>
      </View>

      <View style={styles.intro}>
        <View style={styles.welcomeLine}><View style={styles.welcomeDot} /><Text style={styles.eyebrow}>YOUR NEXT STORY STARTS HERE</Text></View>
        <Text style={styles.title}>Find your kind of Morocco.</Text>
        <Text style={styles.subtitle}>Discover places, people and experiences that make every journey yours.</Text>
      </View>

      <Pressable accessibilityRole="button" accessibilityLabel="Explore destinations" onPress={() => router.push('/(tabs)/discover')} style={({ pressed }) => [styles.search, pressed && styles.pressed]}>
        <Ionicons name="search-outline" size={20} color={theme.colors.primary} />
        <Text style={styles.searchText}>Where would you like to explore?</Text>
        <View style={styles.searchAction}><Ionicons name="arrow-forward" size={16} color={theme.colors.white} /></View>
      </Pressable>

      <View style={styles.hero}>
        <View style={styles.heroOrb} />
        <View style={styles.heroContent}>
          <View style={styles.heroTag}><Ionicons name="sparkles" size={13} color={theme.colors.primaryDark} /><Text style={styles.heroTagText}>YOUR JOURNEY, YOUR WAY</Text></View>
          <Text style={styles.heroTitle}>Let Morocco surprise you.</Text>
          <Text style={styles.heroDescription}>Build a shortlist from real local experiences and shape a journey at your own pace.</Text>
          <AppButton label="Plan my journey" icon="arrow-forward" onPress={() => router.push('/(tabs)/guide')} />
        </View>
      </View>

      {error ? <View style={styles.notice}><Ionicons name="cloud-offline-outline" size={22} color={theme.colors.danger} /><Text style={styles.noticeTitle}>IRIFE catalogue is unavailable</Text><Text style={styles.noticeText}>{error}</Text><Pressable onPress={() => setReloadKey((value) => value + 1)} style={styles.retry}><Text style={styles.retryText}>Try again</Text></Pressable></View> : null}

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <View style={styles.sectionCopy}><Text style={styles.sectionEyebrow}>START EXPLORING</Text><Text style={styles.sectionTitle}>Discover destinations</Text></View>
          <Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/discover')} style={styles.seeAll}><Text style={styles.seeAllText}>See all</Text><Ionicons name="arrow-forward" size={15} color={theme.colors.primary} /></Pressable>
        </View>
        {loading ? <View style={styles.loading}><ActivityIndicator color={theme.colors.primary} /><Text style={styles.helper}>Loading destinations…</Text></View> : destinations.length === 0 ? <View style={styles.notice}><Ionicons name="compass-outline" size={22} color={theme.colors.primary} /><Text style={styles.noticeTitle}>Destinations are being prepared</Text><Text style={styles.noticeText}>Published destinations will appear here as the IRIFE catalogue grows.</Text></View> : (
          <View style={styles.destinationGrid}>
            {destinations.slice(0, 4).map((destination, index) => (
              <Pressable
                key={destination.id}
                accessibilityRole="button"
                accessibilityLabel={`Explore ${destination.name}`}
                onPress={() => router.push('/(tabs)/discover')}
                style={({ pressed }) => [styles.destinationCard, pressed && styles.pressed]}
              >
                <View style={[styles.destinationArtwork, index % 2 === 0 ? styles.destinationArtworkOlive : styles.destinationArtworkClay]}>
                  <View style={styles.destinationSun} />
                  <View style={styles.destinationArch}>
                    <View style={styles.destinationArchInner} />
                  </View>
                  <View style={styles.destinationArtDiamond} />
                </View>
                <View style={styles.destinationCardCopy}>
                  <Text style={styles.destinationRegion}>{destination.region || 'MOROCCO'}</Text>
                  <Text style={styles.destinationName}>{destination.name}</Text>
                  {destination.summary ? <Text style={styles.destinationSummary} numberOfLines={2}>{destination.summary}</Text> : null}
                  <View style={styles.destinationCardFooter}>
                    <Text style={styles.destinationExplore}>EXPLORE</Text>
                    <Ionicons name="arrow-forward" size={13} color={theme.colors.primary} />
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <View style={styles.sectionCopy}><Text style={styles.sectionEyebrow}>FROM LOCAL HOSTS</Text><Text style={styles.sectionTitle}>Experiences to discover</Text></View>
          <Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/discover')} style={styles.seeAll}><Text style={styles.seeAllText}>See all</Text><Ionicons name="arrow-forward" size={15} color={theme.colors.primary} /></Pressable>
        </View>
        {loading ? <View style={styles.loading}><ActivityIndicator color={theme.colors.primary} /><Text style={styles.helper}>Loading experiences…</Text></View> : experiences.length === 0 ? <Text style={styles.helper}>New experiences will appear here when local hosts publish them.</Text> : experiences.map((experience) => (
          <Pressable key={experience.id} accessibilityRole="button" onPress={() => router.push(`/experiences/${experience.id}`)} style={({ pressed }) => [styles.experienceCard, pressed && styles.pressed]}>
            {experience.media[0]?.url ? <Image source={{ uri: experience.media[0].url }} accessibilityLabel={experience.media[0].altText || experience.title} style={styles.experienceImage} /> : <View style={styles.experienceImageFallback}><Ionicons name="compass-outline" size={24} color={theme.colors.gold} /></View>}
            <View style={styles.experienceCopy}>
              <Text style={styles.experienceLocation}>{experience.destination.name.toUpperCase()}</Text>
              <Text style={styles.experienceTitle}>{experience.title}</Text>
              {experience.summary ? <Text style={styles.experienceSummary} numberOfLines={2}>{experience.summary}</Text> : null}
              <Text style={styles.experienceMeta}>{experience.priceFrom ? 'From ' + experience.priceFrom + ' ' + experience.currency : 'Contact host for price'} · {experience.provider.name}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.secondary} />
          </Pressable>
        ))}
      </View>

      <Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/map')} style={styles.mapCard}>
        <View style={styles.mapCardIcon}><Ionicons name="map-outline" size={22} color={theme.colors.primaryDark} /></View>
        <View style={styles.mapCardCopy}><Text style={styles.mapCardEyebrow}>EXPLORE BY PLACE</Text><Text style={styles.mapCardTitle}>Browse Morocco by destination</Text><Text style={styles.mapCardDescription}>Search the live catalogue of destinations and experiences.</Text></View>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.primary} />
      </Pressable>

      <Text style={styles.footer}>A more thoughtful way to discover Morocco.</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(215,175,110,0.72)', backgroundColor: theme.colors.primaryDark },
  brandName: { color: theme.colors.ink, fontSize: 16, fontWeight: '900', letterSpacing: 2.2 },
  brandCaption: { marginTop: 2, color: theme.colors.secondary, fontSize: 8, fontWeight: '800', letterSpacing: 1.1 },
  settingsButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: theme.colors.softMint, borderWidth: 1, borderColor: theme.colors.border },
  intro: { gap: 8, paddingTop: 5 },
  welcomeLine: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  welcomeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.terracotta },
  eyebrow: { color: theme.colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  title: { maxWidth: 330, color: theme.colors.ink, fontSize: 32, lineHeight: 38, fontWeight: '900', letterSpacing: -0.7 },
  subtitle: { color: theme.colors.secondary, fontSize: 13, lineHeight: 20 },
  search: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 11, paddingLeft: 15, paddingRight: 8, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 18, backgroundColor: theme.colors.surface },
  searchText: { flex: 1, color: theme.colors.secondary, fontSize: 12 },
  searchAction: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: theme.colors.primary },
  hero: { minHeight: 230, justifyContent: 'center', overflow: 'hidden', padding: 20, borderRadius: 25, backgroundColor: theme.colors.hero },
  heroOrb: { position: 'absolute', width: 190, height: 190, right: -65, top: -80, borderRadius: 95, backgroundColor: '#66664A', opacity: 0.7 },
  heroContent: { gap: 10 },
  heroTag: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 99, backgroundColor: theme.colors.heroAccent },
  heroTagText: { color: theme.colors.primaryDark, fontSize: 8, fontWeight: '900', letterSpacing: 0.7 },
  heroTitle: { maxWidth: 270, color: theme.colors.white, fontSize: 25, lineHeight: 31, fontWeight: '900' },
  heroDescription: { maxWidth: 300, color: '#F3EBDD', fontSize: 11, lineHeight: 17 },
  section: { gap: 13 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  sectionCopy: { flex: 1, gap: 3 },
  sectionEyebrow: { color: theme.colors.primary, fontSize: 8, fontWeight: '900', letterSpacing: 1.2 },
  sectionTitle: { color: theme.colors.ink, fontSize: 18, fontWeight: '900' },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  seeAllText: { color: theme.colors.primary, fontSize: 10, fontWeight: '900' },
  loading: { alignItems: 'center', gap: 8, padding: 18 },
  helper: { color: theme.colors.secondary, fontSize: 10, lineHeight: 16 },
  notice: { alignItems: 'flex-start', gap: 8, padding: 15, borderRadius: 18, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  noticeTitle: { color: theme.colors.ink, fontSize: 13, fontWeight: '900' },
  noticeText: { color: theme.colors.secondary, fontSize: 10, lineHeight: 16 },
  retry: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 11, backgroundColor: theme.colors.primaryDark },
  retryText: { color: theme.colors.white, fontSize: 10, fontWeight: '900' },
  destinationGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  destinationCard: { width: '48%', minHeight: 202, overflow: 'hidden', borderRadius: 22, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, shadowColor: theme.colors.primaryDark, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 2 },
  destinationArtwork: { height: 94, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  destinationArtworkOlive: { backgroundColor: theme.colors.olive },
  destinationArtworkClay: { backgroundColor: theme.colors.terracotta },
  destinationSun: { position: 'absolute', width: 54, height: 54, top: 12, right: 18, borderRadius: 27, backgroundColor: theme.colors.heroAccent, opacity: 0.9 },
  destinationArch: { position: 'absolute', bottom: 0, width: 62, height: 76, alignItems: 'center', justifyContent: 'flex-end', borderWidth: 2, borderBottomWidth: 0, borderColor: 'rgba(255,252,246,0.78)', borderTopLeftRadius: 34, borderTopRightRadius: 34 },
  destinationArchInner: { width: 30, height: 42, borderWidth: 1.5, borderBottomWidth: 0, borderColor: 'rgba(255,252,246,0.72)', borderTopLeftRadius: 17, borderTopRightRadius: 17 },
  destinationArtDiamond: { position: 'absolute', top: 14, width: 7, height: 7, borderRadius: 1, backgroundColor: theme.colors.white, transform: [{ rotate: '45deg' }] },
  destinationCardCopy: { flex: 1, gap: 5, padding: 13 },
  destinationName: { color: theme.colors.ink, fontSize: 14, fontWeight: '900' },
  destinationRegion: { color: theme.colors.primary, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  destinationSummary: { color: theme.colors.secondary, fontSize: 9, lineHeight: 14 },
  destinationCardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 4 },
  destinationExplore: { color: theme.colors.primary, fontSize: 8, fontWeight: '900', letterSpacing: 1.1 },
  experienceCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 11, borderRadius: 17, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  experienceImage: { width: 72, height: 76, borderRadius: 12, backgroundColor: theme.colors.softMint },
  experienceImageFallback: { width: 72, height: 76, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: theme.colors.primaryDark },
  experienceCopy: { flex: 1, gap: 4 },
  experienceLocation: { color: theme.colors.primary, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  experienceTitle: { color: theme.colors.ink, fontSize: 12, fontWeight: '900' },
  experienceSummary: { color: theme.colors.secondary, fontSize: 9, lineHeight: 14 },
  experienceMeta: { color: theme.colors.primaryDark, fontSize: 9, fontWeight: '800' },
  mapCard: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 14, borderRadius: 18, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.softMint },
  mapCardIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: theme.colors.white },
  mapCardCopy: { flex: 1, gap: 3 },
  mapCardEyebrow: { color: theme.colors.primary, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  mapCardTitle: { color: theme.colors.primaryDark, fontSize: 12, fontWeight: '900' },
  mapCardDescription: { color: theme.colors.secondary, fontSize: 9, lineHeight: 14 },
  footer: { color: theme.colors.secondary, fontSize: 9, textAlign: 'center', paddingBottom: 8 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
});
