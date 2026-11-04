import React from 'react';
import Svg, {Path} from 'react-native-svg';
import type {SvgProps} from 'react-native-svg';

type Props = SvgProps & {
  /** icon stroke color */
  primary?: string;
  /** convenience prop to set both width & height */
  size?: number;
};

function ServiceIcon({
  size,
  width,
  height,
  primary = '#01BD91',
  ...rest
}: Props) {
  const w = size ?? width ?? 24;
  const h = size ?? height ?? 24;

  return (
    <Svg width={w} height={h} viewBox="0 0 24 24" fill="none" {...rest}>
      <Path
        d="M5 6L1 4.5V18.443L12 23L23 18.443V4L19 6M11.95 5V19M5 16V2L12 5L19 2V16L12 19L5 16Z"
        stroke={primary}
        strokeWidth={2}
      />
    </Svg>
  );
}

export default React.memo(ServiceIcon);
