import React from 'react';
import {View, StyleSheet} from 'react-native';
import Svg, {Path} from 'react-native-svg';

export default function IssuePortalPlaceholder({
  backgroundColor = '#F0F4F8',
  iconColor = '#292D32',
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
          d="M12 7.75V13M21.08 8.58v6.84c0 1.12-.6 2.16-1.57 2.73l-5.94 3.43c-.97.56-2.17.56-3.15 0l-5.94-3.43a3.15 3.15 0 01-1.57-2.73V8.58c0-1.12.6-2.16 1.57-2.73l5.94-3.43c.97-.56 2.17-.56 3.15 0l5.94 3.43c.97.57 1.57 1.6 1.57 2.73z"
          stroke={iconColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M12 16.2v.1"
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
