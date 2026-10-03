import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ProgressRing } from '@/components/progress-ring';
import { Screen } from '@/components/screen';
import { Sheet } from '@/components/sheet';
import { Card, PillButton, Section, StatCard } from '@/components/ui';
import { Radii, Spacing, useTheme } from '@/constants/theme';
import { ACTIVITY_TYPES, findActivityType } from '@/data/activities';
import { useAppData } from '@/store/app-data';
import { formatFixed, formatInt, greeting, todayLabel } from '@/utils/format';

/** Panel to log an activity: pick a type and enter minutes. */
function LogActivitySheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { colors } = useTheme();
  const { addActivity } = useAppData();
  const [typeId, setTypeId] = useState(ACTIVITY_TYPES[0].id);
  const [minutesText, setMinutesText] = useState('30');

  const minutes = parseInt(minutesText, 10);
  const valid = !Number.isNaN(minutes) && minutes > 0 && minutes <= 600;

  const add = () => {
    if (!valid) return;
    addActivity(typeId, minutes);
    setMinutesText('30');
    onClose();
  };

  return (
    <Sheet visible={visible} title="Log activity" onClose={onClose}>
      <Text style={[styles.sheetLabel, { color: colors.textMuted }]}>Activity</Text>
      <View style={styles.chipWrap}>
        {ACTIVITY_TYPES.map((a) => {
          const active = a.id === typeId;
          return (
            <Pressable
              key={a.id}
              onPress={() => setTypeId(a.id)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? colors.accent : colors.surfaceAlt,
                  borderColor: active ? colors.accent : colors.border,
                },
              ]}
            >
              <Ionicons name={a.icon} size={16} color={active ? '#FFFFFF' : colors.text} />
              <Text style={[styles.chipText, { color: active ? '#FFFFFF' : colors.text }]}>{a.name}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.sheetLabel, { color: colors.textMuted }]}>Minutes</Text>
      <View style={[styles.minutesBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
        <TextInput
          value={minutesText}
          onChangeText={(t) => setMinutesText(t.replace(/\D/g, '').slice(0, 3))}
          keyboardType="number-pad"
          placeholder="30"
          placeholderTextColor={colors.textMuted}
          style={[styles.minutesInput, { color: colors.text }]}
        />
        <Text style={[styles.suffix, { color: colors.textMuted }]}>min</Text>
      </View>

      <PillButton
        label="Add activity"
        icon="checkmark"
        onPress={add}
        style={{ marginTop: Spacing.four, opacity: valid ? 1 : 0.5 }}
      />
    </Sheet>
  );
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const { state, derived, removeActivity } = useAppData();
  const [logOpen, setLogOpen] = useState(false);
  const { stepGoal } = state.goals;
  const {
    todaySteps,
    stepsOverGoal,
    stepGoalPct,
    distanceKm,
    bmrKcal,
    stepKcal,
    activityKcal,
    totalKcal,
    todayActivities,
    weekDays,
    daysHitThisWeek,
  } = derived;

  const hitGoal = todaySteps >= stepGoal;

  return (
    <Screen title={greeting()} subtitle={todayLabel()}>
      {/* Steps hero */}
      <Card style={styles.hero}>
        <ProgressRing
          value={todaySteps}
          max={stepGoal}
          size={210}
          strokeWidth={18}
          color={hitGoal ? colors.success : colors.accent}
        >
          <Text style={[styles.heroSteps, { color: colors.text }]}>{formatInt(todaySteps)}</Text>
          <Text style={[styles.heroUnit, { color: colors.textMuted }]}>steps today</Text>
          <View style={[styles.heroBadge, { backgroundColor: colors.accentSoft }]}>
            <Text style={[styles.heroBadgeText, { color: colors.accent }]}>{stepGoalPct}% of 10,000</Text>
          </View>
        </ProgressRing>

        <View style={styles.heroFooter}>
          {hitGoal ? (
            <>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[styles.heroFooterText, { color: colors.success }]}>
                Goal smashed — {formatInt(stepsOverGoal)} steps over 10,000
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="walk" size={20} color={colors.textMuted} />
              <Text style={[styles.heroFooterText, { color: colors.textMuted }]}>
                {formatInt(Math.abs(stepsOverGoal))} steps to reach 10,000
              </Text>
            </>
          )}
        </View>
      </Card>

      {/* Distance + calories */}
      <View style={styles.statRow}>
        <StatCard
          icon="map-outline"
          label="Distance walked"
          value={formatFixed(distanceKm, 2)}
          unit="km"
        />
        <StatCard
          icon="flame-outline"
          label="Calories lost today"
          value={formatInt(totalKcal)}
          unit="kcal"
          tint={colors.fat}
        />
      </View>
      <Text style={[styles.breakdown, { color: colors.textMuted }]}>
        Estimated from your weight, height, age, sex and activity · resting {formatInt(bmrKcal)}
        {' · '}steps {formatInt(stepKcal)}
        {' · '}activities {formatInt(activityKcal)} kcal
      </Text>

      {/* Activities */}
      <Section
        title="Activities today"
        action={
          <PillButton
            label="Log activity"
            icon="add"
            variant="outline"
            onPress={() => setLogOpen(true)}
          />
        }
      >
        {todayActivities.length === 0 ? (
          <Card style={styles.emptyActivities}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No activities logged today. Add a run, ride or workout to raise your calorie estimate.
            </Text>
          </Card>
        ) : (
          <Card style={{ gap: Spacing.three }}>
            {todayActivities.map((a, i) => {
              const type = findActivityType(a.typeId);
              const kcal = type ? type.met * state.body.weightKg * (a.minutes / 60) : 0;
              return (
                <View
                  key={a.id}
                  style={[
                    styles.activityRow,
                    i < todayActivities.length - 1 && {
                      borderBottomColor: colors.border,
                      borderBottomWidth: StyleSheet.hairlineWidth,
                    },
                  ]}
                >
                  <View style={[styles.activityIcon, { backgroundColor: colors.accentSoft }]}>
                    <Ionicons name={type?.icon ?? 'fitness-outline'} size={18} color={colors.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.activityName, { color: colors.text }]}>
                      {type?.name ?? 'Activity'}
                    </Text>
                    <Text style={[styles.activityMeta, { color: colors.textMuted }]}>
                      {a.minutes} min · {formatInt(kcal)} kcal
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => removeActivity(a.id)}
                    hitSlop={8}
                    accessibilityLabel={`Remove ${type?.name ?? 'activity'}`}
                  >
                    <Ionicons name="close-circle-outline" size={20} color={colors.textMuted} />
                  </Pressable>
                </View>
              );
            })}
          </Card>
        )}
      </Section>

      <LogActivitySheet visible={logOpen} onClose={() => setLogOpen(false)} />

      {/* Weekly breakdown */}
      <Section
        title="This week"
        action={
          <Text style={[styles.weekTag, { color: colors.textMuted }]}>
            {daysHitThisWeek}/7 days over 10k
          </Text>
        }
      >
        <Card style={{ gap: Spacing.three }}>
          {weekDays.map((d, i) => (
            <View
              key={d.key}
              style={[
                styles.dayRow,
                i < weekDays.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
              ]}
            >
              <Text style={[styles.dayLabel, { color: colors.text }]}>{d.label}</Text>

              <View style={styles.dayBarWrap}>
                <View style={[styles.dayTrack, { backgroundColor: colors.track }]}>
                  <View
                    style={[
                      styles.dayFill,
                      {
                        width: `${d.pct}%`,
                        backgroundColor: d.hit ? colors.success : colors.accent,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.daySteps, { color: colors.textMuted }]}>
                  {formatInt(d.steps)}
                </Text>
              </View>

              <View style={styles.dayResult}>
                {d.hit ? (
                  <>
                    <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                    <Text style={[styles.dayYes, { color: colors.success }]}>Yes</Text>
                  </>
                ) : (
                  <Text style={[styles.dayPct, { color: colors.textMuted }]}>{d.pct}%</Text>
                )}
              </View>
            </View>
          ))}
        </Card>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: Spacing.four, marginTop: Spacing.four },
  heroSteps: { fontSize: 40, fontWeight: '900', letterSpacing: -1 },
  heroUnit: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  heroBadge: {
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: 4,
    borderRadius: 999,
  },
  heroBadgeText: { fontSize: 12, fontWeight: '800' },
  heroFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' },
  heroFooterText: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
  statRow: { flexDirection: 'row', gap: Spacing.three, marginTop: Spacing.four },
  weekTag: { fontSize: 12, fontWeight: '700' },
  dayRow: { flexDirection: 'row', alignItems: 'center', paddingBottom: Spacing.three },
  dayLabel: { width: 42, fontSize: 14, fontWeight: '800' },
  dayBarWrap: { flex: 1, gap: 4, paddingRight: Spacing.three },
  dayTrack: { height: 8, borderRadius: 999, overflow: 'hidden' },
  dayFill: { height: 8, borderRadius: 999 },
  daySteps: { fontSize: 11, fontWeight: '600' },
  dayResult: { width: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 3 },
  dayYes: { fontSize: 13, fontWeight: '800' },
  dayPct: { fontSize: 13, fontWeight: '700' },
  breakdown: { fontSize: 12, fontWeight: '600', textAlign: 'center', marginTop: Spacing.two, lineHeight: 17 },
  emptyActivities: { paddingVertical: Spacing.four },
  emptyText: { fontSize: 13, fontWeight: '500', textAlign: 'center', lineHeight: 19 },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingBottom: Spacing.three },
  activityIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  activityName: { fontSize: 15, fontWeight: '700' },
  activityMeta: { fontSize: 12, fontWeight: '500', marginTop: 1 },
  sheetLabel: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: Spacing.two, marginTop: Spacing.two },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: Radii.pill,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  chipText: { fontSize: 13, fontWeight: '700' },
  minutesBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.three,
  },
  minutesInput: { flex: 1, paddingVertical: 12, fontSize: 16, fontWeight: '700' },
  suffix: { fontSize: 14, fontWeight: '700' },
});
