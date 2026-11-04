import React from 'react';
import Svg, { Path } from 'react-native-svg';

type Props = {
    width?: number | string;
    height?: number | string;
    primary?: string; // stroke color
    strokeWidth?: number;
    preserveAspectRatio?: string;
};

export default function UserIcon({
    width = 24,
    height = 24,
    primary = '#000',
    strokeWidth = 1.3,
    preserveAspectRatio = 'xMidYMid meet',
}: Props) {
    return (
        <Svg
            width={width}
            height={height}
            viewBox="0 0 16 16"
            fill="none"
            preserveAspectRatio={preserveAspectRatio}
        >
            <Path
                d="M12.6663 14V12.6667C12.6663 11.9594 12.3854 11.2811 11.8853 10.781C11.3852 10.281 10.7069 10 9.99967 10H5.99967C5.29243 10 4.61415 10.281 4.11406 10.781C3.61396 11.2811 3.33301 11.9594 3.33301 12.6667V14"
                stroke={primary}
                strokeOpacity={0.6}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M7.99967 7.33333C9.47243 7.33333 10.6663 6.13943 10.6663 4.66667C10.6663 3.19391 9.47243 2 7.99967 2C6.52692 2 5.33301 3.19391 5.33301 4.66667C5.33301 6.13943 6.52692 7.33333 7.99967 7.33333Z"
                stroke={primary}
                strokeOpacity={0.6}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}
