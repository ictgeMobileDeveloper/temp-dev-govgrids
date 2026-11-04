// components/ForwardArrowIcon.tsx
import React from 'react';
import Svg, { Path } from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  color?: string; // stroke color
  strokeWidth?: number;
  preserveAspectRatio?: string;
};

export default function ForwardArrowIcon({
  width = 24,
  height = 24,
  color = '#00FF88', // from #00ff88ff (opaque)
  strokeWidth = 2,
  preserveAspectRatio = 'xMidYMid meet',
}: Props) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      preserveAspectRatio={preserveAspectRatio}
      fill="none"
    >
      <Path
        d="M5 12.0005H19M19 12.0005L12 5.00049M19 12.0005L12 19.0005"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
