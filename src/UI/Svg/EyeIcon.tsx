import React from 'react';
import Svg, {Rect, G, Path, Defs, Stop, LinearGradient} from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  primary?: string; // inner icon color
  secondary?: string; // background circle color
  stroke?: number | string;
};

export default function EyeIcon({
  primary = '#1E1E1E',
  secondary = '#98C1D9',
  width = 24,
  height = 24,
  stroke = '1.5',
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
        stroke={primary}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
        stroke={primary}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

<svg
  width="52"
  height="52"
  viewBox="0 0 52 52"
  fill="none"
  xmlns="http://www.w3.org/2000/svg">
  <path
    d="M31.4167 39.0086H14.4235C8.85087 38.9999 4.33337 34.6514 4.33337 29.2867C4.33337 23.9221 8.85087 19.5757 14.4235 19.5757C15.275 15.7581 18.3105 12.6424 22.386 11.4009C26.4594 10.1616 30.9574 10.9827 34.1814 13.5676C37.4054 16.1459 38.8657 20.0827 38.0164 23.9004H40.1614M41.1667 47.6666V47.6882M41.1667 41.1666C42.138 41.1635 43.0802 40.8346 43.8425 40.2326C44.6048 39.6307 45.1431 38.7904 45.3712 37.8462C45.5994 36.9021 45.5043 35.9087 45.101 35.0251C44.6978 34.1414 44.0097 33.4186 43.147 32.9722C42.2851 32.5307 41.2991 32.3938 40.3495 32.5838C39.3998 32.7738 38.5424 33.2796 37.9167 34.0187"
    stroke="#01BD91"
    stroke-width="4.33333"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>;
