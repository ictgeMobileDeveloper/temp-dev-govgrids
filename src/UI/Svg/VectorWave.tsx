import React from 'react';
import Svg, {Path, Defs, LinearGradient, Stop} from 'react-native-svg';
import {AccessibilityProps} from 'react-native';
import {normalized} from '../../Utils/AppConstants';

type Props = Partial<AccessibilityProps> & {
  width?: number | string;
  height?: number | string;
  primary?: string;
  secondary?: string;
  preserveAspectRatio?: string;
};

export default function VectorWave({
  width = '100%',
  height = normalized(119),
  primary = '#01BD91',
  secondary = '#98C1D9',
  // preserveAspectRatio = 'xMidYMid meet',
  preserveAspectRatio = 'none',
  accessible,
  accessibilityElementsHidden,
  importantForAccessibility,
}: Props) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 390 119"
      preserveAspectRatio={preserveAspectRatio}
      accessible={accessible}
      accessibilityElementsHidden={accessibilityElementsHidden}
      importantForAccessibility={importantForAccessibility}>
      <Defs>
        <LinearGradient
          id="paint0_linear_173_2398"
          x1="-0.999999"
          y1="-8.18125"
          x2="29.4712"
          y2="173.951"
          gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={primary} />
          <Stop offset="1" stopColor={secondary} />
        </LinearGradient>
      </Defs>

      <Path
        d="M91.9756 118.946C54.6807 117.406 45.3404 74.8318 8.04627 73.2746C4.51657 73.1272 -1 73.2746 -1 73.2746V0H390C390 0 364.049 43.327 337.733 59.7238C289.777 89.6039 247.09 43.3626 192.992 59.7238C149.211 72.9649 137.682 120.832 91.9756 118.946Z"
        fill="url(#paint0_linear_173_2398)"
      />
    </Svg>
  );
}
