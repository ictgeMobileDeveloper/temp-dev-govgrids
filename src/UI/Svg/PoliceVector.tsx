import React from 'react';
import Svg, {Path} from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  color?: string;
  preserveAspectRatio?: string;
};

export default function PoliceVector({
  width = 40,
  height = 40,
  color = '#01BD91',
  preserveAspectRatio = 'xMidYMid meet',
}: Props) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 40 40"
      fill="none"
      preserveAspectRatio={preserveAspectRatio}>
      <Path
        d="M20 1.66675L5 8.33341V18.3334C5 27.5834 11.4 36.2334 20 38.3334C28.6 36.2334 35 27.5834 35 18.3334V8.33341L20 1.66675ZM24.1667 20.9834L25.6667 27.4501L20 24.0334L14.3333 27.4501L15.8333 21.0001L10.8333 16.6834L17.4333 16.1167L20 10.0334L22.5667 16.1001L29.1667 16.6667L24.1667 20.9834Z"
        fill={color}
      />
    </Svg>
  );
}
