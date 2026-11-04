import React from 'react';
import Svg, {
  Rect,
  G,
  Path,
  Defs,
  Stop,
  LinearGradient,
  ClipPath,
} from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  primary?: string; // inner icon color
  secondary?: string; // background circle color
  strokeWidth?: number;
};

export default function CloseIcon({
  width = 32,
  height = 32,
  primary = '#000',
  strokeWidth = 1,
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 32 32" fill="none">
      <Path
        d="M11.5 11.5L16 16M16 16L11.5 20.5M16 16L20.5 20.5M16 16L20.5 11.5"
        stroke={primary}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
