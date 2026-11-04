import React from 'react';
import Svg, {Path} from 'react-native-svg';

type Props = {
  size?: number | string;
  primary?: string;
  preserveAspectRatio?: string;
};

export default function NavigationIcon({
  size = 24,
  primary = '#4D6BFF',
  preserveAspectRatio = 'xMidYMid meet',
}: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 1024 1024"
      fill="none"
      preserveAspectRatio={preserveAspectRatio}>
      <Path
        d="M63.3 512.2a448.5 448 0 10897 0 448.5 448 0 10-897 0z"
        fill={primary}
      />
      <Path
        d="M416.094 605.094a5.484 5.484 0 012.719 2.718L501.125 783.5c3.188 6.844 12.844 7.031 15.75.375l201.844-465.75c3.562-8.156-4.782-16.5-12.938-12.938L240.125 507.031c-6.75 2.906-6.563 12.563.375 15.75l175.594 82.313z"
        fill="#FFFFFF"
      />
    </Svg>
  );
}
