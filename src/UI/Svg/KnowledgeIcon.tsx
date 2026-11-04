import React from 'react';
import Svg, {Path} from 'react-native-svg';
import type {SvgProps} from 'react-native-svg';

type Props = SvgProps & {
  /** icon stroke color */
  primary?: string;
  /** convenience prop to set both width & height */
  size?: number;
};

function KnowledgeIcon({
  size,
  width,
  height,
  primary = '#01BD91',
  ...rest
}: Props) {
  const w = size ?? width ?? 24;
  const h = size ?? height ?? 24;

  return (
    <Svg width={w} height={h} viewBox="0 0 24 24" fill="none" {...rest}>
      <Path
        d="M3.5 6H2M22 6H20.5M7.5 10H6.5C5.086 10 4.379 10 3.94 9.56C3.5 9.122 3.5 8.415 3.5 7C3.5 5.585 3.5 4.879 3.94 4.44C4.378 4 5.085 4 6.5 4H7.5C8.914 4 9.621 4 10.06 4.44C10.5 4.879 10.5 5.586 10.5 7C10.5 8.414 10.5 9.121 10.06 9.56C9.622 10 8.915 10 7.5 10ZM16.5 10H17.5C18.914 10 19.621 10 20.06 9.56C20.5 9.121 20.5 8.414 20.5 7C20.5 5.586 20.5 4.879 20.06 4.44C19.622 4 18.915 4 17.5 4H16.5C15.086 4 14.379 4 13.94 4.44C13.5 4.879 13.5 5.586 13.5 7C13.5 8.414 13.5 9.121 13.94 9.56C14.379 10 15.086 10 16.5 10Z"
        stroke={primary}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.5 6C13.5 5.60218 13.342 5.22064 13.0607 4.93934C12.7794 4.65804 12.3978 4.5 12 4.5C11.6022 4.5 11.2206 4.65804 10.9393 4.93934C10.658 5.22064 10.5 5.60218 10.5 6"
        stroke={primary}
        strokeWidth={1.5}
      />
      <Path
        d="M21 14H6C5.068 14 4.602 14 4.235 14.152C3.99218 14.2525 3.77155 14.3999 3.58572 14.5857C3.3999 14.7716 3.25251 14.9922 3.152 15.235C3 15.602 3 16.068 3 17C3 17.932 3 18.398 3.152 18.765C3.25251 19.0078 3.3999 19.2284 3.58572 19.4143C3.77155 19.6001 3.99218 19.7475 4.235 19.848C4.602 20 5.068 20 6 20H21"
        stroke={primary}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20 20C18.895 20 18 18.657 18 17C18 15.343 18.895 14 20 14"
        stroke={primary}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default React.memo(KnowledgeIcon);
