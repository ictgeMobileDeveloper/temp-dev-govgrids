import React from 'react';
import Svg, {Path} from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  primary?: string;
  preserveAspectRatio?: string;
};

export default function ClockVector({
  width = 800,
  height = 800,
  primary = '#000000',
  preserveAspectRatio = 'xMidYMid meet',
}: Props) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      preserveAspectRatio={preserveAspectRatio}>
      <Path
        d="M12 7V12L14.5 13.5M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
        stroke={primary}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
