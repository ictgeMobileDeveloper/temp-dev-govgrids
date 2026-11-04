// components/ResidentIcon.tsx
import React from 'react';
import Svg, {Path} from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  primary?: string; // fill color
  preserveAspectRatio?: string;
};

export default function ResidentIcon({
  width = 32,
  height = 32,
  primary = '#01BD91',
  preserveAspectRatio = 'xMidYMid meet',
}: Props) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 32 32"
      preserveAspectRatio={preserveAspectRatio}>
      <Path
        d="M25.1734 26.6671V21.3338C26.6667 21.1205 27.7334 19.8405 27.7334 18.1338C27.7334 16.4271 26.24 14.9338 24.5334 14.9338C22.8267 14.9338 21.3334 16.4271 21.3334 18.1338C21.3334 19.6271 22.4 21.1205 23.8934 21.3338V26.6671H14.9334V2.13379H4.2667V26.6671H2.13336V27.7338H29.8667V26.6671H25.1734ZM12.8 21.3338H6.40003V19.2005H12.8V21.3338ZM12.8 17.0671H6.40003V14.9338H12.8V17.0671ZM12.8 12.8005H6.40003V10.6671H12.8V12.8005ZM12.8 8.53379H6.40003V6.40046H12.8V8.53379Z"
        fill={primary}
      />
    </Svg>
  );
}
