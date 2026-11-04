import React from 'react';
import Svg, {Path} from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  primary?: string;
  preserveAspectRatio?: string;
};

export default function VendorVector({
  width = 37,
  height = 37,
  primary = '#01BD91',
  preserveAspectRatio = 'xMidYMid meet',
}: Props) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 37 37"
      fill="none"
      preserveAspectRatio={preserveAspectRatio}>
      <Path
        d="M12.467 16.408l3.941-3.987-2.566-2.613-2.017 2.017-2.567-2.567 1.971-2.016-2.062-2.063-3.988 3.988 7.288 7.241zM27.5 31.488l3.988-3.988-2.063-2.063-2.017 1.971-2.566-2.566 1.97-2.017-2.612-2.567-3.942 3.942 7.242 7.288zM26.08 8.113l2.566 2.566 2.566-2.566L28.6 5.5l-2.52 2.613zM9.624 34.832H1.833v-7.791l8.021-8.021L0 9.167 9.167 0l9.9 9.9 6.92-6.967c.367-.366.78-.641 1.238-.825a3.792 3.792 0 012.842 0c.458.184.87.459 1.237.825l2.43 2.475c.366.367.641.78.824 1.238.184.458.275.932.275 1.42 0 .49-.091.956-.275 1.4a3.705 3.705 0 01-.825 1.213l-6.92 6.967 9.854 9.854-9.167 9.167-9.854-9.855-8.021 8.021z"
        fill={primary}
      />
    </Svg>
  );
}
