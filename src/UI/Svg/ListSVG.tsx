import React from 'react';
import Svg, {Path} from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  primary?: string;
  preserveAspectRatio?: string;
};

export default function ListVector({
  width = 24,
  height = 24,
  primary = '#01BD91',
  preserveAspectRatio = 'xMidYMid meet',
}: Props) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      preserveAspectRatio={preserveAspectRatio}>
      <Path
        d="M8 11h13v2H8zm0-5h13v2H8zm0 10h13v2H8zM3 5.5h3v3H3zm0 5h3v3H3zm0 5h3v3H3z"
        fill={primary}
      />
    </Svg>
  );
}
