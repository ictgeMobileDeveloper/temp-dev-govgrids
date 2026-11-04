import React from 'react';
import Svg, {Path} from 'react-native-svg';
import type {SvgProps} from 'react-native-svg';

type Props = SvgProps & {
  /** icon stroke color */
  primary?: string;
  /** convenience prop to set both width & height */
  size?: number;
};

function SaveIcon({size, width, height, primary = '#131720', ...rest}: Props) {
  const w = size ?? width ?? 16;
  const h = size ?? height ?? 16;

  return (
    <Svg width={w} height={h} viewBox="0 0 16 16" fill="none" {...rest}>
      <Path
        d="M12.6663 14L7.99967 11.3333L3.33301 14V3.33333C3.33301 2.97971 3.47348 2.64057 3.72353 2.39052C3.97358 2.14048 4.31272 2 4.66634 2H11.333C11.6866 2 12.0258 2.14048 12.2758 2.39052C12.5259 2.64057 12.6663 2.97971 12.6663 3.33333V14Z"
        stroke={primary}
        strokeWidth={1.33333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default React.memo(SaveIcon);
