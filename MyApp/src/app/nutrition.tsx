import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ProgressRing } from '@/components/progress-ring';
import { Screen } from '@/components/screen';
import { Card, ComingSoonModal, PillButton, Section, useComingSoon } from '@/components/ui';
import { Spacing, useTheme } from '@/constants/theme';
import { useAppData } from '@/store/app-data';
import { formatInt, todayLabel } from '@/utils/format';

function Macro({
  label,
  value,
  goal,
  color,
}: {
  label: string;
  value: number;
  goal: number;
  color: string;
}) {
  const { colors } = useTheme();
  const pct = goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0;
  return (
    <View style={styles.macro}>
      <ProgressRing value={value} max={goal} size={78} strokeWidth={9} color={color}>
        <Text style={[styles.macroPct, { color: colors.text }]}>{pct}%</Text>
      </ProgressRing>
      <Text style={[styles.macroLabel, { color: colors.text }]}>{label}</Text>
      <Text style={[styles.macroGrams, { color: colors.textMuted }]}>
        {formatInt(value)} / {formatInt(goal)} g
      </Text>
    </View>
  );
}

export default function NutritionScreen() {
  const { colors } = useTheme();
  const soon = useComingSoon();
  const { state, derived } = useAppData();
  const { calorieGoal, proteinGoal, carbGoal, fatGoal } = state.goals;
  const { consumedKcal, consumedProtein, consumedCarb, consumedFat } = derived;
  const remaining = calorieGoal - consumedKcal;

  return (
    <Screen title="Nutrition" subtitle={todayLabel()}>
      {/* Calorie tracker */}
      <Card style={styles.calCard}>
        <ProgressRing
          value={consumedKcal}
          max={calorieGoal}
          size={200}
          strokeWidth={18}
          color={colors.calories}
        >
          <Text style={[styles.calValue, { color: colors.text }]}>{formatInt(consumedKcal)}</Text>
          <Text style={[styles.calUnit, { color: colors.textMuted }]}>of {formatInt(calorieGoal)} kcal</Text>
        </ProgressRing>
        <Text
          style={[
            styles.calRemaining,
            { color: remaining >= 0 ? colors.textMuted : colors.danger },
          ]}
        >
          {remaining >= 0
            ? `${formatInt(remaining)} kcal remaining`
            : `${formatInt(-remaining)} kcal over`}
        </Text>
      </Card>

      {/* Macros */}
      <Section title="Macros">
        <Card style={styles.macroRow}>
          <Macro label="Protein" value={consumedProtein} goal={proteinGoal} color={colors.protein} />
          <Macro label="Carbs" value={consumedCarb} goal={carbGoal} color={colors.carb} />
          <Macro label="Fat" value={consumedFat} goal={fatGoal} color={colors.fat} />
        </Card>
      </Section>

      {/* Actions */}
      <View style={styles.actions}>
        <PillButton
          label="Add meal"
          icon="add"
          variant="primary"
          onPress={() => soon.open('Add meal')}
          style={{ flex: 1 }}
        />
        <PillButton
          label="Scan meal"
          icon="scan-outline"
          variant="outline"
          onPress={() => soon.open('Scan meal')}
          style={{ flex: 1 }}
        />
      </View>

      {/* Meal list */}
      <Section title={`Today's meals (${state.meals.length})`}>
        <Card style={{ gap: Spacing.three }}>
          {state.meals.map((m, i) => (
            <View
              key={m.id}
              style={[
                styles.mealRow,
                i < state.meals.length - 1 && {
                  borderBottomColor: colors.border,
                  borderBottomWidth: StyleSheet.hairlineWidth,
                },
              ]}
            >
              <View style={[styles.mealIcon, { backgroundColor: colors.accentSoft }]}>
                <Ionicons name="fast-food-outline" size={18} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.mealName, { color: colors.text }]}>{m.name}</Text>
                <Text style={[styles.mealMacros, { color: colors.textMuted }]}>
                  P {m.protein}g · C {m.carb}g · F {m.fat}g
                </Text>
              </View>
              <Text style={[styles.mealKcal, { color: colors.text }]}>{formatInt(m.kcal)}</Text>
            </View>
          ))}
        </Card>
      </Section>

      <ComingSoonModal visible={soon.visible} feature={soon.feature} onClose={soon.close} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  calCard: { alignItems: 'center', gap: Spacing.three, marginTop: Spacing.four },
  calValue: { fontSize: 36, fontWeight: '900', letterSpacing: -1 },
  calUnit: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  calRemaining: { fontSize: 14, fontWeight: '700' },
  macroRow: { flexDirection: 'row', justifyContent: 'space-between' },
  macro: { alignItems: 'center', gap: 4, flex: 1 },
  macroPct: { fontSize: 15, fontWeight: '800' },
  macroLabel: { fontSize: 13, fontWeight: '800', marginTop: 2 },
  macroGrams: { fontSize: 11, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: Spacing.three, marginTop: Spacing.five },
  mealRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingBottom: Spacing.three },
  mealIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealName: { fontSize: 15, fontWeight: '700' },
  mealMacros: { fontSize: 12, fontWeight: '500', marginTop: 1 },
  mealKcal: { fontSize: 15, fontWeight: '800' },
});
