import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Link, router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { EnquirySummary } from '@irife/contracts';
import { useAuth } from '../../src/auth/AuthProvider';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { ApiClientError } from '../../src/services/api/client';
import { cancelMyEnquiry, getMyEnquiries } from '../../src/services/api/enquiries';
import { theme } from '../../src/theme';
const statusLabel = (status: EnquirySummary['status']) => status.charAt(0) + status.slice(1).toLowerCase();
export default function RequestsScreen() {
  const { user, session } = useAuth();
  const [items,setItems] = useState<EnquirySummary[]>([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState<string|null>(null);
  const [busy,setBusy] = useState<string|null>(null);
  const [reload,setReload] = useState(0);
  const load = useCallback(async () => {
    if (!session) { setItems([]); setLoading(false); return; }
    setLoading(true); setError(null);
    try { setItems((await getMyEnquiries(session)).data); }
    catch (e) { setError(e instanceof ApiClientError ? e.message : 'Your requests could not be loaded.'); }
    finally { setLoading(false); }
  },[session]);
  useEffect(()=>{void load();},[load,reload]);
  async function cancel(id:string) {
    if(!session)return; setBusy(id); setError(null);
    try { const updated=await cancelMyEnquiry(session,id); setItems(current=>current.map(x=>x.id===id?updated:x)); }
    catch(e){setError(e instanceof Error?e.message:'Could not cancel the request.');}
    finally{setBusy(null);}
  }
  return <ScreenContainer>
    <View style={styles.header}><Text style={styles.eyebrow}>YOUR TRAVEL ACTIVITY</Text><Text style={styles.title}>My requests</Text><Text style={styles.subtitle}>Track messages sent to local hosts and the status of each request.</Text></View>
    {!user ? <View style={styles.empty}><Ionicons name="lock-closed-outline" size={27} color={theme.colors.primary}/><Text style={styles.emptyTitle}>Sign in to see your requests</Text><Text style={styles.description}>Your enquiries are private and visible only to your account.</Text><Pressable style={styles.primary} onPress={()=>router.push('/auth/sign-in')}><Text style={styles.primaryText}>Sign in</Text></Pressable></View>
    : loading ? <View style={styles.loading}><ActivityIndicator size="large" color={theme.colors.primary}/><Text style={styles.description}>Loading your requests…</Text></View>
    : error && items.length===0 ? <View style={styles.empty}><Ionicons name="cloud-offline-outline" size={27} color={theme.colors.danger}/><Text style={styles.emptyTitle}>Requests are unavailable</Text><Text style={styles.description}>{error}</Text><Pressable style={styles.primary} onPress={()=>setReload(x=>x+1)}><Text style={styles.primaryText}>Try again</Text></Pressable></View>
    : items.length===0 ? <View style={styles.empty}><View style={styles.icon}><Ionicons name="paper-plane-outline" size={28} color={theme.colors.primary}/></View><Text style={styles.emptyTitle}>Your requests will appear here</Text><Text style={styles.description}>Send a message to a local host from any published experience. An enquiry is not a confirmed booking.</Text><Link href="/(tabs)/discover" asChild><Pressable style={styles.primary}><Text style={styles.primaryText}>Discover experiences</Text></Pressable></Link></View>
    : <View style={styles.list}>{items.map(item=><View key={item.id} style={styles.card}>
      <View style={styles.top}><View style={styles.copy}><Text style={styles.destination}>{item.experience.destination.name.toUpperCase()}</Text><Text style={styles.cardTitle}>{item.experience.title}</Text><Text style={styles.description}>Hosted by {item.experience.provider.name}</Text></View><View style={[styles.status,item.status==='CANCELLED'&&styles.cancelled]}><Text style={styles.statusText}>{statusLabel(item.status)}</Text></View></View>
      <View style={styles.meta}><Text style={styles.metaText}>{item.guestCount} {item.guestCount===1?'guest':'guests'}</Text><Text style={styles.metaText}>{new Date(item.createdAt).toLocaleDateString()}</Text>{item.experience.priceFrom?<Text style={styles.metaText}>From {item.experience.priceFrom} {item.experience.currency}</Text>:null}</View>
      <Text style={styles.message} numberOfLines={3}>{item.message}</Text>
      {item.status==='PENDING'?<Pressable disabled={busy===item.id} onPress={()=>void cancel(item.id)} style={styles.cancelButton}>{busy===item.id?<ActivityIndicator size="small" color={theme.colors.danger}/>:<Ionicons name="close-circle-outline" size={16} color={theme.colors.danger}/>}<Text style={styles.cancelText}>{busy===item.id?'Cancelling…':'Cancel request'}</Text></Pressable>:null}
    </View>)}</View>}
    {error&&items.length>0?<Text style={styles.errorText}>{error}</Text>:null}
    <Link href="/(tabs)/profile" asChild><Pressable style={styles.backLink}><Ionicons name="person-outline" size={16} color={theme.colors.primary}/><Text style={styles.backText}>Back to your account</Text><Ionicons name="arrow-forward" size={14} color={theme.colors.primary}/></Pressable></Link>
  </ScreenContainer>;
}
const styles=StyleSheet.create({
 header:{gap:8},eyebrow:{color:theme.colors.primary,fontSize:10,fontWeight:'900',letterSpacing:1.4},title:{color:theme.colors.ink,fontSize:29,lineHeight:35,fontWeight:'900'},subtitle:{color:theme.colors.secondary,fontSize:13,lineHeight:20},
 empty:{alignItems:'center',gap:12,paddingHorizontal:20,paddingVertical:28,borderRadius:23,borderWidth:1,borderColor:theme.colors.border,backgroundColor:theme.colors.surface},icon:{width:64,height:64,alignItems:'center',justifyContent:'center',borderRadius:22,backgroundColor:theme.colors.softMint},
 emptyTitle:{color:theme.colors.ink,fontSize:17,fontWeight:'900',textAlign:'center'},description:{color:theme.colors.secondary,fontSize:11,lineHeight:18,textAlign:'center'},primary:{minHeight:44,minWidth:145,alignItems:'center',justifyContent:'center',paddingHorizontal:18,borderRadius:14,backgroundColor:theme.colors.primaryDark},primaryText:{color:theme.colors.white,fontSize:11,fontWeight:'900'},
 loading:{minHeight:140,alignItems:'center',justifyContent:'center',gap:10},list:{gap:12},card:{gap:12,padding:15,borderRadius:19,borderWidth:1,borderColor:theme.colors.border,backgroundColor:theme.colors.surface},
 top:{flexDirection:'row',alignItems:'flex-start',gap:10},copy:{flex:1,gap:4},destination:{color:theme.colors.primary,fontSize:9,fontWeight:'900',letterSpacing:1},cardTitle:{color:theme.colors.ink,fontSize:15,fontWeight:'900'},
 status:{paddingHorizontal:9,paddingVertical:6,borderRadius:999,backgroundColor:theme.colors.softMint},cancelled:{backgroundColor:theme.colors.border},statusText:{color:theme.colors.primaryDark,fontSize:9,fontWeight:'900'},
 meta:{flexDirection:'row',flexWrap:'wrap',gap:12},metaText:{color:theme.colors.secondary,fontSize:9,fontWeight:'700'},message:{color:theme.colors.ink,fontSize:11,lineHeight:17},
 cancelButton:{minHeight:36,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:6,borderRadius:11,backgroundColor:theme.colors.dangerSoft},cancelText:{color:theme.colors.danger,fontSize:10,fontWeight:'900'},
 errorText:{color:theme.colors.danger,fontSize:10},backLink:{alignSelf:'center',flexDirection:'row',alignItems:'center',gap:8,padding:10},backText:{color:theme.colors.primary,fontSize:11,fontWeight:'800'},
});
