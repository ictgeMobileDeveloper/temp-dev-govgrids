import * as React from 'react';
import type {SvgProps} from 'react-native-svg';
import Svg, {G, Line, Path, Polyline} from 'react-native-svg';

type UploadIconProps = SvgProps & {
  /** Width and height, in points. */
  size?: number;
};

export function UploadIcon({size = 24, ...props}: UploadIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      {...props}>
      <G id="Complete">
        <G id="upload">
          <G>
            <Path
              d="M3,12.3v7a2,2,0,0,0,2,2H19a2,2,0,0,0,2-2v-7"
              fill="none"
              stroke="#000000"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
            <G>
              <Polyline
                data-name="Right"
                fill="none"
                id="Right-2"
                points="7.9 6.7 12 2.7 16.1 6.7"
                stroke="#000000"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
              <Line
                fill="none"
                stroke="#000000"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                x1={12}
                x2={12}
                y1={16.3}
                y2={4.8}
              />
            </G>
          </G>
        </G>
      </G>
    </Svg>
  );
}

export default UploadIcon;
