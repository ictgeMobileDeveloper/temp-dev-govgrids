// components/SignupBottomWave.tsx
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
  primary?: string; // gradient start color (default: #01BD91)
  secondary?: string; // gradient end color (default: #98C1D9)
  preserveAspectRatio?: string;
};

function SignupBottomWave({
  width = 126,
  height = 220,
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
      viewBox="0 0 126 220"
      fill="none"
      preserveAspectRatio={preserveAspectRatio}
      {...svgProps}
    >
      <Path
        d="M-252.205 205.329C-247.399 238.79 -221.569 281.839 -186.068 267.195C-159.233 256.125 -190.049 228.795 -158.793 205.009C-127.536 181.223 -81.8364 178.945 -55.3724 204.774C-35.8847 223.794 -60.2905 249.304 -44.1028 270.635C-6.89423 319.667 129.96 284.054 125.187 224.207C122.024 184.537 66.6662 188.162 43.636 154.708C15.654 114.06 50.7643 67.3304 11.139 35.2165C-18.8276 10.9305 -52.0413 -10.9106 -89.1813 7.18919C-137.416 30.6957 -23.5169 98.9272 -68.6911 126.937C-89.6782 139.95 -107.226 136.823 -132.371 137.834C-163.108 139.069 -181.407 117.01 -209.802 128.486C-244.218 142.396 -256.848 173.001 -252.205 205.329Z"
        fill={`url(#${gid('paint0')})`}
      />
      <Defs>
        <LinearGradient
          id={gid('paint0')}
          x1="-284.537"
          y1="16.568"
          x2="-39.3115"
          y2="378.148"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset={0} stopColor={primary} />
          <Stop offset={1} stopColor={secondary} />
        </LinearGradient>
      </Defs>
    </Svg>
  );
}

export default memo(SignupBottomWave);
