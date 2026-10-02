import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import { HomeScreen } from '../screens/home/HomeScreen';
import { AddEditTaskScreen } from '../screens/tasks/AddEditTaskScreen';
import { TaskDetailsScreen } from '../screens/tasks/TaskDetailsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { useReducedMotion } from '../components/Motion';
import { DeadlineAlerts } from '../components/DeadlineAlerts';
import type { AppStackParamList } from './types';

const Stack = createNativeStackNavigator<AppStackParamList>();
export function AppNavigator() {
  const reducedMotion = useReducedMotion();
  return <><DeadlineAlerts /><Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.canvas }, headerTintColor: colors.ink, headerShadowVisible: false, animation: reducedMotion ? 'none' : 'slide_from_right' }}>
    <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="AddEditTask" component={AddEditTaskScreen} options={{ title: 'TASK EDITOR' }} />
    <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} options={{ title: 'TASK DETAILS' }} />
    <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'PROFILE' }} />
  </Stack.Navigator></>;
}
