import * as React from 'react';
import Svg, {Path, SvgProps} from 'react-native-svg';

type Props = SvgProps & {
  primary?: string;
  size?: number;
};

function ApprovalPlusIcon({
  size = 24,
  width,
  height,
  primary = '#FFB400',
  ...rest
}: Props) {
  return (
    <Svg
      width={width ?? size}
      height={height ?? size}
      viewBox="0 0 24 24"
      fill="none"
      {...rest}>
      <Path d="M19 12.998h-6v6h-2v-6H5v-2h6v-6h2v6h6v2z" fill={primary} />
    </Svg>
  );
}

export default ApprovalPlusIcon;
