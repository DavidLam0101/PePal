import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ProgressRing } from '@/components/progress-ring';
import { Screen } from '@/components/screen';
import { Sheet } from '@/components/sheet';
import { Card, ComingSoonModal, PillButton, Section, useComingSoon } from '@/components/ui';
import { Radii, Spacing, useTheme } from '@/constants/theme';
import { FOODS, type Food } from '@/data/foods';
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

/** Panel listing example foods. Tapping one logs it and updates the tracker. */
function AddMealSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { colors } = useTheme();
  const { addMeal } = useAppData();
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  const choose = (food: Food) => {
    addMeal({
      name: `${food.name} (${food.serving})`,
      kcal: food.kcal,
      protein: food.protein,
      carb: food.carb,
      fat: food.fat,
    });
    setLastAdded(food.name);
  };

  const close = () => {
    setLastAdded(null);
    onClose();
  };

  return (
    <Sheet visible={visible} title="Add meal" onClose={close}>
      <Text style={[styles.sheetHint, { color: colors.textMuted }]}>
        Tap a food to add it to today&apos;s meals.
      </Text>
      {lastAdded ? (
        <View style={[styles.addedBanner, { backgroundColor: colors.accentSoft }]}>
          <Ionicons name="checkmark-circle" size={18} color={colors.success} />
          <Text style={[styles.addedText, { color: colors.accent }]}>{lastAdded} added</Text>
        </View>
      ) : null}
      <View style={{ gap: Spacing.two }}>
        {FOODS.map((food) => (
          <Pressable
            key={food.id}
            onPress={() => choose(food)}
            style={({ pressed }) => [
              styles.foodRow,
              { backgroundColor: colors.surfaceAlt, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.foodName, { color: colors.text }]}>{food.name}</Text>
              <Text style={[styles.foodMeta, { color: colors.textMuted }]}>
                {food.serving} · P {food.protein}g · C {food.carb}g · F {food.fat}g
              </Text>
            </View>
            <Text style={[styles.foodKcal, { color: colors.text }]}>{formatInt(food.kcal)} kcal</Text>
            <Ionicons name="add-circle" size={22} color={colors.accent} />
          </Pressable>
        ))}
      </View>
    </Sheet>
  );
}

export default function NutritionScreen() {
  const { colors } = useTheme();
  const soon = useComingSoon();
  const { state, derived, removeMeal } = useAppData();
  const [addOpen, setAddOpen] = useState(false);
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
        <Text style={[styles.calRemaining, { color: remaining >= 0 ? colors.textMuted : colors.danger }]}>
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
          onPress={() => setAddOpen(true)}
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
        {state.meals.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="restaurant-outline" size={28} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No meals logged today</Text>
            <Text style={[styles.emptyBody, { color: colors.textMuted }]}>
              Tap Add meal to log what you eat.
            </Text>
          </Card>
        ) : (
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
                    P {Math.round(m.protein)}g · C {Math.round(m.carb)}g · F {Math.round(m.fat)}g
                  </Text>
                </View>
                <Text style={[styles.mealKcal, { color: colors.text }]}>{formatInt(m.kcal)}</Text>
                <Pressable onPress={() => removeMeal(m.id)} hitSlop={8} accessibilityLabel={`Remove ${m.name}`}>
                  <Ionicons name="close-circle-outline" size={20} color={colors.textMuted} />
                </Pressable>
              </View>
            ))}
          </Card>
        )}
      </Section>

      <AddMealSheet visible={addOpen} onClose={() => setAddOpen(false)} />
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
  mealIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  mealName: { fontSize: 15, fontWeight: '700' },
  mealMacros: { fontSize: 12, fontWeight: '500', marginTop: 1 },
  mealKcal: { fontSize: 15, fontWeight: '800' },
  emptyCard: { alignItems: 'center', gap: 6, paddingVertical: Spacing.five },
  emptyTitle: { fontSize: 15, fontWeight: '800', marginTop: 4 },
  emptyBody: { fontSize: 13, fontWeight: '500', textAlign: 'center' },
  sheetHint: { fontSize: 14, fontWeight: '500', marginBottom: Spacing.three },
  addedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radii.md,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.three,
  },
  addedText: { fontSize: 13, fontWeight: '700' },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.md,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  foodName: { fontSize: 15, fontWeight: '700' },
  foodMeta: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  foodKcal: { fontSize: 13, fontWeight: '800' },
});
