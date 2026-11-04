import * as React from 'react';
import Svg, {Path, SvgProps} from 'react-native-svg';

type Props = SvgProps & {
  size?: number;
  color?: string;
};

const CurrentLocationIcon = ({
  size = 24,
  color = '#007AFF',
  ...props
}: Props) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none" {...props}>
      <Path d="M8 10a2 2 0 100-4 2 2 0 000 4z" fill={color} />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.083 7A6.005 6.005 0 017 2.083V0h2v2.083A6.005 6.005 0 0113.917 7H16v2h-2.083A6.005 6.005 0 019 13.917V16H7v-2.083A6.005 6.005 0 012.083 9H0V7h2.083zM4 8a4 4 0 118 0 4 4 0 01-8 0z"
        fill={color}
      />
    </Svg>
  );
};

export default React.memo(CurrentLocationIcon);
