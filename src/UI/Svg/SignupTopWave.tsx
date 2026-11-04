// components/TopWave.tsx
import React, { useRef, memo } from 'react';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  SvgProps,
} from 'react-native-svg';

type Props = SvgProps & {
  width?: number | string;
  height?: number | string;
  primary?: string; // gradient start
  secondary?: string; // gradient end
  preserveAspectRatio?: string;
};

function SignupTopWave({
  width = 390,
  height = 79,
  primary = '#01BD91',
  secondary = '#98C1D9',
  preserveAspectRatio = 'xMidYMid meet',
  ...svgProps
}: Props) {
  const id = useRef(Math.random().toString(36).slice(2, 9)).current;
  const gid = (name: string) => `${name}_${id}`;

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 390 79"
      fill="none"
      preserveAspectRatio={preserveAspectRatio}
      {...svgProps}
    >
      <Path
        d="M91.9756 78.9458C54.6807 77.4063 45.3404 34.8318 8.04627 33.2746C4.51657 33.1272 -1 33.2746 -1 33.2746V-40H390C390 -40 364.049 3.327 337.733 19.7238C289.777 49.6039 247.09 3.36255 192.992 19.7238C149.211 32.9649 137.682 80.8324 91.9756 78.9458Z"
        fill={`url(#${gid('paint0')})`}
      />

      <Defs>
        <LinearGradient
          id={gid('paint0')}
          x1="-0.999999"
          y1="-48.1812"
          x2="29.4712"
          y2="133.951"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset={0} stopColor={primary} />
          <Stop offset={1} stopColor={secondary} />
        </LinearGradient>
      </Defs>
    </Svg>
  );
}

export default memo(SignupTopWave);
