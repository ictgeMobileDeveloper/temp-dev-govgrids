import * as React from 'react';
import Svg, {G, Path, Defs, ClipPath} from 'react-native-svg';

type Props = {
  size?: number | string;
  primary?: string;
  preserveAspectRatio?: string;
};

export default function CopyLinkIcon({
  size = 16,
  primary = '#01BD91',
  preserveAspectRatio = 'xMidYMid meet',
}: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      preserveAspectRatio={preserveAspectRatio}>
      <G clipPath="url(#clip0_6920_16490)">
        <Path
          d="M6.667 8.666a3.333 3.333 0 005.026.36l2-2A3.333 3.333 0 008.98 2.313l-1.147 1.14m1.5 3.88a3.333 3.333 0 00-5.026-.36l-2 2a3.333 3.333 0 004.713 4.713l1.14-1.14"
          stroke={primary}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_6920_16490">
          <Path fill="#fff" d="M0 0H16V16H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}
