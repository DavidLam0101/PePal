import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Radii, Spacing, useTheme } from '@/constants/theme';

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

export function Section({
  title,
  action,
  children,
  style,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.section, style]}>
      {(title || action) && (
        <View style={styles.sectionHead}>
          {title ? (
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{title}</Text>
          ) : (
            <View />
          )}
          {action}
        </View>
      )}
      {children}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* StatCard                                                            */
/* ------------------------------------------------------------------ */

export function StatCard({
  icon,
  label,
  value,
  unit,
  tint,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  unit?: string;
  tint?: string;
}) {
  const { colors } = useTheme();
  const color = tint ?? colors.accent;
  return (
    <Card style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: colors.accentSoft }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>
        {value}
        {unit ? <Text style={[styles.statUnit, { color: colors.textMuted }]}> {unit}</Text> : null}
      </Text>
      <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* BigButton                                                           */
/* ------------------------------------------------------------------ */

type BigButtonProps = {
  label: string;
  sublabel?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'secondary' | 'outline';
  onPress: () => void;
};

export function BigButton({
  label,
  sublabel,
  icon,
  variant = 'primary',
  onPress,
}: BigButtonProps) {
  const { colors } = useTheme();

  const bg =
    variant === 'primary'
      ? colors.accent
      : variant === 'secondary'
        ? colors.accentSoft
        : 'transparent';
  const fg =
    variant === 'primary' ? '#FFFFFF' : variant === 'secondary' ? colors.accent : colors.text;
  const borderColor = variant === 'outline' ? colors.border : 'transparent';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.bigButton,
        { backgroundColor: bg, borderColor, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      {icon && <Ionicons name={icon} size={22} color={fg} style={{ marginRight: Spacing.three }} />}
      <View style={{ flex: 1 }}>
        <Text style={[styles.bigButtonLabel, { color: fg }]}>{label}</Text>
        {sublabel && (
          <Text style={[styles.bigButtonSub, { color: fg, opacity: 0.75 }]}>{sublabel}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={fg} style={{ opacity: 0.7 }} />
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* Pill button (small)                                                 */
/* ------------------------------------------------------------------ */

export function PillButton({
  label,
  icon,
  onPress,
  variant = 'primary',
  style,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant?: 'primary' | 'outline';
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const primary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        {
          backgroundColor: primary ? colors.accent : 'transparent',
          borderColor: primary ? 'transparent' : colors.border,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={18}
          color={primary ? '#FFFFFF' : colors.text}
          style={{ marginRight: 6 }}
        />
      )}
      <Text style={[styles.pillLabel, { color: primary ? '#FFFFFF' : colors.text }]}>{label}</Text>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* ComingSoonModal                                                     */
/* ------------------------------------------------------------------ */

export function ComingSoonModal({
  visible,
  feature,
  onClose,
}: {
  visible: boolean;
  feature: string;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.sheetIcon, { backgroundColor: colors.accentSoft }]}>
            <Ionicons name="sparkles" size={24} color={colors.accent} />
          </View>
          <Text style={[styles.sheetTitle, { color: colors.text }]}>{feature}</Text>
          <Text style={[styles.sheetBody, { color: colors.textMuted }]}>
            This feature isn&apos;t wired up yet — it&apos;s coming in a future update.
          </Text>
          <PillButton label="Got it" icon="checkmark" onPress={onClose} style={{ marginTop: Spacing.four }} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/** Small hook to drive a ComingSoonModal. */
export function useComingSoon() {
  const [feature, setFeature] = React.useState<string | null>(null);
  return {
    feature: feature ?? '',
    visible: feature !== null,
    open: (f: string) => setFeature(f),
    close: () => setFeature(null),
  };
}

/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  section: { marginTop: Spacing.five },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  card: {
    borderRadius: Radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.four,
  },
  statCard: { flex: 1, gap: 6 },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: Radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statValue: { fontSize: 22, fontWeight: '800' },
  statUnit: { fontSize: 13, fontWeight: '600' },
  statLabel: { fontSize: 13, fontWeight: '600' },
  bigButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radii.lg,
    borderWidth: 1,
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.four,
  },
  bigButtonLabel: { fontSize: 17, fontWeight: '800' },
  bigButtonSub: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.pill,
    borderWidth: 1,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.five,
  },
  pillLabel: { fontSize: 15, fontWeight: '700' },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.five,
  },
  sheet: {
    width: '100%',
    maxWidth: 360,
    borderRadius: Radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.five,
    alignItems: 'center',
  },
  sheetIcon: {
    width: 48,
    height: 48,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
  },
  sheetTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  sheetBody: { fontSize: 14, textAlign: 'center', marginTop: 6, lineHeight: 20 },
});
