// components/LoginBottomWave.tsx
import React, {useRef, memo} from 'react';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  SvgProps,
} from 'react-native-svg';
import {normalized} from '../../Utils/AppConstants';

type Props = SvgProps & {
  width?: number | string;
  height?: number | string;
  primary?: string; // gradient start color
  secondary?: string; // gradient end color
  preserveAspectRatio?: string;
};

function LoginBottomWave({
  width = normalized(166),
  height = normalized(220),
  primary = '#01BD91',
  secondary = '#98C1D9',
  // preserveAspectRatio = 'xMidYMid meet',
  preserveAspectRatio = 'none',
  ...svgProps
}: Props) {
  const id = useRef(Math.random().toString(36).slice(2, 9)).current;
  const gid = (name: string) => `${name}_${id}`;

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 166 220"
      fill="none"
      preserveAspectRatio={preserveAspectRatio}
      {...svgProps}>
      <Path
        d="M-212.205 205.329C-207.399 238.79 -181.569 281.839 -146.068 267.195C-119.233 256.125 -150.049 228.795 -118.793 205.009C-87.5356 181.223 -41.8364 178.945 -15.3724 204.774C4.11532 223.794 -20.2905 249.304 -4.10279 270.635C33.1058 319.667 169.96 284.054 165.187 224.207C162.024 184.537 106.666 188.162 83.636 154.708C55.654 114.06 90.7643 67.3304 51.139 35.2165C21.1724 10.9305 -12.0413 -10.9106 -49.1813 7.18919C-97.4156 30.6957 16.4831 98.9272 -28.6911 126.937C-49.6782 139.95 -67.2261 136.823 -92.3711 137.834C-123.108 139.069 -141.407 117.01 -169.802 128.486C-204.218 142.396 -216.848 173.001 -212.205 205.329Z"
        fill={`url(#${gid('paint0')})`}
      />
      <Defs>
        <LinearGradient
          id={gid('paint0')}
          x1="-244.537"
          y1="16.568"
          x2="0.688466"
          y2="378.148"
          gradientUnits="userSpaceOnUse">
          <Stop offset={0} stopColor={primary} />
          <Stop offset={1} stopColor={secondary} />
        </LinearGradient>
      </Defs>
    </Svg>
  );
}

export default memo(LoginBottomWave);
