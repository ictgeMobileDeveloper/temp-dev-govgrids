import React from 'react';
import Svg, {Path} from 'react-native-svg';
import type {SvgProps} from 'react-native-svg';

type Props = SvgProps & {
  /** icon stroke color */
  primary?: string;
  /** convenience prop to set both width & height */
  size?: number;
};

function HelpIcon({size, width, height, primary = '#01BD91', ...rest}: Props) {
  const w = size ?? width ?? 52;
  const h = size ?? height ?? 52;

  return (
    <Svg width={w} height={h} viewBox="0 0 52 52" fill="none" {...rest}>
      <Path
        d="M31.4167 39.0086H14.4235C8.85087 38.9999 4.33337 34.6514 4.33337 29.2867C4.33337 23.9221 8.85087 19.5757 14.4235 19.5757C15.275 15.7581 18.3105 12.6424 22.386 11.4009C26.4594 10.1616 30.9574 10.9827 34.1814 13.5676C37.4054 16.1459 38.8657 20.0827 38.0164 23.9004H40.1614M41.1667 47.6666V47.6882M41.1667 41.1666C42.138 41.1635 43.0802 40.8346 43.8425 40.2326C44.6048 39.6307 45.1431 38.7904 45.3712 37.8462C45.5994 36.9021 45.5043 35.9087 45.101 35.0251C44.6978 34.1414 44.0097 33.4186 43.147 32.9722C42.2851 32.5307 41.2991 32.3938 40.3495 32.5838C39.3998 32.7738 38.5424 33.2796 37.9167 34.0187"
        stroke={primary}
        strokeWidth={4.33333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default React.memo(HelpIcon);
