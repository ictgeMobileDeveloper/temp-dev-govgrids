import React from 'react';
import Svg, {
  Rect,
  G,
  Path,
  Defs,
  Stop,
  LinearGradient,
  ClipPath,
} from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  primary?: string;
  secondary?: string;
};

export default function BranchIcon({
  width = 24,
  height = 24,
  primary = '#1E1E1E',
}: Props) {
  return (
    <Svg width="25" height="24" viewBox="0 0 25 24" fill="none">
      <Path
        d="M18.5 15C16.8431 15 15.5 16.3431 15.5 18C15.5 19.6569 16.8431 21 18.5 21C20.1569 21 21.5 19.6569 21.5 18C21.5 16.3431 20.1569 15 18.5 15ZM18.5 15V8C18.5 7.46957 18.2893 6.96086 17.9142 6.58579C17.5391 6.21071 17.0304 6 16.5 6H13.5M6.5 9C8.15685 9 9.5 7.65685 9.5 6C9.5 4.34315 8.15685 3 6.5 3C4.84315 3 3.5 4.34315 3.5 6C3.5 7.65685 4.84315 9 6.5 9ZM6.5 9V21"
        stroke="#F9F9F9"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
