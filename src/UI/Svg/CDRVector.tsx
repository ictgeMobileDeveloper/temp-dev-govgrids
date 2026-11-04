import React from 'react';
import Svg, {Path} from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  color?: string;
  preserveAspectRatio?: string;
};

export default function CDRVector({
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
        d="M24 34C24 36.2 20 38 20 38C20 38 16 36.2 16 34M20 14C19.2107 13.9798 18.4594 13.6572 17.9011 13.0989C17.3428 12.5406 17.0202 11.7893 17 11C17 10.2044 17.3161 9.44129 17.8787 8.87868C18.4413 8.31607 19.2044 8 20 8C20.7956 8 21.5587 8.31607 22.1213 8.87868C22.6839 9.44129 23 10.2044 23 11C22.9798 11.7893 22.6572 12.5406 22.0989 13.0989C21.5406 13.6572 20.7893 13.9798 20 14ZM26.6 23.4C28.2 15.8 25.4 2 20 2C14.6 2 11.6 15.4 13.2 23L10 30H15.4L16 32H24C24.4 31.4 24.2 31 24.6 30H30L26.6 23.4Z"
        fill={color}
      />
    </Svg>
  );
}
