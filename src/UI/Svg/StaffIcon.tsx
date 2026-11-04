// components/StaffIcon.tsx
import React, { useRef } from 'react';
import Svg, { G, Path, Defs, ClipPath, Rect } from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  primary?: string; // fill color for the paths
  preserveAspectRatio?: string;
};

export default function StaffIcon({
  width = 32,
  height = 32,
  primary = '#01BD91',
  preserveAspectRatio = 'xMidYMid meet',
}: Props) {
  // unique clipPath id to avoid collisions if rendered multiple times
  const clipId = useRef(
    `staff_clip_${Math.random().toString(36).slice(2, 8)}`,
  ).current;

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 32 32"
      preserveAspectRatio={preserveAspectRatio}
    >
      <Defs>
        <ClipPath id={clipId}>
          <Rect width="32" height="32" fill="white" />
        </ClipPath>
      </Defs>

      <G clipPath={`url(#${clipId})`}>
        <Path
          d="M20.0335 10.287C20.0335 12.5655 18.184 14.412 15.9035 14.412C13.6255 14.412 11.779 12.565 11.779 10.287C11.779 8.00899 13.6255 6.16199 15.9035 6.16199C18.184 6.16199 20.0335 8.00899 20.0335 10.287Z"
          fill={primary}
        />
        <Path
          d="M15.91 0.262451C14.001 0.262451 11.3345 1.02345 9.40301 2.95495L11.697 7.13445C12.1982 6.49644 12.838 5.98078 13.5679 5.62649C14.2978 5.2722 15.0987 5.08855 15.91 5.08945C17.6395 5.08945 19.1785 5.90645 20.159 7.17695L22.409 2.85895C20.7375 1.03245 17.74 0.262451 15.91 0.262451ZM10.483 21.826H11.5395L10.0305 26.998H21.821L20.319 21.826H21.3765L22.888 26.998H26.3575L23.9895 19.162C23.6195 17.8685 21.9975 15.591 19.1985 15.522L12.7635 15.5165C9.90101 15.5305 8.24501 17.8525 7.87051 19.1615L5.45651 26.9975H8.97501L10.483 21.826ZM0.473511 28.647H31.3385V31.5835H0.473511V28.647Z"
          fill={primary}
        />
      </G>
    </Svg>
  );
}
