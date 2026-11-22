import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Link, router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from '../src/components/AppText';
import type { SavedExperienceSummary } from '@irife/contracts';
import { useAuth } from '../src/auth/AuthProvider';
import { ScreenContainer } from '../src/components/ScreenContainer';
import { getMySavedExperiences, removeSavedExperience } from '../src/services/api/saved';
import { theme } from '../src/theme';

export default function SavedScreen() {
  const { user, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<SavedExperienceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(async () => {
    if (!user) { setItems([]); setLoading(false); return; }
    setLoading(true); setError(null);
    try { setItems(await getMySavedExperiences()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Your saved experiences could not be loaded.'); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { void load(); }, [load, reloadKey]);

  async function remove(experienceId: string) {
    setRemovingId(experienceId); setError(null);
    try {
      await removeSavedExperience(experienceId);
      setItems((current) => current.filter((item) => item.experience.id !== experienceId));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not remove this saved experience.');
    } finally { setRemovingId(null); }
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>YOUR PERSONAL COLLECTION</Text>
        <Text style={styles.title}>Saved places & trips</Text>
        <Text style={styles.subtitle}>Keep the experiences you want to return to, all in one place.</Text>
      </View>

      {authLoading || loading ? <View style={styles.loading}><ActivityIndicator size="large" color={theme.colors.primary} /><Text style={styles.description}>Loading your collection…</Text></View> : null}

      {!authLoading && !user ? (
        <View style={styles.emptyCard}>
          <View style={styles.iconWrap}><Ionicons name="bookmark-outline" size={28} color={theme.colors.primary} /></View>
          <Text style={styles.emptyTitle}>Sign in to build your collection</Text>
          <Text style={styles.description}>Saved experiences are private to your traveler account.</Text>
          <Pressable accessibilityRole="button" onPress={() => router.push('/auth/sign-in')} style={styles.primary}><Text style={styles.primaryText}>Sign in</Text></Pressable>
        </View>
      ) : null}

      {error ? <View style={styles.emptyCard}><Ionicons name="cloud-offline-outline" size={25} color={theme.colors.danger} /><Text style={styles.emptyTitle}>Could not load your collection</Text><Text style={styles.description}>{error}</Text><Pressable onPress={() => setReloadKey((value) => value + 1)} style={styles.primary}><Text style={styles.primaryText}>Try again</Text></Pressable></View> : null}

      {!authLoading && user && !loading && !error && items.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.iconWrap}><Ionicons name="bookmark-outline" size={28} color={theme.colors.primary} /></View>
          <Text style={styles.emptyTitle}>Your collection starts here</Text>
          <Text style={styles.description}>Open any published experience and tap Save to keep it here for later.</Text>
          <Link href="/(tabs)/discover" asChild><Pressable style={styles.secondary}><Text style={styles.secondaryText}>Explore experiences</Text><Ionicons name="arrow-forward" size={15} color={theme.colors.primaryDark} /></Pressable></Link>
        </View>
      ) : null}

      {!loading && items.length > 0 ? <View style={styles.list}>
        {items.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.iconWrap}><Ionicons name="bookmark" size={22} color={theme.colors.primary} /></View>
            <View style={styles.copy}>
              <Text style={styles.destination}>{item.experience.destination.name.toUpperCase()}</Text>
              <Text style={styles.cardTitle}>{item.experience.title}</Text>
              <Text style={styles.provider}>Hosted by {item.experience.provider.name}</Text>
              {item.experience.priceFrom ? <Text style={styles.price}>From {item.experience.priceFrom} {item.experience.currency}</Text> : null}
            </View>
            <View style={styles.actions}>
              <Link href={{ pathname: '/experiences/[id]', params: { id: item.experience.id } }} asChild><Pressable accessibilityRole="button" style={styles.openButton}><Ionicons name="arrow-forward" size={17} color={theme.colors.primary} /></Pressable></Link>
              <Pressable accessibilityRole="button" accessibilityLabel="Remove saved experience" disabled={removingId === item.experience.id} onPress={() => void remove(item.experience.id)} style={styles.removeButton}>
                {removingId === item.experience.id ? <ActivityIndicator size="small" color={theme.colors.danger} /> : <Ionicons name="bookmark" size={17} color={theme.colors.danger} />}
              </Pressable>
            </View>
          </View>
        ))}
      </View> : null}

      <Link href="/(tabs)/profile" asChild><Pressable style={styles.backLink}><Ionicons name="person-outline" size={16} color={theme.colors.primary} /><Text style={styles.backText}>Back to your account</Text></Pressable></Link>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header:{gap:8},eyebrow:{color:theme.colors.primary,fontSize:10,fontWeight:'900',letterSpacing:1.3},title:{color:theme.colors.ink,fontSize:28,lineHeight:34,fontWeight:'900'},subtitle:{color:theme.colors.secondary,fontSize:13,lineHeight:20},
  loading:{minHeight:130,alignItems:'center',justifyContent:'center',gap:10},description:{color:theme.colors.secondary,fontSize:11,lineHeight:18,textAlign:'center'},
  emptyCard:{alignItems:'center',gap:12,padding:24,borderRadius:22,borderWidth:1,borderColor:theme.colors.border,backgroundColor:theme.colors.surface},
  iconWrap:{width:54,height:54,alignItems:'center',justifyContent:'center',borderRadius:18,backgroundColor:theme.colors.softMint},
  emptyTitle:{color:theme.colors.ink,fontSize:16,fontWeight:'900',textAlign:'center'},
  primary:{minHeight:44,minWidth:145,alignItems:'center',justifyContent:'center',paddingHorizontal:18,borderRadius:14,backgroundColor:theme.colors.primaryDark},primaryText:{color:theme.colors.white,fontSize:11,fontWeight:'900'},
  secondary:{minHeight:43,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,paddingHorizontal:15,borderRadius:14,backgroundColor:theme.colors.softMint},secondaryText:{color:theme.colors.primaryDark,fontSize:11,fontWeight:'900'},
  list:{gap:12},card:{flexDirection:'row',alignItems:'center',gap:12,padding:14,borderRadius:18,borderWidth:1,borderColor:theme.colors.border,backgroundColor:theme.colors.surface},
  copy:{flex:1,gap:4},destination:{color:theme.colors.primary,fontSize:9,fontWeight:'900',letterSpacing:1},cardTitle:{color:theme.colors.ink,fontSize:13,fontWeight:'900'},provider:{color:theme.colors.secondary,fontSize:10},price:{color:theme.colors.primaryDark,fontSize:10,fontWeight:'800'},
  actions:{gap:7},openButton:{width:34,height:34,alignItems:'center',justifyContent:'center',borderRadius:11,backgroundColor:theme.colors.softMint},removeButton:{width:34,height:34,alignItems:'center',justifyContent:'center',borderRadius:11,backgroundColor:theme.colors.dangerSoft},
  backLink:{alignSelf:'center',flexDirection:'row',alignItems:'center',gap:8,padding:10},backText:{color:theme.colors.primary,fontSize:11,fontWeight:'800'},
});
