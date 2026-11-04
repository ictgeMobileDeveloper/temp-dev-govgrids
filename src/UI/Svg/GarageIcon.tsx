import React from 'react';
import Svg, {ClipPath, Defs, G, Path, Rect} from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  primary?: string; // stroke color
  strokeWidth?: number;
  preserveAspectRatio?: string;
};

export default function GarageIcon({
  width = 24,
  height = 24,
  primary = '#000',
  strokeWidth = 2,
  preserveAspectRatio = 'xMidYMid meet',
}: Props) {
  return (
    <Svg width="16" height="12" viewBox="0 0 16 12" fill="none">
      <G clip-path="url(#clip0_879_19754)">
        <Path
          d="M9.5 8.5H10.5C10.8 8.5 11 8.3 11 8V6.5C11 6.05 10.65 5.65 10.25 5.55C9.35 5.3 8 5 8 5C8 5 7.35 4.3 6.9 3.85C6.65 3.65 6.35 3.5 6 3.5H2.5C2.2 3.5 1.95 3.7 1.8 3.95L1.1 5.4C1.03379 5.59311 1 5.79585 1 6V8C1 8.3 1.2 8.5 1.5 8.5H2.5"
          stroke={primary}
          stroke-opacity="0.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <Path
          d="M3.5 9.5C4.05228 9.5 4.5 9.05228 4.5 8.5C4.5 7.94772 4.05228 7.5 3.5 7.5C2.94772 7.5 2.5 7.94772 2.5 8.5C2.5 9.05228 2.94772 9.5 3.5 9.5Z"
          stroke={primary}
          strokeOpacity="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M4.5 8.5H7.5"
          stroke={primary}
          strokeOpacity="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M8.5 9.5C9.05228 9.5 9.5 9.05228 9.5 8.5C9.5 7.94772 9.05228 7.5 8.5 7.5C7.94772 7.5 7.5 7.94772 7.5 8.5C7.5 9.05228 7.94772 9.5 8.5 9.5Z"
          stroke={primary}
          strokeOpacity="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_879_19754">
          <Rect width="12" height="12" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}
