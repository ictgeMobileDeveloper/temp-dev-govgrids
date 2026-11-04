import React from 'react';
import Svg, {Path} from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  color?: string;
  preserveAspectRatio?: string;
};

export default function FOIAVector({
  width = 40,
  height = 40,
  color = '#01BD91',
  preserveAspectRatio = 'xMidYMid meet',
}: Props) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 40 40"
      fill="none"
      preserveAspectRatio={preserveAspectRatio}>
      <Path
        d="M0 20a20 20 0 1140 0 20 20 0 01-40 0zm16.875 6.25a4.38 4.38 0 00-3.125-4.195V17.32a4.38 4.38 0 00-1.25-8.57 4.375 4.375 0 00-1.25 8.57v4.735a4.38 4.38 0 001.25 8.57 4.375 4.375 0 004.375-4.375zM25 13.75h.625a1.25 1.25 0 011.25 1.25v7.055a4.38 4.38 0 001.25 8.57 4.375 4.375 0 001.25-8.57V15a3.75 3.75 0 00-3.75-3.75H25V7.822a.625.625 0 00-1.067-.442l-4.678 4.677a.625.625 0 000 .886l4.678 4.677A.625.625 0 0025 17.177V13.75z"
        fill={color}
      />
    </Svg>
  );
}
