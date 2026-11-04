import React from 'react';
import Svg, { Path } from 'react-native-svg';

type Props = {
    width?: number | string;
    height?: number | string;
    primary?: string; // stroke color
    strokeWidth?: number;
    preserveAspectRatio?: string;
};

export default function CarIcon({
    width = 24,
    height = 24,
    primary = '#000',
    strokeWidth = 1.3333,
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
                d="M12.6663 11.3332H13.9997C14.3997 11.3332 14.6663 11.0665 14.6663 10.6665V8.6665C14.6663 8.0665 14.1997 7.53317 13.6663 7.39984C12.4663 7.0665 10.6663 6.6665 10.6663 6.6665C10.6663 6.6665 9.79967 5.73317 9.19967 5.13317C8.86634 4.8665 8.46634 4.6665 7.99967 4.6665H3.33301C2.93301 4.6665 2.59967 4.93317 2.39967 5.2665L1.46634 7.19984C1.37806 7.45732 1.33301 7.72764 1.33301 7.99984V10.6665C1.33301 11.0665 1.59967 11.3332 1.99967 11.3332H3.33301"
                stroke={primary}
                strokeOpacity={0.6}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M4.66634 12.6667C5.40272 12.6667 5.99967 12.0697 5.99967 11.3333C5.99967 10.597 5.40272 10 4.66634 10C3.92996 10 3.33301 10.597 3.33301 11.3333C3.33301 12.0697 3.92996 12.6667 4.66634 12.6667Z"
                stroke={primary}
                strokeOpacity={0.6}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M6 11.3335H10"
                stroke={primary}
                strokeOpacity={0.6}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M11.3333 12.6667C12.0697 12.6667 12.6667 12.0697 12.6667 11.3333C12.6667 10.597 12.0697 10 11.3333 10C10.597 10 10 10.597 10 11.3333C10 12.0697 10.597 12.6667 11.3333 12.6667Z"
                stroke={primary}
                strokeOpacity={0.6}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}
