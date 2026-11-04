import React from 'react';
import Svg, {Path} from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  color?: string;
  preserveAspectRatio?: string;
};

export default function FlagVector({
  width = 40,
  height = 40,
  color = '#01BD91',
  preserveAspectRatio = 'xMidYMid meet',
}: Props) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 40 40"
      fill="none"
      preserveAspectRatio={preserveAspectRatio}>
      <Path
        d="M8.33301 35.0001V6.66675H23.333L23.9997 10.0001H33.333V26.6667H21.6663L20.9997 23.3334H11.6663V35.0001H8.33301Z"
        fill={color}
      />
    </Svg>
  );
}
