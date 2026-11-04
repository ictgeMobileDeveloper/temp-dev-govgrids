import React from 'react';
import Svg, {Path} from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  color?: string;
  preserveAspectRatio?: string;
};

export default function ExternalLinkVector({
  width = 40,
  height = 40,
  color = '#000000',
  preserveAspectRatio = 'xMidYMid meet',
}: Props) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      preserveAspectRatio={preserveAspectRatio}>
      <Path
        d="M14 3.5L8.5 9 7 7.5 12.5 2H10V0h6v6h-2V3.5zM6 0v2H2v12h12v-4h2v6H0V0h6z"
        fill={color}
        fillRule="evenodd"
      />
    </Svg>
  );
}
