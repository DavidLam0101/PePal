import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Screen } from '@/components/screen';
import { Card, Section } from '@/components/ui';
import { Radii, Spacing, useTheme } from '@/constants/theme';
import { useAppData } from '@/store/app-data';

function TextField({
  label,
  value,
  placeholder,
  keyboardType = 'default',
  suffix,
  onCommit,
}: {
  label: string;
  value: string;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric';
  suffix?: string;
  onCommit: (next: string) => void;
}) {
  const { colors } = useTheme();
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{label}</Text>
      <View style={[styles.inputWrap, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onEndEditing={() => onCommit(draft)}
          onBlur={() => onCommit(draft)}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType={keyboardType}
          style={[styles.input, { color: colors.text }]}
        />
        {suffix ? <Text style={[styles.suffix, { color: colors.textMuted }]}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/** Formats an 11-digit ID as 3-4-4 for readability (e.g. 482 1390 7651). */
function formatId(id: string): string {
  return `${id.slice(0, 3)} ${id.slice(3, 7)} ${id.slice(7)}`;
}

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { state, setName, setAvatarUri, setBody } = useAppData();
  const { profile, body } = state;

  const commitNumber = (key: 'weightKg' | 'heightCm' | 'age') => (raw: string) => {
    const n = parseFloat(raw.replace(',', '.'));
    if (!Number.isNaN(n) && n > 0) setBody({ [key]: Math.round(n * 10) / 10 });
  };

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <Screen title="Profile" subtitle="Account and personal details">
        {/* Identity */}
        <Section title="Profile">
          <Card style={{ gap: Spacing.four }}>
            <View style={styles.avatarRow}>
              <Pressable onPress={pickPhoto} accessibilityLabel="Change profile picture">
                <View style={[styles.avatar, { backgroundColor: colors.accentSoft }]}>
                  {profile.avatarUri ? (
                    <Image source={{ uri: profile.avatarUri }} style={styles.avatarImg} contentFit="cover" />
                  ) : (
                    <Text style={[styles.avatarText, { color: colors.accent }]}>
                      {initials(profile.name || 'PePal')}
                    </Text>
                  )}
                </View>
              </Pressable>
              <Pressable
                onPress={pickPhoto}
                style={({ pressed }) => [
                  styles.photoBtn,
                  { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Ionicons name="camera-outline" size={16} color={colors.text} />
                <Text style={[styles.photoBtnText, { color: colors.text }]}>Change photo</Text>
              </Pressable>
            </View>

            <TextField label="Name" value={profile.name} onCommit={setName} placeholder="Your name" />

            {/* Locked ID — display only */}
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>ID</Text>
              <View
                style={[
                  styles.inputWrap,
                  styles.lockedWrap,
                  { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                ]}
              >
                <Text selectable style={[styles.lockedText, { color: colors.text }]}>
                  {formatId(profile.id)}
                </Text>
                <Ionicons name="lock-closed" size={14} color={colors.textMuted} />
              </View>
              <Text style={[styles.note, { color: colors.textMuted }]}>
                Friends use this 11-digit ID to find you. It can&apos;t be changed.
              </Text>
            </View>
          </Card>
        </Section>

        {/* Personal information */}
        <Section title="Personal information">
          <Card style={{ gap: Spacing.two }}>
            <Text style={[styles.groupTitle, { color: colors.text }]}>Body</Text>
            <View style={styles.bodyRow}>
              <View style={{ flex: 1 }}>
                <TextField
                  label="Weight"
                  value={String(body.weightKg)}
                  keyboardType="numeric"
                  suffix="kg"
                  onCommit={commitNumber('weightKg')}
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextField
                  label="Height"
                  value={String(body.heightCm)}
                  keyboardType="numeric"
                  suffix="cm"
                  onCommit={commitNumber('heightCm')}
                />
              </View>
            </View>
            <View style={styles.bodyRow}>
              <View style={{ flex: 1 }}>
                <TextField
                  label="Age"
                  value={String(body.age)}
                  keyboardType="numeric"
                  suffix="yrs"
                  onCommit={commitNumber('age')}
                />
              </View>
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Sex</Text>
                <View style={[styles.segment, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                  {(['male', 'female'] as const).map((s) => {
                    const active = body.sex === s;
                    return (
                      <Pressable
                        key={s}
                        onPress={() => setBody({ sex: s })}
                        style={[styles.segmentItem, active && { backgroundColor: colors.accent }]}
                      >
                        <Text style={[styles.segmentText, { color: active ? '#FFFFFF' : colors.textMuted }]}>
                          {s === 'male' ? 'Male' : 'Female'}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>
            <Text style={[styles.note, { color: colors.textMuted }]}>
              Used to estimate your daily calories burned from weight, height, age and activity.
            </Text>
          </Card>
        </Section>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.four },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarText: { fontSize: 20, fontWeight: '800' },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: Radii.pill,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  photoBtnText: { fontSize: 14, fontWeight: '700' },
  field: { gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.three,
  },
  input: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 16,
    fontWeight: '600',
  },
  lockedWrap: { paddingVertical: 12, justifyContent: 'space-between' },
  lockedText: { fontSize: 16, fontWeight: '700', letterSpacing: 1 },
  suffix: { fontSize: 14, fontWeight: '700', marginLeft: 6 },
  groupTitle: { fontSize: 15, fontWeight: '800', marginBottom: Spacing.two },
  bodyRow: { flexDirection: 'row', gap: Spacing.three },
  segment: { flexDirection: 'row', borderRadius: Radii.md, borderWidth: StyleSheet.hairlineWidth, padding: 3, height: 48 },
  segmentItem: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: Radii.sm },
  segmentText: { fontSize: 14, fontWeight: '700' },
  note: { fontSize: 12, fontWeight: '500', marginTop: Spacing.two },
});
