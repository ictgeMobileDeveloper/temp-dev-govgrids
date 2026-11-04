import React from 'react';
import Svg, {Path} from 'react-native-svg';

type Props = {
  size?: number | string;
  primary?: string;
  preserveAspectRatio?: string;
};

export default function LockSVG({
  size = 19,
  primary = '#01BD91',
  preserveAspectRatio = 'xMidYMid meet',
}: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 17 19"
      fill="none"
      preserveAspectRatio={preserveAspectRatio}>
      <Path
        d="M4.183 7.517v-2.5a4.167 4.167 0 118.333 0v2.5m-3.333 5a.833.833 0 11-1.667 0 .833.833 0 011.667 0zm-6.667-5h11.667c.92 0 1.667.746 1.667 1.667v6.667c0 .92-.747 1.667-1.667 1.667H2.516c-.92 0-1.666-.747-1.666-1.667V9.184c0-.92.746-1.667 1.666-1.667z"
        stroke={primary}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    </Svg>
  );
}
