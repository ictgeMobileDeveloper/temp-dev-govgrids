import React from 'react';
import Svg, {
    Rect,
    G,
    Path,
    Defs,
    Stop,
    LinearGradient,
    ClipPath,
} from 'react-native-svg';

type Props = {
    width?: number | string;
    height?: number | string;
    primary?: string;
    secondary?: string;
};

export default function MapIcon({
    width = 16,
    height = 16,
    primary = '#fff',
}: Props) {
    return (
        <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
            <G clip-path="url(#clip0_2506_4426)">
                <Path d="M5.33366 11.9997L0.666992 14.6663V3.99967L5.33366 1.33301M5.33366 11.9997L10.667 14.6663M5.33366 11.9997V1.33301M10.667 14.6663L15.3337 11.9997V1.33301L10.667 3.99967M10.667 14.6663V3.99967M10.667 3.99967L5.33366 1.33301" stroke="#F9F9F9" strokeLinecap="round" strokeLinejoin="round" />
            </G>
            <Defs>
                <ClipPath id="clip0_2506_4426">
                    <Rect width={width} height={height} fill={primary} />
                </ClipPath>
            </Defs>
        </Svg>

    );
}
