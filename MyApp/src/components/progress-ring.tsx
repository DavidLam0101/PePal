import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '@/constants/theme';

type Props = {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  /** Round the line caps. */
  rounded?: boolean;
  children?: React.ReactNode;
  style?: ViewStyle;
};

export function ProgressRing({
  value,
  max,
  size = 180,
  strokeWidth = 16,
  color,
  trackColor,
  rounded = true,
  children,
  style,
}: Props) {
  const theme = useTheme();
  const stroke = color ?? theme.colors.accent;
  const track = trackColor ?? theme.colors.track;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  const dashOffset = circumference * (1 - pct);
  const center = size / 2;

  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={track}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap={rounded ? 'round' : 'butt'}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      {children != null && <View style={[StyleSheet.absoluteFill, styles.center]}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
