import React from 'react';
import Svg, { Path } from 'react-native-svg';

type Props = {
    width?: number | string;
    height?: number | string;
    primary?: string; // stroke color
    strokeWidth?: number;
    preserveAspectRatio?: string;
};

export default function EmailIcon({
    width = 24,
    height = 24,
    primary = '#000',
    strokeWidth = 1,
    preserveAspectRatio = 'xMidYMid meet',
}: Props) {
    return (
        <Svg
            width={width}
            height={height}
            viewBox="0 0 12 16"
            fill="none"
            preserveAspectRatio={preserveAspectRatio}
        >
            <Path
                d="M9.35805 4.25635H1.87138C1.35453 4.25635 0.935547 4.67533 0.935547 5.19218V10.8072C0.935547 11.324 1.35453 11.743 1.87138 11.743H9.35805C9.87489 11.743 10.2939 11.324 10.2939 10.8072V5.19218C10.2939 4.67533 9.87489 4.25635 9.35805 4.25635Z"
                stroke={primary}
                strokeOpacity={0.6}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M10.2939 5.66016L6.09667 8.32728C5.95221 8.41779 5.78518 8.46579 5.61471 8.46579C5.44424 8.46579 5.27722 8.41779 5.13276 8.32728L0.935547 5.66016"
                stroke={primary}
                strokeOpacity={0.6}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}
