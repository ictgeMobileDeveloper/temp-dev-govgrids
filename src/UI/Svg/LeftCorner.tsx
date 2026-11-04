import React, {useRef} from 'react';
import {AccessibilityProps} from 'react-native';
import Svg, {Path, Defs, LinearGradient, Stop} from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  primary?: string;
  secondary?: string;
  preserveAspectRatio?: string;
} & AccessibilityProps;

export default function LeftCorner({
  width = 67,
  height = 71,
  primary = '#01BD91',
  secondary = '#98C1D9',
  preserveAspectRatio = 'xMidYMid meet',
  ...accessibilityProps
}: Props) {
  const gradId = useRef(
    `lc_grad_${Math.random().toString(36).slice(2, 8)}`,
  ).current;

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 67 71"
      preserveAspectRatio={preserveAspectRatio}
      {...accessibilityProps}>
      <Defs>
        <LinearGradient
          id={gradId}
          x1="41.12"
          y1="-63.0614"
          x2="-27.1174"
          y2="59.4369"
          gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={primary} />
          <Stop offset="1" stopColor={secondary} />
        </LinearGradient>
      </Defs>

      <Path
        d="M-13.6626 -29.7937C-23.4509 -24.1361 -35.4986 -10.6417 -26.6539 -4.69866C-20.1536 -0.33093 -24.8131 -3.60889 -15.2734 2.23639C-5.73369 8.08168 2.43146 17.6354 -7.23724 25.2685C-12.75 29.6206 -11.2151 27.9741 -15.0425 32.0463C-28.8732 46.7616 -3.61502 78.3169 14.2331 69.1753C26.0638 63.1157 20.0195 49.4448 28.1804 39.1295C38.0961 26.5963 55.4961 29.3859 61.7676 15.0059C66.5104 4.13109 70.2171 -7.25013 61.3779 -14.3482C49.8984 -23.5665 50.2626 -2.06112 37.6808 -9.90108C31.8355 -13.5434 23.6414 -11.5237 21.0902 -17.8176C17.9717 -25.5113 19.6193 -23.3867 13.5826 -29.1261C6.26585 -36.0824 -4.20563 -35.2599 -13.6626 -29.7937Z"
        fill={`url(#${gradId})`}
      />
    </Svg>
  );
}
