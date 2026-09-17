import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { BigButton, ComingSoonModal, useComingSoon } from '@/components/ui';
import { Spacing, useTheme } from '@/constants/theme';

export default function WorkoutScreen() {
  const { colors } = useTheme();
  const soon = useComingSoon();

  return (
    <Screen title="Workout" subtitle="Build it, generate it, or just start moving">
      <View style={styles.buttons}>
        <BigButton
          label="Create plan"
          sublabel="Design a multi-week training plan"
          icon="create-outline"
          variant="primary"
          onPress={() => soon.open('Create plan')}
        />
        <BigButton
          label="Generate workout"
          sublabel="Let PePal build a session for you"
          icon="sparkles-outline"
          variant="secondary"
          onPress={() => soon.open('Generate workout')}
        />
        <BigButton
          label="Start empty workout"
          sublabel="Log exercises as you go"
          icon="add-circle-outline"
          variant="outline"
          onPress={() => soon.open('Start empty workout')}
        />
      </View>

      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Your recent workouts will show up here once you start logging.
      </Text>

      <ComingSoonModal visible={soon.visible} feature={soon.feature} onClose={soon.close} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  buttons: { gap: Spacing.three, marginTop: Spacing.four },
  hint: { fontSize: 13, fontWeight: '500', textAlign: 'center', marginTop: Spacing.six },
});
