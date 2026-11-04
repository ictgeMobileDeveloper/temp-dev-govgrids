import React from 'react';
import Svg, {Path} from 'react-native-svg';

type Props = {
  size?: number | string;
  primary?: string;
  preserveAspectRatio?: string;
};

export default function ContractSVG({
  size = 24,
  primary = '#01BD91',
  preserveAspectRatio = 'xMidYMid meet',
}: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      preserveAspectRatio={preserveAspectRatio}>
      <Path
        d="M10.5 21.75H5.25V2.25h13.5v8.25M7.5 6.75h9m-9 3h6m-.75 12v-3H15c0-1.5-2.25-6 1.5-6s1.5 4.5 1.5 6h2.25v3h-7.5z"
        stroke={primary}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </Svg>
  );
}
