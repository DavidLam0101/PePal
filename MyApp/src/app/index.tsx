import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ProgressRing } from '@/components/progress-ring';
import { Screen } from '@/components/screen';
import { Card, Section, StatCard } from '@/components/ui';
import { Spacing, useTheme } from '@/constants/theme';
import { useAppData } from '@/store/app-data';
import { formatFixed, formatInt, greeting, todayLabel } from '@/utils/format';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { state, derived } = useAppData();
  const { stepGoal } = state.goals;
  const {
    todaySteps,
    stepsOverGoal,
    stepGoalPct,
    distanceKm,
    caloriesBurned,
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
          label="Calories burned"
          value={formatInt(caloriesBurned)}
          unit="kcal"
          tint={colors.fat}
        />
      </View>

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
});
