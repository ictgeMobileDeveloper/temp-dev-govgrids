import React from 'react';
import Svg, {Path} from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  color?: string;
  preserveAspectRatio?: string;
};

export default function AutismVector({
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
        d="M25.69 1.66675H5V38.3334H22.2133C21.26 37.5519 20.492 36.5685 19.9646 35.4543C19.4372 34.3401 19.1635 33.1228 19.1633 31.8901V19.1667H35V10.9767L25.69 1.66675ZM24.1667 12.5001V5.00008L31.6667 12.5001H24.1667Z"
        fill={color}
      />
      <Path
        d="M22.4971 22.5H37.4971V31.89C37.4968 32.721 37.2894 33.5388 36.8936 34.2695C36.4979 35.0002 35.9262 35.6207 35.2304 36.075L29.9971 39.495L24.7637 36.075C24.0679 35.6207 23.4963 35.0002 23.1005 34.2695C22.7048 33.5388 22.4974 32.721 22.4971 31.89V22.5Z"
        fill={color}
      />
    </Svg>
  );
}
