import React from 'react';
import {AccessibilityProps} from 'react-native';
import Svg, {Path, Defs, LinearGradient, Stop} from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  primary?: string;
  secondary?: string;
  preserveAspectRatio?: string;
} & AccessibilityProps;

export default function RightCorner({
  width = 69,
  height = 70,
  primary = '#01BD91',
  secondary = '#98C1D9',
  preserveAspectRatio = 'xMidYMid meet',
  ...accessibilityProps
}: Props) {
  const gradId = 'rc_grad_1';

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 69 70"
      preserveAspectRatio={preserveAspectRatio}
      {...accessibilityProps}>
      <Defs>
        <LinearGradient
          id={gradId}
          x1="134.905"
          y1="42.8295"
          x2="11.6128"
          y2="-23.963"
          gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={primary} />
          <Stop offset="1" stopColor={secondary} />
        </LinearGradient>
      </Defs>

      <Path
        d="M100.995 -11.5582C95.2231 -21.2793 81.588 -33.1675 75.7494 -24.2535C71.4584 -17.7023 74.6813 -22.4001 68.9486 -12.7923C63.2159 -3.1845 53.7589 5.09241 46.0126 -4.48588C41.596 -9.94713 43.2604 -8.43165 39.1435 -12.2109C24.2666 -25.8677 -6.98959 -0.240217 2.36126 17.4992C8.55955 29.2578 22.1584 23.0532 32.569 31.0923C45.2179 40.8599 42.6331 58.2915 57.0858 64.3935C68.0156 69.0082 79.4396 72.5807 86.4333 63.6588C95.516 52.0716 74.0164 52.6886 81.7079 40.0156C85.2812 34.1279 83.1653 25.9581 89.4288 23.3331C97.0853 20.1243 94.9802 21.7968 100.648 15.693C107.518 8.29497 106.572 -2.16612 100.995 -11.5582Z"
        fill={`url(#${gradId})`}
      />
    </Svg>
  );
}
