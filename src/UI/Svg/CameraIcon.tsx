import React from 'react';
import Svg, { Path } from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  primary?: string; // stroke color
  strokeWidth?: number;
  preserveAspectRatio?: string;
};

export default function CameraIcon({
  width = 24,
  height = 24,
  primary = '#000',
  strokeWidth = 1.3333,
  preserveAspectRatio = 'xMidYMid meet',
}: Props) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      preserveAspectRatio={preserveAspectRatio}
    >
      <Path
        d="M9.66634 2.6665H6.33301L4.66634 4.6665H2.66634C2.31272 4.6665 1.97358 4.80698 1.72353 5.05703C1.47348 5.30708 1.33301 5.64622 1.33301 5.99984V11.9998C1.33301 12.3535 1.47348 12.6926 1.72353 12.9426C1.97358 13.1927 2.31272 13.3332 2.66634 13.3332H13.333C13.6866 13.3332 14.0258 13.1927 14.2758 12.9426C14.5259 12.6926 14.6663 12.3535 14.6663 11.9998V5.99984C14.6663 5.64622 14.5259 5.30708 14.2758 5.05703C14.0258 4.80698 13.6866 4.6665 13.333 4.6665H11.333L9.66634 2.6665Z"
        stroke={primary}
        strokeOpacity={0.6}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8 10.6665C9.10457 10.6665 10 9.77107 10 8.6665C10 7.56193 9.10457 6.6665 8 6.6665C6.89543 6.6665 6 7.56193 6 8.6665C6 9.77107 6.89543 10.6665 8 10.6665Z"
        stroke={primary}
        strokeOpacity={0.6}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
