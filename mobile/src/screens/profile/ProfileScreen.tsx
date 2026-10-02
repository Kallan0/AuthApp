import React, { useState } from 'react';
import Constants from 'expo-constants';
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../../components/AppButton';
import { MotionView } from '../../components/Motion';
import { colors } from '../../constants/colors';
import { useAuthStore } from '../../store/authStore';
import { useTaskStore } from '../../store/taskStore';
import { getErrorMessage } from '../../api/client';
import { authApi } from '../../api/authApi';
import { getFirebaseAuth } from '../../api/firebase';
import { PREVIEW_MODE } from '../../constants/config';

export function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const tasks = useTaskStore(state => state.tasks);
  const [busy, setBusy] = useState(false);
  const showGoogle = !PREVIEW_MODE && Platform.OS === 'android' && Constants.appOwnership !== 'expo';
  const [googleLinked, setGoogleLinked] = useState(() => showGoogle && Boolean(getFirebaseAuth().currentUser?.providerData.some(provider => provider.providerId === 'google.com')));
  const connectGoogle = async () => {
    setBusy(true);
    try {
      if (await authApi.linkGoogle()) {
        setGoogleLinked(true);
        Alert.alert('Google connected', 'You can now sign in with Google.');
      }
    } catch (error) { Alert.alert('Could not connect Google', getErrorMessage(error)); }
    finally { setBusy(false); }
  };
  const signOut = () => Alert.alert('Sign out?', 'You can sign in again any time.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Sign out', style: 'destructive', onPress: async () => {
      setBusy(true);
      try { await logout(); } catch (error) { Alert.alert('Could not sign out', getErrorMessage(error)); }
      finally { setBusy(false); }
    } },
  ]);
  return <MotionView style={styles.screen}><ScrollView contentContainerStyle={styles.page}>
    <Text style={styles.eyebrow}>ACCOUNT</Text>
    <Text style={styles.title}>{user?.name}</Text>
    <Text style={styles.email}>{user?.email}</Text>
    <View style={styles.panel}><Text style={styles.label}>YOUR PROGRESS</Text><Text style={styles.metric}>{tasks.filter(task => task.status === 'completed').length} completed tasks</Text><Text style={styles.metric}>{tasks.filter(task => task.status === 'pending').length} pending tasks</Text></View>
    {showGoogle && !googleLinked ? <AppButton title='CONNECT GOOGLE' onPress={connectGoogle} variant='secondary' disabled={busy} style={styles.connectButton} /> : null}
    <AppButton title={busy ? 'PLEASE WAIT...' : 'SIGN OUT'} onPress={signOut} variant="secondary" disabled={busy} />
  </ScrollView></MotionView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  page: { flexGrow: 1, backgroundColor: colors.canvas, padding: 20 },
  eyebrow: { color: colors.blue, fontFamily: 'monospace', fontSize: 11, letterSpacing: 1.2, marginTop: 10 },
  title: { color: colors.ink, fontSize: 32, fontWeight: '800', marginTop: 12 },
  email: { color: colors.muted, marginTop: 5, marginBottom: 28 },
  panel: { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.border, padding: 18, marginBottom: 28 },
  label: { color: colors.blue, fontFamily: 'monospace', fontSize: 10, fontWeight: '700', marginBottom: 14 },
  metric: { color: colors.ink, fontSize: 17, marginBottom: 8 },
  connectButton: { marginBottom: 12 },
});


