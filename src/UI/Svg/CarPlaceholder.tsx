import React from 'react';
import {View, StyleSheet} from 'react-native';
import Svg, {Path} from 'react-native-svg';

export default function VehiclePlaceholder({
  backgroundColor = '#F0F4F8', // Dynamic background color
  iconColor = '#000000', // Dynamic SVG stroke color
  size = 48,
  width = '100%',
  height = '100%',
}) {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          width,
          height,
        },
      ]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M3 8l2.722 2.268a1 1 0 00.64.232h11.276a1 1 0 00.64-.232L21 8M6.5 14h.01m10.99 0h.01M8.16 4.5h7.68a2 2 0 011.736 1.008l2.897 5.07A4 4 0 0121 12.562V18.5a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1H6v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-5.938a4 4 0 01.527-1.984l2.897-5.07A2 2 0 018.161 4.5zM7 14a.5.5 0 11-1 0 .5.5 0 011 0zm11 0a.5.5 0 11-1 0 .5.5 0 011 0z"
          stroke={iconColor}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center', // Centers SVG vertically
    alignItems: 'center', // Centers SVG horizontally
    borderRadius: 12,
    padding: 16,
  },
});
