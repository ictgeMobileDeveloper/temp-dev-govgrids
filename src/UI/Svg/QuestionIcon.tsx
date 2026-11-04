import React from 'react';
import Svg, {Path} from 'react-native-svg';
import type {SvgProps} from 'react-native-svg';

type Props = SvgProps & {
  primary?: string;
  size?: number;
};

function QuestionIcon({
  size,
  width,
  height,
  primary = '#FFFFFF',
  ...rest
}: Props) {
  const w = size ?? width ?? 20;
  const h = size ?? height ?? 20;

  return (
    <Svg width={w} height={h} viewBox="0 0 20 20" fill="none" {...rest}>
      <Path
        d="M5.83301 6.66667C5.83301 4.36667 7.69967 2.5 9.99967 2.5C12.2997 2.5 14.1663 4.36667 14.1663 6.66667C14.1663 8.03333 13.508 9.24167 12.4997 10C11.7997 10.525 9.99967 11.6667 9.99967 14.1667"
        stroke={primary}
        strokeWidth={1.66667}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10 17.5V17.5083"
        stroke={primary}
        strokeWidth={1.66667}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default React.memo(QuestionIcon);
