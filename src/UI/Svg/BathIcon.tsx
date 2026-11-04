import React from 'react';
import Svg, {Path} from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  primary?: string; // stroke color
  strokeWidth?: number;
  preserveAspectRatio?: string;
};

export default function BathIcon({
  width = 24,
  height = 24,
  primary = '#000',
  strokeWidth = 2,
  preserveAspectRatio = 'xMidYMid meet',
}: Props) {
  return (
    <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <Path
        d="M6.66634 2.6665L5.33301 3.99984"
        stroke={primary}
        strokeOpacity="0.6"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11.333 12.6665V13.9998"
        stroke={primary}
        strokeOpacity="0.6"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M1.33301 8H14.6663"
        stroke={primary}
        strokeOpacity="0.6"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4.66699 12.6665V13.9998"
        stroke={primary}
        strokeOpacity="0.6"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6.00033 3.33336L5.08099 2.41403C4.8882 2.22034 4.64341 2.08667 4.37625 2.02919C4.10908 1.97171 3.83098 1.99288 3.57559 2.09014C3.3202 2.1874 3.09847 2.35659 2.93722 2.57722C2.77596 2.79786 2.6821 3.0605 2.66699 3.33336V11.3334C2.66699 11.687 2.80747 12.0261 3.05752 12.2762C3.30756 12.5262 3.6467 12.6667 4.00033 12.6667H12.0003C12.3539 12.6667 12.6931 12.5262 12.9431 12.2762C13.1932 12.0261 13.3337 11.687 13.3337 11.3334V8.00003"
        stroke={primary}
        strokeOpacity="0.6"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
