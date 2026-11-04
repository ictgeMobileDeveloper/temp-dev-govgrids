import React from 'react';
import Svg, {Path} from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  primary?: string;
  preserveAspectRatio?: string;
};

export default function InvoiceVector({
  width = 24,
  height = 26,
  primary = '#01BD91',
  preserveAspectRatio = 'xMidYMid meet',
}: Props) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 26"
      fill="none"
      preserveAspectRatio={preserveAspectRatio}>
      <Path
        d="M24 25.3333L20 22.6667L16 25.3333L12 22.6667L8 25.3333L4 22.6667L0 25.3333V0H24V25.3333ZM21.3333 20.3467V2.66667H2.66667V20.3467L4 19.4667L8 22.1333L12 19.4667L16 22.1333L20 19.4667L21.3333 20.3467Z"
        fill={primary}
      />
    </Svg>
  );
}
