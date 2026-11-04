import * as React from 'react';
import Svg, {G, Rect, Circle, Path, SvgProps} from 'react-native-svg';

interface ImageIconProps extends SvgProps {
  size?: number;
  color?: string;
}

const ImageIcon = ({
  size = 48,
  color = '#8b5cf6',
  ...props
}: ImageIconProps) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 192 192"
      fill="none"
      aria-label="Image file type icon"
      {...props}>
      <G
        strokeWidth={10}
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke={color}>
        <Rect x={28} y={36} width={136} height={120} rx={14} />
        <Circle cx={66} cy={74} r={12} />
        <Path d="M40 148l44-48 24 24 20-24 32 44" />
      </G>
    </Svg>
  );
};

export default ImageIcon;
