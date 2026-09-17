import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radii, useTheme } from '@/constants/theme';

type IconName = keyof typeof Ionicons.glyphMap;

const TABS: Record<string, { label: string; icon: IconName; iconActive: IconName }> = {
  index: { label: 'Home', icon: 'home-outline', iconActive: 'home' },
  workout: { label: 'Workout', icon: 'barbell-outline', iconActive: 'barbell' },
  nutrition: { label: 'Nutrition', icon: 'restaurant-outline', iconActive: 'restaurant' },
  social: { label: 'Social', icon: 'chatbubbles-outline', iconActive: 'chatbubbles' },
  profile: { label: 'Profile', icon: 'person-outline', iconActive: 'person' },
};

export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const { colors, dark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingBottom: insets.bottom + 10 }]}>
      <View
        style={[
          styles.bar,
          {
            backgroundColor: colors.tabBar,
            borderColor: colors.border,
            boxShadow: `0px 8px 24px rgba(0, 0, 0, ${dark ? 0.45 : 0.16})`,
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const cfg = TABS[route.name];
          if (!cfg) return null;
          const focused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name as never);
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={cfg.label}
              onPress={onPress}
              style={styles.item}
            >
              <View
                style={[
                  styles.iconPill,
                  focused && { backgroundColor: colors.accent },
                ]}
              >
                <Ionicons
                  name={focused ? cfg.iconActive : cfg.icon}
                  size={22}
                  color={focused ? '#FFFFFF' : colors.textMuted}
                />
              </View>
              <Text
                numberOfLines={1}
                style={[
                  styles.label,
                  { color: focused ? colors.accent : colors.textMuted },
                ]}
              >
                {cfg.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
    pointerEvents: 'box-none',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 460,
    height: 66,
    borderRadius: Radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    ...Platform.select({ android: { elevation: 12 }, default: {} }),
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 6,
  },
  iconPill: {
    width: 40,
    height: 32,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
  },
});
