import React from 'react';
import Svg, {Path} from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  color?: string;
  preserveAspectRatio?: string;
};

export default function SIRVector({
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
        d="M20 1.66663L5 8.33329V18.3333C5 27.5833 11.4 36.2333 20 38.3333C28.6 36.2333 35 27.5833 35 18.3333V8.33329L20 1.66663ZM20 11.6666C22.3333 11.6666 24.6667 13.5 24.6667 15.8333V18.3333C25.6667 18.3333 26.6667 19.3333 26.6667 20.5V26.3333C26.6667 27.3333 25.6667 28.3333 24.5 28.3333H15.3333C14.3333 28.3333 13.3333 27.3333 13.3333 26.1666V20.3333C13.3333 19.3333 14.3333 18.3333 15.3333 18.3333V15.8333C15.3333 13.5 17.6667 11.6666 20 11.6666ZM20 13.6666C18.6667 13.6666 17.5 14.5 17.5 15.8333V18.3333H22.5V15.8333C22.5 14.5 21.3333 13.6666 20 13.6666Z"
        fill={color}
      />
    </Svg>
  );
}
