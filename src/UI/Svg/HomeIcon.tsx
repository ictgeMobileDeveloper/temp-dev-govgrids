import React from 'react';
import Svg, {Path} from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  primary?: string; // stroke color
  strokeWidth?: number;
  preserveAspectRatio?: string;
};

export default function HomeIcon({
  width = 24,
  height = 24,
  primary = '#000',
  strokeWidth = 2,
  preserveAspectRatio = 'xMidYMid meet',
}: Props) {
  return (
    <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <Path
        d="M10 14V8.66667C10 8.48986 9.92976 8.32029 9.80474 8.19526C9.67971 8.07024 9.51014 8 9.33333 8H6.66667C6.48986 8 6.32029 8.07024 6.19526 8.19526C6.07024 8.32029 6 8.48986 6 8.66667V14"
        stroke={primary}
        strokeOpacity="0.6"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M2 6.66648C1.99995 6.47253 2.04222 6.2809 2.12386 6.10496C2.20549 5.92902 2.32453 5.77301 2.47267 5.64782L7.13933 1.64848C7.37999 1.44509 7.6849 1.3335 8 1.3335C8.3151 1.3335 8.62001 1.44509 8.86067 1.64848L13.5273 5.64782C13.6755 5.77301 13.7945 5.92902 13.8761 6.10496C13.9578 6.2809 14 6.47253 14 6.66648V12.6665C14 13.0201 13.8595 13.3592 13.6095 13.6093C13.3594 13.8593 13.0203 13.9998 12.6667 13.9998H3.33333C2.97971 13.9998 2.64057 13.8593 2.39052 13.6093C2.14048 13.3592 2 13.0201 2 12.6665V6.66648Z"
        stroke={primary}
        strokeOpacity="0.6"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
