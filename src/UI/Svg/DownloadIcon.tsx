import React from 'react';
import Svg, {Path} from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  primary?: string; // fill color
  strokeWidth?: number;
  preserveAspectRatio?: string;
};

export default function DownloadIcon({
  width = 24,
  height = 24,
  primary = '#1D1B20', // default fill color
  strokeWidth = 0.5,
  preserveAspectRatio = 'xMidYMid meet',
}: Props) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 36 36"
      fill="none"
      preserveAspectRatio={preserveAspectRatio}>
      <Path
        d="M8.75 22.75V27.25H27.25V22.75H29.75V27C29.75 27.7582 29.4834 28.4014 28.9424 28.9424C28.4014 29.4834 27.7582 29.75 27 29.75H9C8.24183 29.75 7.59861 29.4834 7.05762 28.9424C6.51663 28.4014 6.25 27.7582 6.25 27V22.75H8.75ZM19.25 6.25V18.8281L23.3965 14.6816L25.1494 16.4961L18 23.6465L10.8496 16.4961L12.6025 14.6816L16.3232 18.4014L16.75 18.8281V6.25H19.25Z"
        fill={primary}
        fillOpacity={0.5}
        stroke="white"
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
}
