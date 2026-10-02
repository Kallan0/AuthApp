import React, { useRef, useState } from 'react';
import Constants from 'expo-constants';
import { Animated, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { SafeAreaView } from 'react-native-safe-area-context';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { MotionPressable, MotionView, useReducedMotion } from '../../components/Motion';
import { colors } from '../../constants/colors';
import { PREVIEW_MODE } from '../../constants/config';
import { useAuthStore } from '../../store/authStore';
import { getErrorMessage } from '../../api/client';
import { authSchema, registerSchema } from '../../utils/validation';

type Mode = 'login' | 'register';
type LoginForm = z.infer<typeof authSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export function AuthScreen() {
  const login = useAuthStore(state => state.login);
  const register = useAuthStore(state => state.register);
  const google = useAuthStore(state => state.google);
  const showGoogle = !PREVIEW_MODE && Platform.OS === 'android' && Constants.appOwnership !== 'expo';
  const [mode, setMode] = useState<Mode>('login');
  const [switching, setSwitching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [requestError, setRequestError] = useState('');
  const reducedMotion = useReducedMotion();
  const formOpacity = useRef(new Animated.Value(1)).current;
  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: '', password: '' },
  });
  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const changeMode = (nextMode: Mode) => {
    if (nextMode === mode || saving || switching) return;
    setRequestError('');
    if (reducedMotion) { setMode(nextMode); return; }
    setSwitching(true);
    Animated.timing(formOpacity, { toValue: 0, duration: 90, useNativeDriver: true }).start(({ finished }) => {
      if (!finished) return;
      setMode(nextMode);
      Animated.timing(formOpacity, { toValue: 1, duration: 190, useNativeDriver: true }).start(() => setSwitching(false));
    });
  };
  const submitLogin = loginForm.handleSubmit(async values => {
    setSaving(true);
    setRequestError('');
    try { await login(values.email.trim(), values.password); }
    catch (error) { setRequestError(getErrorMessage(error)); }
    finally { setSaving(false); }
  });
  const submitGoogle = async () => {
    setSaving(true);
    setRequestError('');
    try { await google(); }
    catch (error) { setRequestError(getErrorMessage(error)); }
    finally { setSaving(false); }
  };
  const submitRegister = registerForm.handleSubmit(async values => {
    setSaving(true);
    setRequestError('');
    try { await register(values.name.trim(), values.email.trim(), values.password); }
    catch (error) { setRequestError(getErrorMessage(error)); }
    finally { setSaving(false); }
  });

  return <MotionView style={styles.safe}><SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      <View style={styles.brand}>
        <View style={styles.mark}><Text style={styles.markText}>I</Text></View>
        <Text style={styles.brandName}>ILLOCA</Text>
      </View>
      <Text style={styles.eyebrow}>YOUR PERSONAL TASK SPACE</Text>
      <Text style={styles.title}>Make room for what matters.</Text>
      <Text style={styles.subtitle}>Plan your day, follow through, and see your progress.</Text>
      <View style={styles.form}>
        <View style={styles.tabs}>
          <MotionPressable accessibilityRole="tab" accessibilityState={{ selected: mode === 'login' }} disabled={saving || switching} onPress={() => changeMode('login')} selected={mode === 'login'} activeBackground={colors.paper} inactiveBackground={colors.panel} style={[styles.tab, mode === 'login' && styles.activeTab]}>
            <Text style={[styles.tabText, mode === 'login' && styles.activeTabText]}>SIGN IN</Text>
          </MotionPressable>
          <MotionPressable accessibilityRole="tab" accessibilityState={{ selected: mode === 'register' }} disabled={saving || switching} onPress={() => changeMode('register')} selected={mode === 'register'} activeBackground={colors.paper} inactiveBackground={colors.panel} style={[styles.tab, mode === 'register' && styles.activeTab]}>
            <Text style={[styles.tabText, mode === 'register' && styles.activeTabText]}>CREATE ACCOUNT</Text>
          </MotionPressable>
        </View>
        <Animated.View style={{ opacity: formOpacity, transform: [{ translateY: formOpacity.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }}>
        {PREVIEW_MODE ? <Text style={styles.previewHint}>{mode === 'login' ? 'Preview: use any valid email and a password of at least 8 characters.' : 'Preview account: your changes reset when the app restarts.'}</Text> : null}
        {mode === 'login' ? <>
          <Controller control={loginForm.control} name="email" render={({ field: { value, onChange, onBlur } }) => <AppInput label="Email" value={value} onChangeText={onChange} onBlur={onBlur} autoCapitalize="none" keyboardType="email-address" autoComplete="email" error={loginForm.formState.errors.email?.message} />} />
          <Controller control={loginForm.control} name="password" render={({ field: { value, onChange, onBlur } }) => <AppInput label="Password" value={value} onChangeText={onChange} onBlur={onBlur} secureTextEntry autoComplete="password" error={loginForm.formState.errors.password?.message} />} />
        </> : <>
          <Controller control={registerForm.control} name="name" render={({ field: { value, onChange, onBlur } }) => <AppInput label="Name" value={value} onChangeText={onChange} onBlur={onBlur} autoComplete="name" error={registerForm.formState.errors.name?.message} />} />
          <Controller control={registerForm.control} name="email" render={({ field: { value, onChange, onBlur } }) => <AppInput label="Email" value={value} onChangeText={onChange} onBlur={onBlur} autoCapitalize="none" keyboardType="email-address" autoComplete="email" error={registerForm.formState.errors.email?.message} />} />
          <Controller control={registerForm.control} name="password" render={({ field: { value, onChange, onBlur } }) => <AppInput label="Password" value={value} onChangeText={onChange} onBlur={onBlur} secureTextEntry autoComplete="new-password" error={registerForm.formState.errors.password?.message} />} />
        </>}
        {requestError ? <Text style={styles.error}>{requestError}</Text> : null}
        <AppButton title={saving ? mode === 'login' ? 'SIGNING IN...' : 'CREATING ACCOUNT...' : mode === 'login' ? 'SIGN IN  \u2192' : 'CREATE ACCOUNT  \u2192'} onPress={mode === 'login' ? submitLogin : submitRegister} disabled={saving} />
        {showGoogle ? <>
          <Text style={styles.orText}>OR</Text>
          <AppButton title='CONTINUE WITH GOOGLE' onPress={submitGoogle} disabled={saving} variant='secondary' />
        </> : null}
        </Animated.View>
      </View>
    </ScrollView>
  </SafeAreaView></MotionView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  page: { flexGrow: 1, backgroundColor: colors.canvas, padding: 22, paddingTop: 48, justifyContent: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 30 },
  mark: { width: 34, height: 34, backgroundColor: colors.blue, justifyContent: 'center', alignItems: 'center' },
  markText: { color: colors.paper, fontSize: 22, fontWeight: '800' },
  brandName: { color: colors.ink, fontFamily: 'monospace', fontSize: 16, fontWeight: '700', letterSpacing: 1.5 },
  eyebrow: { color: colors.red, fontFamily: 'monospace', fontSize: 11, letterSpacing: 1.4, marginBottom: 12 },
  title: { color: colors.ink, fontSize: 40, lineHeight: 44, fontWeight: '800', marginBottom: 14 },
  subtitle: { color: colors.muted, fontSize: 16, lineHeight: 24, marginBottom: 30 },
  form: { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.border, padding: 20 },
  tabs: { flexDirection: 'row', backgroundColor: colors.panel, marginBottom: 24, padding: 5 },
  tab: { flex: 1, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  activeTab: { backgroundColor: colors.paper },
  tabText: { color: colors.muted, fontFamily: 'monospace', fontSize: 11 },
  activeTabText: { color: colors.ink, fontWeight: '700' },
  previewHint: { color: colors.muted, fontSize: 13, lineHeight: 19, marginBottom: 18 },
  error: { color: colors.red, marginBottom: 12 },
  orText: { color: colors.muted, textAlign: 'center', marginVertical: 14, fontFamily: 'monospace', fontSize: 12 },
});


