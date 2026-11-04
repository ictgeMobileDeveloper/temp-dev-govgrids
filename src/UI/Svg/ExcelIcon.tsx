import React from 'react';
import Svg, {G, Rect, Path} from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  primary?: string; // Grid and border stroke color
  secondary?: string; // Left available for consistency
};

export default function ExcelIcon({
  width = 20,
  height = 20,
  primary = '#16a34a',
  secondary = '#16a34a',
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 192 192" fill="none">
      {/* Spreadsheet Grid Structure */}
      <G
        strokeWidth={10}
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke={primary}>
        <Rect x={30} y={30} width={132} height={132} rx={12} />
        <Path d="M30 74h132M30 118h132M74 30v132m44-132v132" />
      </G>
    </Svg>
  );
}
