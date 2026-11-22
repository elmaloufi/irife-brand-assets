import { Ionicons } from '@react-native-vector-icons/ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../src/auth/AuthProvider';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { ApiClientError } from '../../src/services/api/client';
import { createEnquiry } from '../../src/services/api/enquiries';
import { theme } from '../../src/theme';
export default function NewEnquiryScreen() {
  const params = useLocalSearchParams<{ experienceId?: string; title?: string; destination?: string; provider?: string }>();
  const { session, user } = useAuth();
  const [guestCount, setGuestCount] = useState('1');
  const [requestedDate, setRequestedDate] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function submit() {
    if (!session || !params.experienceId) { setError('Sign in and choose a published experience first.'); return; }
    const guests = Number(guestCount);
    if (!Number.isInteger(guests) || guests < 1 || guests > 20) { setError('Guest count must be between 1 and 20.'); return; }
    if (message.trim().length < 10) { setError('Please add a message of at least 10 characters.'); return; }
    if (requestedDate && Number.isNaN(Date.parse(requestedDate))) { setError('Enter a valid date and time with timezone.'); return; }
    setSubmitting(true); setError(null);
    try {
      await createEnquiry(session, {
        experienceId: params.experienceId, guestCount: guests, message: message.trim(),
        ...(requestedDate ? { requestedStartAt: new Date(requestedDate).toISOString() } : {}),
      });
      router.replace('/(tabs)/requests');
    } catch (cause) { setError(cause instanceof ApiClientError ? cause.message : 'Your request could not be sent.'); }
    finally { setSubmitting(false); }
  }
  return <ScreenContainer>
    <View style={styles.header}>
      <Pressable style={styles.back} onPress={() => router.back()}><Ionicons name="chevron-back" size={19} color={theme.colors.primaryDark} /><Text style={styles.backText}>Back</Text></Pressable>
      <Text style={styles.eyebrow}>CONNECT WITH LOCAL HOSTS</Text><Text style={styles.title}>Send an enquiry</Text>
      <Text style={styles.subtitle}>A request for information — not a confirmed booking or payment.</Text>
    </View>
    <View style={styles.experienceCard}><Text style={styles.experienceEyebrow}>{params.destination ?? 'MOROCCO'}</Text><Text style={styles.experienceTitle}>{params.title ?? 'Selected experience'}</Text>{params.provider ? <Text style={styles.provider}>Hosted by {params.provider}</Text> : null}</View>
    {!user ? <View style={styles.notice}><Text style={styles.label}>Sign in is required to send an enquiry.</Text><Pressable style={styles.primary} onPress={() => router.push('/auth/sign-in')}><Text style={styles.primaryText}>Sign in</Text></Pressable></View> : <View style={styles.form}>
      <View style={styles.field}><Text style={styles.label}>Number of guests</Text><View style={styles.counter}>
        <Pressable onPress={() => setGuestCount(String(Math.max(1, Number(guestCount || 1) - 1)))} style={styles.counterButton}><Ionicons name="remove" size={18} color={theme.colors.primary} /></Pressable>
        <TextInput accessibilityLabel="Number of guests" keyboardType="number-pad" value={guestCount} onChangeText={setGuestCount} style={styles.counterInput} />
        <Pressable onPress={() => setGuestCount(String(Math.min(20, Number(guestCount || 1) + 1)))} style={styles.counterButton}><Ionicons name="add" size={18} color={theme.colors.primary} /></Pressable>
      </View></View>
      <View style={styles.field}><Text style={styles.label}>Preferred date and time (optional)</Text><TextInput accessibilityLabel="Preferred date and time" placeholder="2026-12-20T10:00:00+01:00" placeholderTextColor="#9AA59F" autoCapitalize="none" value={requestedDate} onChangeText={setRequestedDate} style={styles.input} /><Text style={styles.hint}>The host must confirm availability.</Text></View>
      <View style={styles.field}><Text style={styles.label}>Message to the host</Text><TextInput accessibilityLabel="Message to the host" multiline textAlignVertical="top" maxLength={2000} placeholder="Tell the host what you would like to know…" placeholderTextColor="#9AA59F" value={message} onChangeText={setMessage} style={[styles.input, styles.message]} /><Text style={styles.hint}>{message.length}/2000 · minimum 10 characters</Text></View>
      {error ? <View accessibilityRole="alert" style={styles.error}><Ionicons name="alert-circle-outline" size={17} color={theme.colors.danger} /><Text style={styles.errorText}>{error}</Text></View> : null}
      <Pressable accessibilityRole="button" disabled={submitting} onPress={() => void submit()} style={[styles.primary, submitting && styles.disabled]}>{submitting ? <ActivityIndicator color={theme.colors.white} /> : <Text style={styles.primaryText}>Send enquiry</Text>}{!submitting ? <Ionicons name="arrow-forward" size={17} color={theme.colors.white} /> : null}</Pressable>
    </View>}
  </ScreenContainer>;
}
const styles = StyleSheet.create({
  header:{gap:8},back:{flexDirection:'row',alignItems:'center',alignSelf:'flex-start',gap:4,marginBottom:8},backText:{color:theme.colors.primaryDark,fontSize:12,fontWeight:'800'},
  eyebrow:{color:theme.colors.primary,fontSize:10,fontWeight:'900',letterSpacing:1.5},title:{color:theme.colors.ink,fontSize:29,lineHeight:35,fontWeight:'900'},subtitle:{color:theme.colors.secondary,fontSize:12,lineHeight:19},
  experienceCard:{padding:16,borderRadius:19,backgroundColor:theme.colors.softMint,gap:6},experienceEyebrow:{color:theme.colors.primary,fontSize:9,fontWeight:'900',letterSpacing:1},experienceTitle:{color:theme.colors.primaryDark,fontSize:17,fontWeight:'900'},provider:{color:theme.colors.secondary,fontSize:11},
  notice:{gap:12,padding:16,borderRadius:17,backgroundColor:theme.colors.surface,borderWidth:1,borderColor:theme.colors.border},form:{gap:17},field:{gap:8},label:{color:theme.colors.ink,fontSize:12,fontWeight:'800'},
  counter:{minHeight:50,flexDirection:'row',alignItems:'center',justifyContent:'center',borderRadius:15,borderWidth:1,borderColor:theme.colors.border,backgroundColor:theme.colors.surface},counterButton:{width:52,alignItems:'center',justifyContent:'center',height:48},counterInput:{width:60,textAlign:'center',color:theme.colors.ink,fontSize:15,fontWeight:'900'},
  input:{minHeight:50,paddingHorizontal:13,paddingVertical:12,borderRadius:15,borderWidth:1,borderColor:theme.colors.border,backgroundColor:theme.colors.surface,color:theme.colors.ink,fontSize:12},message:{minHeight:120},hint:{color:theme.colors.secondary,fontSize:10,lineHeight:15},
  error:{flexDirection:'row',alignItems:'flex-start',gap:8,padding:12,borderRadius:13,backgroundColor:theme.colors.dangerSoft},errorText:{flex:1,color:theme.colors.danger,fontSize:11,lineHeight:17},
  primary:{minHeight:52,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:9,borderRadius:16,backgroundColor:theme.colors.primaryDark},primaryText:{color:theme.colors.white,fontSize:12,fontWeight:'900'},disabled:{opacity:0.55},
});
