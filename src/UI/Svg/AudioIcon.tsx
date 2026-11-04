import React from 'react';
import Svg, {G, Path, Ellipse} from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  primary?: string; // Musical note stroke color
  secondary?: string; // Left available for consistency
};

export default function AudioIcon({
  width = 30,
  height = 30,
  primary = '#ec4899',
  secondary = '#ec4899',
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 192 192" fill="none">
      {/* Musical Note */}
      <G
        strokeWidth={10}
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke={primary}>
        <Path d="M72 148V48l78-12v92" />
        <Ellipse cx={56} cy={148} rx={16} ry={12} />
        <Ellipse cx={134} cy={128} rx={16} ry={12} />
      </G>
    </Svg>
  );
}
