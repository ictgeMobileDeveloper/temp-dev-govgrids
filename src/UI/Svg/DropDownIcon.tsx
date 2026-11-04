import React from 'react';
import Svg, {G, Path} from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  primary?: string; // stroke color
};

export default function DropDownIcon({
  primary = 'black',
  width = 16,
  height = 16,
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
      <G>
        <Path
          d="M4 6L8 10L12 6"
          stroke={primary}
          strokeWidth={1.3333}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
}
