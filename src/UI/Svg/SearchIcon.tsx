import React from 'react';
import Svg, {Path} from 'react-native-svg';
import type {SvgProps} from 'react-native-svg';

type Props = SvgProps & {
  primary?: string;
  size?: number;
};

function SearchIcon({
  size,
  width,
  height,
  primary = '#9CA3AF',
  ...rest
}: Props) {
  const w = size ?? width ?? 16;
  const h = size ?? height ?? 16;

  return (
    <Svg width={w} height={h} viewBox="0 0 16 16" fill="none" {...rest}>
      <Path
        d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z"
        stroke={primary}
        strokeWidth={1.33333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14.0005 14L11.1338 11.1333"
        stroke={primary}
        strokeWidth={1.33333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default React.memo(SearchIcon);
