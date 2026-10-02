import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { useAuthStore } from '../store/authStore';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { colors } from '../constants/colors';

export function RootNavigator() {
  const isLoading = useAuthStore(state => state.isLoading);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const sessionError = useAuthStore(state => state.sessionError);
  const restoreSession = useAuthStore(state => state.restoreSession);
  useEffect(() => { restoreSession(); }, [restoreSession]);
  if (isLoading) return <LoadingState />;
  if (sessionError) return <View style={styles.error}><ErrorState message={sessionError} onRetry={() => restoreSession()} /></View>;
  return <NavigationContainer>{isAuthenticated ? <AppNavigator /> : <AuthNavigator />}</NavigationContainer>;
}
const styles = StyleSheet.create({ error: { flex: 1, backgroundColor: colors.canvas, justifyContent: 'center', padding: 20 } });