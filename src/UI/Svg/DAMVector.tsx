import React from 'react';
import Svg, {Path} from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  color?: string;
  preserveAspectRatio?: string;
};

export default function DAMVector({
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
        d="M22.5 5V16.25L26.25 12.5L30 16.25V5H35V35H12.5V5H22.5ZM5 5H10V35H5V5Z"
        fill={color}
      />
    </Svg>
  );
}
