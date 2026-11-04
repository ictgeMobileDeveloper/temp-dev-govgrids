import React from 'react';
import Svg, {Path} from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  primary?: string;
};

const WrenchVector = ({
  width = 19,
  height = 19,
  primary = '#F59E0B',
}: Props) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 19 19" fill="none">
      <Path
        d="M11.345 5.17c0-.218.086-.428.239-.584L14.173 2c.267-.268.182-.72-.183-.82A5 5 0 008.11 8.06l-6.592 6.592a1.767 1.767 0 102.5 2.5l6.59-6.592a5 5 0 006.883-5.88c-.1-.365-.552-.45-.819-.182l-2.588 2.587a.833.833 0 01-1.167 0l-1.333-1.333a.833.833 0 01-.239-.583z"
        stroke={primary}
        strokeWidth={1.4}
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default WrenchVector;
