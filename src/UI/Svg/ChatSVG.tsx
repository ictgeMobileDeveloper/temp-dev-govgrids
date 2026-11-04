import React from 'react';
import Svg, {Path} from 'react-native-svg';

type Props = {
  size?: number | string;
  primary?: string;
  preserveAspectRatio?: string;
};

export default function ChatSVG({
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
        d="M1.754 13.774a1.667 1.667 0 00-.078-.972 8.334 8.334 0 113.981 3.933 1.667 1.667 0 00-.916-.077l-2.844.832a.833.833 0 01-1.03-.974l.887-2.741z"
        stroke={primary}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    </Svg>
  );
}
