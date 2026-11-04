import React from 'react';
import Svg, {Circle, Path} from 'react-native-svg';
import type {SvgProps} from 'react-native-svg';

type Props = SvgProps & {
  /** stroke color for the document lines/outline */
  primary?: string;
  /** background circle color; set to any color to show, or leave default to hide */
  secondary?: string;
  /** convenience prop to set both width & height */
  size?: number;
};

function DocumentIcon({
  size,
  width,
  height,
  primary = '#01BD91',
  secondary = 'none',
  ...rest
}: Props) {
  const w = size ?? width ?? 48;
  const h = size ?? height ?? 48;

  return (
    <Svg width={w} height={h} viewBox="0 0 48 48" fill="none" {...rest}>
      {/* Optional background circle */}
      {secondary !== 'none' && (
        <Circle cx={24} cy={24} r={24} fill={secondary} />
      )}

      {/* Document outline */}
      <Path
        d="M30 4H12C10.9391 4 9.92172 4.42143 9.17157 5.17157C8.42143 5.92172 8 6.93913 8 8V40C8 41.0609 8.42143 42.0783 9.17157 42.8284C9.92172 43.5786 10.9391 44 12 44H36C37.0609 44 38.0783 43.5786 38.8284 42.8284C39.5786 42.0783 40 41.0609 40 40V14L30 4Z"
        stroke={primary}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Folded corner / top edge */}
      <Path
        d="M28 4V12C28 13.0609 28.4214 14.0783 29.1716 14.8284C29.9217 15.5786 30.9391 16 32 16H40"
        stroke={primary}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Text lines */}
      <Path
        d="M20 18H16"
        stroke={primary}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M32 26H16"
        stroke={primary}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M32 34H16"
        stroke={primary}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default React.memo(DocumentIcon);
