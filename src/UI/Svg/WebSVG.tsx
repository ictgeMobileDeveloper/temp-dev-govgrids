import React from 'react';
import Svg, {Path} from 'react-native-svg';

type Props = {
  size?: number | string;
  primary?: string;
  preserveAspectRatio?: string;
};

export default function WebSVG({
  size = 19,
  primary = '#01BD91',
  preserveAspectRatio = 'xMidYMid meet',
}: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 19 19"
      fill="none"
      preserveAspectRatio={preserveAspectRatio}>
      <Path
        d="M3.188 15.562A8.75 8.75 0 1115.563 3.188 8.75 8.75 0 013.188 15.562z"
        stroke={primary}
        strokeWidth={1.25}
        strokeLinejoin="round"
      />
      <Path
        d="M6.723 3.188c-.703 1.64-1.098 3.866-1.098 6.187 0 2.32.395 4.546 1.098 6.187.704 1.641 1.657 2.563 2.652 2.563.995 0 1.948-.922 2.652-2.563.703-1.64 1.098-3.866 1.098-6.187 0-2.32-.395-4.546-1.098-6.187C11.323 1.547 10.37.625 9.375.625c-.995 0-1.948.922-2.652 2.563z"
        stroke={primary}
        strokeWidth={1.25}
        strokeLinejoin="round"
      />
      <Path
        d="M1.25 12.292H17.5M1.25 6.46H17.5"
        stroke={primary}
        strokeWidth={1.25}
        strokeLinecap="round"
      />
    </Svg>
  );
}
