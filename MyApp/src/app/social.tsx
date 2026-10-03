import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Sheet } from '@/components/sheet';
import { Screen } from '@/components/screen';
import { Card, PillButton } from '@/components/ui';
import { Radii, Spacing, useTheme } from '@/constants/theme';
import { SAMPLE_USERS, type SampleUser } from '@/data/sample-users';
import { ID_PATTERN, useAppData } from '@/store/app-data';

type Tab = 'chat' | 'social';

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/* ------------------------------------------------------------------ */
/* Add friend panel                                                    */
/* ------------------------------------------------------------------ */

function AddFriendSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { colors } = useTheme();
  const { state, addFriend } = useAppData();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SampleUser | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const reset = () => {
    setQuery('');
    setResult(null);
    setMessage(null);
  };

  const close = () => {
    reset();
    onClose();
  };

  const search = () => {
    setResult(null);
    if (!ID_PATTERN.test(query)) {
      setMessage('Enter the full 11-digit ID.');
      return;
    }
    if (query === state.profile.id) {
      setMessage("That's your own ID.");
      return;
    }
    const found = SAMPLE_USERS.find((u) => u.id === query);
    if (!found) {
      setMessage('No user found with that ID.');
      return;
    }
    setMessage(null);
    setResult(found);
  };

  const add = () => {
    if (!result) return;
    const ok = addFriend(result);
    if (ok) {
      setMessage(`${result.name} added to your friends.`);
      setResult(null);
      setQuery('');
    } else {
      setMessage('You are already friends.');
    }
  };

  return (
    <Sheet visible={visible} title="Add friend" onClose={close}>
      <Text style={[styles.sheetHint, { color: colors.textMuted }]}>
        Enter your friend&apos;s 11-digit ID to find them.
      </Text>

      <View style={styles.searchRow}>
        <View style={[styles.searchBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={(t) => {
              setQuery(t.replace(/\D/g, '').slice(0, 11));
              setResult(null);
              setMessage(null);
            }}
            placeholder="11-digit ID"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            maxLength={11}
            onSubmitEditing={search}
            returnKeyType="search"
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>
        <PillButton label="Search" onPress={search} style={{ paddingHorizontal: Spacing.four }} />
      </View>

      {message ? (
        <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>
      ) : null}

      {result ? (
        <Card style={styles.resultCard}>
          <View style={[styles.avatar, { backgroundColor: colors.accentSoft }]}>
            <Text style={[styles.avatarText, { color: colors.accent }]}>{initials(result.name)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.friendName, { color: colors.text }]}>{result.name}</Text>
            <Text style={[styles.friendMsg, { color: colors.textMuted }]}>ID {result.id}</Text>
          </View>
          <PillButton label="Add" icon="person-add-outline" onPress={add} />
        </Card>
      ) : null}
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */

export default function SocialScreen() {
  const { colors } = useTheme();
  const { state, clearFriends } = useAppData();
  const [tab, setTab] = useState<Tab>('chat');
  const [addOpen, setAddOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const onClearPress = () => {
    if (confirmClear) {
      clearFriends();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
    }
  };

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
              <Text style={[styles.segmentLabel, { color: active ? colors.text : colors.textMuted }]}>
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
            onPress={() => setAddOpen(true)}
            style={{ marginTop: Spacing.four, alignSelf: 'stretch' }}
          />

          {state.friends.length === 0 ? (
            <View style={styles.empty}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceAlt }]}>
                <Ionicons name="people-outline" size={28} color={colors.textMuted} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No friends yet</Text>
              <Text style={[styles.emptyBody, { color: colors.textMuted }]}>
                Add a friend with their 11-digit ID.
              </Text>
            </View>
          ) : (
            <>
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

              <Pressable
                onPress={onClearPress}
                style={({ pressed }) => [
                  styles.clearBtn,
                  {
                    borderColor: confirmClear ? colors.danger : colors.border,
                    backgroundColor: confirmClear ? colors.danger : 'transparent',
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Ionicons
                  name="trash-outline"
                  size={16}
                  color={confirmClear ? '#FFFFFF' : colors.danger}
                />
                <Text style={[styles.clearText, { color: confirmClear ? '#FFFFFF' : colors.danger }]}>
                  {confirmClear ? 'Tap again to delete all friends' : 'Delete all friends'}
                </Text>
              </Pressable>
              {confirmClear ? (
                <Pressable onPress={() => setConfirmClear(false)} hitSlop={8}>
                  <Text style={[styles.cancel, { color: colors.textMuted }]}>Cancel</Text>
                </Pressable>
              ) : null}
            </>
          )}
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

      <AddFriendSheet visible={addOpen} onClose={() => setAddOpen(false)} />
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
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: Radii.pill,
    paddingVertical: Spacing.three,
    marginTop: Spacing.four,
  },
  clearText: { fontSize: 14, fontWeight: '800' },
  cancel: { fontSize: 14, fontWeight: '700', textAlign: 'center', marginTop: Spacing.three },
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
  sheetHint: { fontSize: 14, fontWeight: '500', marginBottom: Spacing.three },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.three,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16, fontWeight: '600', letterSpacing: 1 },
  message: { fontSize: 13, fontWeight: '600', marginTop: Spacing.three },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginTop: Spacing.four,
    marginBottom: Spacing.four,
  },
});
