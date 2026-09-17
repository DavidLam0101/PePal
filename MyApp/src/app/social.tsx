import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { Card, ComingSoonModal, PillButton, useComingSoon } from '@/components/ui';
import { Radii, Spacing, useTheme } from '@/constants/theme';
import { useAppData } from '@/store/app-data';

type Tab = 'chat' | 'social';

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function SocialScreen() {
  const { colors } = useTheme();
  const soon = useComingSoon();
  const { state } = useAppData();
  const [tab, setTab] = useState<Tab>('chat');

  return (
    <Screen title="Social" subtitle="Your people and your feed">
      {/* Segmented control */}
      <View style={[styles.segment, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
        {(['chat', 'social'] as Tab[]).map((t) => {
          const active = tab === t;
          return (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              style={[styles.segmentItem, active && { backgroundColor: colors.card }]}
            >
              <Ionicons
                name={t === 'chat' ? 'chatbubble-ellipses-outline' : 'globe-outline'}
                size={16}
                color={active ? colors.accent : colors.textMuted}
              />
              <Text
                style={[
                  styles.segmentLabel,
                  { color: active ? colors.text : colors.textMuted },
                ]}
              >
                {t === 'chat' ? 'Chat' : 'Social'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {tab === 'chat' ? (
        <>
          <PillButton
            label="Add friend"
            icon="person-add-outline"
            variant="primary"
            onPress={() => soon.open('Add friend')}
            style={{ marginTop: Spacing.four, alignSelf: 'stretch' }}
          />

          <Card style={{ marginTop: Spacing.four, gap: Spacing.three }}>
            {state.friends.map((f, i) => (
              <View
                key={f.id}
                style={[
                  styles.friendRow,
                  i < state.friends.length - 1 && {
                    borderBottomColor: colors.border,
                    borderBottomWidth: StyleSheet.hairlineWidth,
                  },
                ]}
              >
                <View style={[styles.avatar, { backgroundColor: colors.accentSoft }]}>
                  {f.avatarUri ? (
                    <Image source={{ uri: f.avatarUri }} style={styles.avatarImg} contentFit="cover" />
                  ) : (
                    <Text style={[styles.avatarText, { color: colors.accent }]}>
                      {initials(f.name)}
                    </Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.friendName, { color: colors.text }]}>{f.name}</Text>
                  <Text style={[styles.friendMsg, { color: colors.textMuted }]} numberOfLines={1}>
                    {f.lastMessage}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </View>
            ))}
          </Card>
        </>
      ) : (
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceAlt }]}>
            <Ionicons name="planet-outline" size={30} color={colors.textMuted} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Nothing here yet</Text>
          <Text style={[styles.emptyBody, { color: colors.textMuted }]}>
            Your social feed will live here soon.
          </Text>
        </View>
      )}

      <ComingSoonModal visible={soon.visible} feature={soon.feature} onClose={soon.close} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  segment: {
    flexDirection: 'row',
    borderRadius: Radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 4,
    marginTop: Spacing.two,
  },
  segmentItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.two,
    borderRadius: Radii.pill,
  },
  segmentLabel: { fontSize: 14, fontWeight: '800' },
  friendRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingBottom: Spacing.three },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarText: { fontSize: 15, fontWeight: '800' },
  friendName: { fontSize: 15, fontWeight: '700' },
  friendMsg: { fontSize: 13, fontWeight: '500', marginTop: 1 },
  empty: { alignItems: 'center', gap: 6, paddingVertical: Spacing.seven, marginTop: Spacing.four },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  emptyTitle: { fontSize: 17, fontWeight: '800' },
  emptyBody: { fontSize: 13, fontWeight: '500', textAlign: 'center' },
});
