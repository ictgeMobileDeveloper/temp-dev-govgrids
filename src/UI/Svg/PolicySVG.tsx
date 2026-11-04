import React from 'react';
import Svg, {Path} from 'react-native-svg';

type Props = {
  size?: number | string;
  primary?: string;
  preserveAspectRatio?: string;
};

export default function PolicySVG({
  size = 19,
  primary = '#01BD91',
  preserveAspectRatio = 'xMidYMid meet',
}: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 16 19"
      fill="none"
      preserveAspectRatio={preserveAspectRatio}>
      <Path
        d="M5.016 9.183l1.666 1.667 3.333-3.334m4.167 2.5c0 4.168-2.917 6.251-6.383 7.46a.833.833 0 01-.558-.009C3.766 16.267.85 14.184.85 10.017V4.183a.833.833 0 01.833-.833c1.666 0 3.75-1 5.2-2.267a.975.975 0 011.266 0c1.458 1.275 3.533 2.267 5.2 2.267a.833.833 0 01.833.833v5.834z"
        stroke={primary}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    </Svg>
  );
}
