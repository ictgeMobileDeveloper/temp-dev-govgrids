import React from 'react';
import Svg, { Path } from 'react-native-svg';

type Props = {
    width?: number | string;
    height?: number | string;
    primary?: string; // stroke color
    strokeWidth?: number;
    preserveAspectRatio?: string;
};

export default function GalleryIcon({
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
            viewBox="0 0 16 16"
            fill="none"
            preserveAspectRatio={preserveAspectRatio}
        >
            <Path
                d="M12.6667 2H3.33333C2.59695 2 2 2.59695 2 3.33333V12.6667C2 13.403 2.59695 14 3.33333 14H12.6667C13.403 14 14 13.403 14 12.6667V3.33333C14 2.59695 13.403 2 12.6667 2Z"
                stroke={primary}
                // strokeOpacity={0.6}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M6.00033 7.33317C6.73671 7.33317 7.33366 6.73622 7.33366 5.99984C7.33366 5.26346 6.73671 4.6665 6.00033 4.6665C5.26395 4.6665 4.66699 5.26346 4.66699 5.99984C4.66699 6.73622 5.26395 7.33317 6.00033 7.33317Z"
                stroke={primary}
                // strokeOpacity={0.6}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M14 9.99996L11.9427 7.94263C11.6926 7.69267 11.3536 7.55225 11 7.55225C10.6464 7.55225 10.3074 7.69267 10.0573 7.94263L4 14"
                stroke={primary}
                // strokeOpacity={0.6}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}
