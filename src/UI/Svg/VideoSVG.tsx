import React from 'react';
import Svg, {Path} from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  primary?: string; // Color of the play triangle path
  secondary?: string; // Left available for consistency with your other icons
};

export default function PlayIcon({
  width = 30,
  height = 30,
  primary = '#3b82f6',
  secondary = '#3b82f6',
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 192 192" fill="none">
      {/* Inner Play Triangle */}
      <Path
        d="M56 42l98 54-98 54z"
        stroke={primary}
        strokeWidth={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
