import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './navigation/RootNavigator';
import { MotionProvider } from './components/Motion';
export default function App() {
  return <SafeAreaProvider><MotionProvider><StatusBar barStyle="dark-content" /><RootNavigator /></MotionProvider></SafeAreaProvider>;
}
