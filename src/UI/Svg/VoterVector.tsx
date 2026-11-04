import React from 'react';
import Svg, {Path} from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  primary?: string;
  preserveAspectRatio?: string;
};

export default function VoterWardVector({
  width = 24,
  height = 24,
  primary = '#000000',
  preserveAspectRatio = 'xMidYMid meet',
}: Props) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      preserveAspectRatio={preserveAspectRatio}>
      <Path d="M0 0h24v24H0z" fill="none" />

      <Path
        fill={primary}
        d="M18 13h-.68l-2 2h1.91L19 17H5l1.78-2h2.05l-2-2H6l-3 3v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4zm-1-5.05l-4.95 4.95L8.5 9.36l4.96-4.95zm-4.24-5.66L6.39 8.66a.996.996 0 0 0 0 1.41L11.34 15c.39.41 1.02.41 1.41 0l6.36-6.34a.996.996 0 0 0 0-1.41L14.16 2.3a.975.975 0 0 0-1.4-.01"
      />
    </Svg>
  );
}
