import React from 'react';
import Svg, {Path, G} from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  primary?: string; // inner icon color
  secondary?: string; // background circle color
  inverted?: boolean;
};

export default function BackArrowIcon({
  width = 24,
  height = 24,
  primary = '#ffffff',
  inverted = false,
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <G transform={inverted ? 'rotate(180 12 12)' : undefined}>
        <Path
          d="M15 18L9 12L15 6"
          stroke={primary}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
}
