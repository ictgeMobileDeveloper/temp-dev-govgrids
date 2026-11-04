import React from 'react';
import Svg, {Path} from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  primary?: string;
};

const GeneralFormVector = ({
  width = 30,
  height = 30,
  primary = '#01BD91',
}: Props) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 30 30" fill="none">
      <Path
        d="M26.667 0H3.333A3.343 3.343 0 000 3.333v23.334C0 28.5 1.5 30 3.333 30h23.334C28.5 30 30 28.5 30 26.667V3.333C30 1.5 28.5 0 26.667 0zm-3.334 23.333H6.667V20h16.666v3.333zM6.667 15c0-1.383 1.116-2.5 2.5-2.5 1.383 0 2.5 1.117 2.5 2.5s-1.117 2.5-2.5 2.5a2.497 2.497 0 01-2.5-2.5zm16.666 1.667h-10v-3.334h10v3.334zm0-6.667H6.667V6.667h16.666V10z"
        fill={primary}
      />
    </Svg>
  );
};

export default GeneralFormVector;
