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

export default function SquareIcon({
  width = 24,
  height = 24,
  primary = '#000',
  strokeWidth = 2,
  preserveAspectRatio = 'xMidYMid meet',
}: Props) {
  return (
    <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <Path
        d="M5.33333 2H3.33333C2.97971 2 2.64057 2.14048 2.39052 2.39052C2.14048 2.64057 2 2.97971 2 3.33333V5.33333"
        stroke={primary}
        strokeOpacity="0.6"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14.0003 5.33333V3.33333C14.0003 2.97971 13.8598 2.64057 13.6098 2.39052C13.3598 2.14048 13.0206 2 12.667 2H10.667"
        stroke={primary}
        strokeOpacity="0.6"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M2 10.6665V12.6665C2 13.0201 2.14048 13.3593 2.39052 13.6093C2.64057 13.8594 2.97971 13.9998 3.33333 13.9998H5.33333"
        stroke={primary}
        strokeOpacity="0.6"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10.667 13.9998H12.667C13.0206 13.9998 13.3598 13.8594 13.6098 13.6093C13.8598 13.3593 14.0003 13.0201 14.0003 12.6665V10.6665"
        stroke={primary}
        strokeOpacity="0.6"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
