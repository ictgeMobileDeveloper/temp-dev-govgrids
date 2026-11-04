import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
import {normalized} from '../../Utils/AppConstants';

type InfoIconProps = {
  primary?: string;
  size?: number;
};

const InfoIcon = ({
  primary = '#FFFFFF',
  size = normalized(18),
}: InfoIconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M7.415 7.75v3.69H6.376v1.576h4.24V11.44H9.6V6.175H6.376V7.75h1.039zm.276-2.698a1.19 1.19 0 002.035-.838 1.164 1.164 0 00-.346-.846 1.193 1.193 0 00-1.693 0 1.158 1.158 0 00-.35.846 1.144 1.144 0 00.354.838z"
        fill={primary}
      />
    </Svg>
  );
};

export default InfoIcon;
