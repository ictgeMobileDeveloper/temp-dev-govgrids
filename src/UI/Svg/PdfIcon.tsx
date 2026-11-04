import React from 'react';
import Svg, {G, Rect, Text} from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  primary?: string; // Border and text color
  secondary?: string; // Left available for consistency
};

export default function PdfIcon({
  width = 30,
  height = 30,
  primary = '#dc2626',
  secondary = '#dc2626',
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 192 192" fill="none">
      {/* PDF Icon Frame and Typography */}
      <G strokeWidth={10} strokeLinecap="round" strokeLinejoin="round">
        <Rect x={22} y={54} width={148} height={84} rx={14} stroke={primary} />
        <Text
          x={96}
          y={112}
          textAnchor="middle"
          fontFamily="Segoe UI, Arial, sans-serif"
          fontSize={46}
          fontWeight={700}
          fill={primary}>
          {'PDF'}
        </Text>
      </G>
    </Svg>
  );
}
