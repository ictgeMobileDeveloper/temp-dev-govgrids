import React from 'react';
import { ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

type CircleSvgProps = {
    size?: number;
    color?: string;
    strokeWidth?: number;
    variant?: 'fill' | 'stroke';
    style?: ViewStyle;
    accessibilityLabel?: string;
};

const CircleIcon: React.FC<CircleSvgProps> = ({
    size = 48,
    color = '#000',
    strokeWidth = 2,
    variant = 'fill',
    style,
    accessibilityLabel = 'circle',
}) => {
    const half = Math.max(0, size) / 2;
    const effectiveStroke = variant === 'stroke' ? Math.max(0, strokeWidth) : 0;
    const radius = Math.max(0, half - effectiveStroke / 2);

    return (
        <Svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            style={style}
            accessibilityRole="image"
            accessibilityLabel={accessibilityLabel}
        >
            <Circle
                cx={half}
                cy={half}
                r={radius}
                fill={variant === 'fill' ? color : 'none'}
                stroke={variant === 'stroke' ? color : 'none'}
                strokeWidth={effectiveStroke}
            />
        </Svg>
    );
};

export default React.memo(CircleIcon);
