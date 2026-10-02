import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { MotionView } from './Motion';
export function LoadingState() { return <MotionView style={styles.box}><ActivityIndicator color={colors.blue} size="large" /></MotionView>; }
const styles = StyleSheet.create({ box: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.canvas } });
