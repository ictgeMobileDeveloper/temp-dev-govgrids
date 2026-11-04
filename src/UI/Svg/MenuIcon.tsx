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
  primary?: string;
  secondary?: string;
};

export default function MenuIcon({
  width = 24,
  height = 24,
  primary = '#1E1E1E',
}: Props) {
  return (
    <Svg width="25" height="24" viewBox="0 0 25 24" fill="none">
      <Path
        d="M8.5 6H21.5M8.5 12H21.5M8.5 18H21.5M3.5 6H3.51M3.5 12H3.51M3.5 18H3.51"
        stroke="#F9F9F9"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
