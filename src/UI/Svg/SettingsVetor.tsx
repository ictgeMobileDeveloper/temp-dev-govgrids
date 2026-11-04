import React from 'react';
import Svg, {Path} from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  color?: string;
  preserveAspectRatio?: string;
};

export default function SettingsVector({
  width = 24,
  height = 24,
  color = '#FFFFFF',
  preserveAspectRatio = 'xMidYMid meet',
}: Props) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      preserveAspectRatio={preserveAspectRatio}>
      <Path
        d="M11 3h2a1 1 0 011 1v.569c0 .428.287.8.682.963.396.164.856.102 1.158-.2l.403-.403a1 1 0 011.414 0l1.414 1.414a1 1 0 010 1.414l-.402.403c-.303.302-.365.762-.201 1.158.164.395.535.682.963.682H20a1 1 0 011 1v2a1 1 0 01-1 1h-.569c-.428 0-.8.287-.963.682-.164.396-.102.856.2 1.158l.403.403a1 1 0 010 1.414l-1.414 1.414a1 1 0 01-1.414 0l-.403-.402c-.302-.303-.762-.365-1.158-.201-.395.164-.682.535-.682.963V20a1 1 0 01-1 1h-2a1 1 0 01-1-1v-.569c0-.428-.287-.8-.682-.963-.396-.164-.856-.102-1.158.2l-.403.403a1 1 0 01-1.414 0L4.93 17.657a1 1 0 010-1.414l.402-.403c.303-.302.365-.762.201-1.158-.164-.395-.535-.682-.963-.682H4a1 1 0 01-1-1v-2a1 1 0 011-1h.569c.428 0 .8-.287.963-.682.164-.396.102-.856-.2-1.158l-.403-.403a1 1 0 010-1.414L6.343 4.93a1 1 0 011.414 0l.403.402c.302.303.762.365 1.158.201.395-.164.682-.535.682-.963V4a1 1 0 011-1z"
        stroke={color}
        strokeWidth={1.5}
      />
      <Path
        d="M14 12a2 2 0 11-4 0 2 2 0 014 0z"
        stroke={color}
        strokeWidth={1.5}
      />
    </Svg>
  );
}
