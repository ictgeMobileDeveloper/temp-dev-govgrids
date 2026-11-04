import React from 'react';
import Svg, { Path } from 'react-native-svg';

type Props = {
    width?: number | string;
    height?: number | string;
    primary?: string;
    strokeWidth?: number;
};

export default function PlusIcon({
    width = 22,
    height = 22,
    primary = '#01BD91',
    strokeWidth = 2,
}: Props) {
    return (
        <Svg
            width={width}
            height={height}
            viewBox="0 0 22 22"
            fill="none"
        >
            <Path
                d="M11 7V15M7 11H15M21 11C21 16.5228 16.5228 21 11 21C5.47715 21 1 16.5228 1 11C1 5.47715 5.47715 1 11 1C16.5228 1 21 5.47715 21 11Z"
                stroke={primary}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}
