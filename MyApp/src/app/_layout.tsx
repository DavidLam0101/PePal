import { StatusBar } from 'expo-status-bar';
import { Tabs } from 'expo-router/js-tabs';
import React from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { FloatingTabBar } from '@/components/floating-tab-bar';
import { usePedometer } from '@/hooks/use-pedometer';
import { AppDataProvider } from '@/store/app-data';

/** Runs inside the provider so pedometer updates can flow into the store. */
function PedometerBridge() {
  usePedometer();
  return null;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppDataProvider>
          <PedometerBridge />
          <StatusBar style="auto" />
          <View style={{ flex: 1 }}>
            <Tabs
              tabBar={(props) => <FloatingTabBar {...props} />}
              screenOptions={{ headerShown: false }}
            >
              <Tabs.Screen name="index" options={{ title: 'Home' }} />
              <Tabs.Screen name="workout" options={{ title: 'Workout' }} />
              <Tabs.Screen name="nutrition" options={{ title: 'Nutrition' }} />
              <Tabs.Screen name="social" options={{ title: 'Social' }} />
              <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
            </Tabs>
          </View>
        </AppDataProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
