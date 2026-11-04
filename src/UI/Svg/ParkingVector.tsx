import React from 'react';
import Svg, {Path, G, Defs, ClipPath, Rect} from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  color?: string;
  preserveAspectRatio?: string;
};

export default function ParkingVector({
  width = 35,
  height = 35,
  color = '#01BD91',
  preserveAspectRatio = 'xMidYMid meet',
}: Props) {
  const clipId = 'parking_clip_1';

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 35 35"
      fill="none"
      preserveAspectRatio={preserveAspectRatio}>
      <Defs>
        <ClipPath id={clipId}>
          <Rect width="35" height="35" fill="white" />
        </ClipPath>
      </Defs>

      <G clipPath={`url(#${clipId})`}>
        <Path
          d="M31.25 2.5H3.75C1.67969 2.5 0 4.17969 0 6.25V33.75C0 35.8203 1.67969 37.5 3.75 37.5H31.25C33.3203 37.5 35 35.8203 35 33.75V6.25C35 4.17969 33.3203 2.5 31.25 2.5ZM18.75 25H15V28.75C15 29.4375 14.4375 30 13.75 30H11.25C10.5625 30 10 29.4375 10 28.75V11.25C10 10.5625 10.5625 10 11.25 10H18.75C22.8828 10 26.25 13.3672 26.25 17.5C26.25 21.6328 22.8828 25 18.75 25ZM18.75 15H15V20H18.75C20.125 20 21.25 18.875 21.25 17.5C21.25 16.125 20.125 15 18.75 15Z"
          fill={color}
        />
      </G>
    </Svg>
  );
}
