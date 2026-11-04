// components/ForwardArrowIcon.tsx
import React from 'react';
import Svg, {Path} from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  primary?: string; // stroke color
  strokeWidth?: number;
  preserveAspectRatio?: string;
};

export default function BedIcon({
  width = 24,
  height = 24,
  primary = '#000',
  strokeWidth = 2,
  preserveAspectRatio = 'xMidYMid meet',
}: Props) {
  return (
    <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <Path
        d="M1.33301 2.6665V13.3332"
        stroke={primary}
        strokeOpacity="0.6"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M1.33301 5.3335H13.333C13.6866 5.3335 14.0258 5.47397 14.2758 5.72402C14.5259 5.97407 14.6663 6.31321 14.6663 6.66683V13.3335"
        stroke={primary}
        strokeOpacity="0.6"
        strokeWidth="1.33333"
        strokeLinecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M1.33301 11.3335H14.6663"
        stroke={primary}
        strokeOpacity="0.6"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4 5.3335V11.3335"
        stroke={primary}
        strokeOpacity="0.6"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
