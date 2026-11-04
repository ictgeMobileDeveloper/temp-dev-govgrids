import React from 'react';
import Svg, {ClipPath, Defs, G, Path, Rect} from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  primary?: string; // stroke color
  strokeWidth?: number;
  preserveAspectRatio?: string;
};

export default function ACIcon({
  width = 24,
  height = 24,
  primary = '#000',
  strokeWidth = 2,
  preserveAspectRatio = 'xMidYMid meet',
}: Props) {
  return (
    <Svg width="16" height="12" viewBox="0 0 16 12" fill="none">
      <G clip-path="url(#clip0_879_19759)">
        <Path
          d="M6.4 9.8C6.52676 9.89507 6.6743 9.95866 6.83046 9.98552C6.98662 10.0124 7.14692 10.0018 7.29817 9.95451C7.44941 9.90727 7.58726 9.82476 7.70037 9.71378C7.81347 9.60281 7.89858 9.46655 7.94868 9.31623C7.99879 9.16591 8.01246 9.00583 7.98856 8.84919C7.96467 8.69255 7.90389 8.54383 7.81124 8.41529C7.71859 8.28675 7.59673 8.18206 7.45568 8.10986C7.31464 8.03765 7.15845 8 7 8H1"
          stroke={primary}
          strokeOpacity="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M8.75 4C8.87784 3.82954 9.04713 3.6946 9.2418 3.60797C9.43647 3.52134 9.65005 3.48592 9.86226 3.50505C10.0745 3.52419 10.2783 3.59725 10.4543 3.7173C10.6303 3.83735 10.7727 4.00041 10.868 4.19098C10.9633 4.38156 11.0083 4.59333 10.9987 4.80619C10.9892 5.01904 10.9253 5.22592 10.8133 5.40716C10.7013 5.58841 10.5448 5.73802 10.3587 5.84178C10.1726 5.94554 9.96307 6 9.75 6H1"
          stroke={primary}
          strokeOpacity="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M4.9 2.2C5.02676 2.10493 5.1743 2.04134 5.33046 2.01448C5.48662 1.98761 5.64692 1.99824 5.79817 2.04549C5.94941 2.09273 6.08726 2.17524 6.20037 2.28622C6.31347 2.39719 6.39858 2.53345 6.44868 2.68377C6.49879 2.83409 6.51246 2.99417 6.48856 3.15081C6.46467 3.30745 6.40389 3.45617 6.31124 3.58471C6.21859 3.71325 6.09673 3.81794 5.95568 3.89014C5.81464 3.96235 5.65845 4 5.5 4H1"
          stroke={primary}
          strokeOpacity="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_879_19759">
          <Rect width="12" height="12" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}
