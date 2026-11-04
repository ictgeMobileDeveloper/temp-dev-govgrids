import React from 'react';
import Svg, {Rect, G, Path} from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  primary?: string; // inner icon color
  secondary?: string; // background circle color
  preserveAspectRatio?: string;
};

export default function TickIcon({
  width = 14,
  height = 16,
  primary = '#FAFAFA',
  preserveAspectRatio = 'xMidYMid meet',
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 14 16" fill="none">
      <Path
        d="M11.6663 4.5L5.24967 10.9167L2.33301 8"
        stroke={primary}
        strokeWidth="2.0"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
