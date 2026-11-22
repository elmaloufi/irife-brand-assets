import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../src/auth/AuthProvider';
import { ScreenContainer } from '../src/components/ScreenContainer';
import { signOutAndNavigate } from '../src/auth/sign-out-navigation.mjs';
import { usePreferences } from '../src/services/preferences/PreferencesProvider';
import { translate, resolveLocale } from '../src/services/preferences/locale.mjs';
import type { AppAppearance, AppCurrency, AppLanguage, AppPreferences, DistanceUnit } from '../src/services/preferences/preferences';
import { theme } from '../src/theme';

type Choice<T extends string> = { value: T; label: string };

function PreferenceGroup<T extends string>({
  title,
  description,
  value,
  choices,
  onChange,
}: {
  title: string;
  description: string;
  value: T;
  choices: Choice<T>[];
  onChange(value: T): void;
}) {
  return (
    <View style={styles.preferenceBlock}>
      <View style={styles.preferenceHeading}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <View style={styles.choices}>
        {choices.map((choice) => {
          const selected = choice.value === value;
          return (
            <Pressable
              key={choice.value}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => onChange(choice.value)}
              style={[styles.choice, selected && styles.choiceSelected]}
            >
              <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{choice.label}</Text>
              {selected ? <Ionicons name="checkmark-circle" size={15} color={theme.colors.white} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const { user, signOut, isSubmitting } = useAuth();
  const { preferences, isLoading: loading, error: providerError, updatePreferences } = usePreferences();
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const t = (key: string) => translate(preferences.language, key);
  const locale = resolveLocale(preferences.language, preferences.region);

  async function update<K extends keyof AppPreferences>(key: K, value: AppPreferences[K]) {
    const next = { ...preferences, [key]: value };
    setSaved(false);
    setSaveError(null);
    try {
      await updatePreferences(next);
      setSaved(true);
    } catch {
      setSaveError('Your change could not be saved. Please try again.');
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Link href="/(tabs)/profile" asChild>
          <Pressable style={styles.back}><Ionicons name="chevron-back" size={19} color={theme.colors.primaryDark} /><Text style={styles.backText}>{t('account')}</Text></Pressable>
        </Link>
        <Text style={styles.eyebrow}>MAKE IRIFE YOURS</Text>
        <Text style={styles.title}>{t('settings')}</Text>
        <Text style={styles.subtitle}>Your language, country, currency and travel preferences · {locale}</Text>
      </View>

      {loading ? (
        <View style={styles.loading}><ActivityIndicator color={theme.colors.primary} /><Text style={styles.description}>{t('loading')}</Text></View>
      ) : (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('travelPreferences')}</Text>
            <View style={styles.group}>
              <PreferenceGroup<AppLanguage> title={t('appLanguage')} description={t('chooseLanguage')} value={preferences.language} choices={[{value:'en',label:t('english')},{value:'fr',label:t('french')},{value:'ar',label:t('arabic')}] } onChange={(value) => void update('language', value)} />
              <View style={styles.separator} />
              <PreferenceGroup<string> title={t('region')} description={t('regionDescription')} value={preferences.region} choices={[
                {value:'MA',label:'Morocco'},{value:'FR',label:'France'},{value:'ES',label:'Spain'},
                {value:'GB',label:'United Kingdom'},{value:'US',label:'United States'},{value:'CA',label:'Canada'},
                {value:'DE',label:'Germany'},{value:'NL',label:'Netherlands'},{value:'AE',label:'United Arab Emirates'},
                {value:'SA',label:'Saudi Arabia'},{value:'BE',label:'Belgium'},
              ]} onChange={(value) => void update('region', value)} />
              <View style={styles.separator} />
              <PreferenceGroup<AppCurrency> title={t('currency')} description={t('currencyDescription')} value={preferences.currency} choices={[{value:'MAD',label:'MAD'},{value:'EUR',label:'EUR'},{value:'USD',label:'USD'}]} onChange={(value) => void update('currency', value)} />
              <View style={styles.separator} />
              <PreferenceGroup<DistanceUnit> title={t('distance')} description={t('distanceDescription')} value={preferences.distanceUnit} choices={[{value:'km',label:t('kilometres')},{value:'mi',label:t('miles')}] } onChange={(value) => void update('distanceUnit', value)} />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('appearance')}</Text>
            <View style={styles.group}>
              <PreferenceGroup<AppAppearance> title={t('theme')} description={t('themeDescription')} value={preferences.appearance} choices={[{value:'system',label:t('system')},{value:'light',label:t('light')},{value:'dark',label:t('dark')}] } onChange={(value) => void update('appearance', value)} />
            </View>
          </View>
        </>
      )}

      {saved ? <View style={styles.saved}><Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} /><Text style={styles.savedText}>{t('saved')}</Text></View> : null}
      {(saveError || providerError) ? <View style={styles.error}><Ionicons name="alert-circle-outline" size={16} color={theme.colors.danger} /><Text style={styles.errorText}>{saveError || providerError}</Text></View> : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('privacy')}</Text>
        <View style={styles.infoRow}><View style={styles.iconWrap}><Ionicons name="location-outline" size={19} color={theme.colors.primary} /></View><View style={styles.copy}><Text style={styles.rowTitle}>Location access</Text><Text style={styles.description}>Not requested. IRIFE asks only when you use a location feature.</Text></View><Text style={styles.status}>OFF</Text></View>
        <View style={styles.infoRow}><View style={styles.iconWrap}><Ionicons name="notifications-outline" size={19} color={theme.colors.primary} /></View><View style={styles.copy}><Text style={styles.rowTitle}>Notifications</Text><Text style={styles.description}>Push delivery is not connected yet.</Text></View><Text style={styles.status}>OFF</Text></View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('security')}</Text>
        <Link href="/settings/security" asChild>
          <Pressable style={styles.securityLink}>
            <View style={styles.iconWrap}><Ionicons name="shield-checkmark-outline" size={20} color={theme.colors.primary} /></View>
            <View style={styles.copy}>
              <Text style={styles.rowTitle}>{user ? 'Password & active sessions' : 'Account security'}</Text>
              <Text style={styles.description}>{user ? user.email : 'Sign in to manage your account security.'}</Text>
              <Text style={styles.securityHint}>Review devices, revoke sessions and change your password.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.secondary} />
          </Pressable>
        </Link>
        {user ? <Pressable accessibilityRole="button" disabled={isSubmitting} onPress={() => void signOutAndNavigate(signOut, () => router.replace('/(tabs)/profile'), () => Alert.alert('Sign-out could not be confirmed', 'Your local session was cleared, but the server could not confirm revocation. Reconnect and review active sessions.'))} style={styles.signOut}><Ionicons name="log-out-outline" size={17} color={theme.colors.danger} /><Text style={styles.signOutText}>{isSubmitting ? 'Signing out…' : 'Sign out of this device'}</Text></Pressable> : null}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerBrand}>IRIFE</Text>
        <Text style={styles.footerText}>A more meaningful way to discover Morocco.</Text>
        <Text style={styles.footerVersion}>Version 0.1.0 · Preferences are stored locally</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { gap: 8 },
  back: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8, paddingVertical: 4 },
  backText: { color: theme.colors.primaryDark, fontSize: 12, fontWeight: '800' },
  eyebrow: { color: theme.colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  title: { color: theme.colors.ink, fontSize: 30, lineHeight: 36, fontWeight: '900' },
  subtitle: { color: theme.colors.secondary, fontSize: 13, lineHeight: 20 },
  loading: { minHeight: 100, alignItems: 'center', justifyContent: 'center', gap: 10 },
  section: { gap: 10 },
  sectionTitle: { color: theme.colors.ink, fontSize: 16, fontWeight: '900' },
  group: { overflow: 'hidden', borderRadius: 18, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  preferenceBlock: { gap: 11, padding: 14 },
  preferenceHeading: { gap: 4 },
  rowTitle: { color: theme.colors.ink, fontSize: 12, fontWeight: '800' },
  description: { color: theme.colors.secondary, fontSize: 10, lineHeight: 15 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  choice: { minHeight: 35, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 11, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.background },
  choiceSelected: { borderColor: theme.colors.primaryDark, backgroundColor: theme.colors.primaryDark },
  choiceText: { color: theme.colors.secondary, fontSize: 10, fontWeight: '800' },
  choiceTextSelected: { color: theme.colors.white },
  separator: { height: 1, backgroundColor: theme.colors.border, marginHorizontal: 14 },
  saved: { flexDirection: 'row', alignItems: 'center', gap: 7, padding: 11, borderRadius: 12, backgroundColor: theme.colors.softMint },
  savedText: { color: theme.colors.primaryDark, fontSize: 10, fontWeight: '800' },
  error: { flexDirection: 'row', alignItems: 'center', gap: 7, padding: 11, borderRadius: 12, backgroundColor: theme.colors.dangerSoft },
  errorText: { flex: 1, color: theme.colors.danger, fontSize: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 13, borderRadius: 15, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  iconWrap: { width: 39, height: 39, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: theme.colors.softMint },
  copy: { flex: 1, gap: 4 },
  status: { color: theme.colors.secondary, fontSize: 9, fontWeight: '900' },
  securityCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 11, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  securityHint: { color: theme.colors.secondary, fontSize: 9, lineHeight: 14, marginTop: 4 },
  securityLink: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 13, borderRadius: 15, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  signOut: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, backgroundColor: theme.colors.dangerSoft },
  signOutText: { color: theme.colors.danger, fontSize: 11, fontWeight: '900' },
  footer: { alignItems: 'center', gap: 4, paddingVertical: 12 },
  footerBrand: { color: theme.colors.primaryDark, fontSize: 13, fontWeight: '900', letterSpacing: 2 },
  footerText: { color: theme.colors.secondary, fontSize: 10 },
  footerVersion: { color: theme.colors.secondary, fontSize: 9, marginTop: 4 },
});
