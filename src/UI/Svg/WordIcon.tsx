import React from 'react';
import Svg, {Path} from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  primary?: string; // Text lines stroke color
  secondary?: string; // Left available for consistency
};

export default function WordIcon({
  width = 30,
  height = 30,
  primary = '#2563eb',
  secondary = '#2563eb',
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 192 192" fill="none">
      {/* Document Lines */}
      <Path
        d="M34 48h124M34 84h124M34 120h124M34 156h84"
        stroke={primary}
        strokeWidth={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
