// components/Logo.tsx
import React, {useRef, memo} from 'react';
import Svg, {
  Path,
  Defs,
  RadialGradient,
  Stop,
  SvgProps,
} from 'react-native-svg';

type Props = SvgProps & {
  width?: number | string;
  height?: number | string;
  primary?: string;
  secondary?: string;
  preserveAspectRatio?: string;
};

function Logo({
  width = 61,
  height = 62,
  primary = '#01BD91',
  secondary = '#98C1D9',
  preserveAspectRatio = 'xMidYMid meet',
  ...svgProps
}: Props) {
  const id = useRef(Math.random().toString(36).slice(2, 9)).current;
  const gid = (name: string) => `${name}_${id}`;

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 61 62"
      fill="none"
      preserveAspectRatio={preserveAspectRatio}
      {...svgProps}>
      {/* ===== SHAPES ===== */}
      <Path
        d="M43.8511 26.8292H31.2256V30.4365H43.8511V26.8292Z"
        fill="#85898C"
      />
      <Path
        d="M43.8511 31.5638H31.2256V33.3675H43.8511V31.5638Z"
        fill={`url(#${gid('paint0')})`}
      />
      <Path
        d="M45.2036 36.6367L54.2218 28.0695V46.444H45.2036V36.6367Z"
        fill="#5E6166"
      />
      <Path
        d="M45.2036 34.8329L53.32 26.8292H45.2036V34.8329Z"
        fill="#8A8B8F"
      />
      <Path
        d="M43.8511 34.6069H31.2256V39.0033H37.9892V45.8797L43.8511 50.7269V34.6069Z"
        fill={`url(#${gid('paint1')})`}
      />
      <Path
        d="M43.8508 52.3057L37.989 47.3457V52.3057H43.8508Z"
        fill={primary}
      />
      <Path
        d="M54.2218 47.5707H45.2036V52.3052H54.2218V47.5707Z"
        fill="#5E6166"
      />
      <Path
        d="M37.989 53.4327H45.2036L54.2218 60.9855V62H37.989V53.4327Z"
        fill="#5E6166"
      />
      <Path
        d="M54.2219 53.4327H47.0073L54.2219 59.52V53.4327Z"
        fill="#5E6166"
      />
      <Path
        d="M22.6583 57.0399H13.6401C16.2554 58.9337 20.4414 60.3842 22.2074 60.8726H22.6583V57.0399Z"
        fill={primary}
      />
      <Path
        d="M23.7854 57.0399V61.3236C26.0399 61.7745 28.4824 61.9623 29.4218 61.9999H36.8618V57.0399H23.7854Z"
        fill={secondary}
      />
      <Path
        d="M23.7854 55.913V44.6403C25.0479 45.993 28.8957 46.7069 30.6618 46.8948H36.8618V55.913H23.7854Z"
        fill={primary}
      />
      <Path
        d="M11.8364 40.8075H19.5019C20.7644 42.4308 22.1322 43.4378 22.6583 43.7384V55.913H11.8364V40.8075Z"
        fill={primary}
      />
      <Path
        d="M10.709 40.8075H1.46533C3.53952 48.2024 8.492 53.2075 10.709 54.7857V40.8075Z"
        fill={secondary}
      />
      <Path
        d="M7.10178 34.4949H0.338135C0.338135 36.5691 0.939347 38.7409 1.23995 39.5676H7.10178V34.4949Z"
        fill={primary}
      />
      <Path
        d="M8.229 34.6069H16.909C17.4501 37.4026 18.412 39.0785 18.8254 39.5669H8.229V34.6069Z"
        fill={secondary}
      />
      <Path
        d="M7.10182 11.9491H6.9891C2.26335 17.4502 0.172759 25.6643 0 29.0837V33.0291H7.10182V11.9491Z"
        fill={`url(#${gid('paint2')})`}
      />
      <Path
        d="M8.229 20.4037H21.6436C16.7737 24.6422 16.4581 30.8122 16.909 33.3673H8.229V20.4037Z"
        fill={`url(#${gid('paint3')})`}
      />
      <Path d="M13.189 19.0509V11.9491H8.229V19.0509H13.189Z" fill={primary} />
      <Path
        d="M13.189 10.7089V5.29797C13.189 5.29797 11.3854 6.31252 10.1454 7.66525C8.90537 9.01798 8.229 10.7089 8.229 10.7089H13.189Z"
        fill={secondary}
      />
      <Path
        d="M24.6873 8.3418V18.4873C23.9659 18.4873 23.4097 18.9382 23.2219 19.1636H14.3164V8.3418H24.6873Z"
        fill="#344966"
      />
      <Path
        d="M14.3164 6.98888V4.50888C18.8255 1.71324 23.1091 0.788875 24.6873 0.676147V6.98888H14.3164Z"
        fill="#344966"
      />
      <Path
        d="M26.04 8.3418V17.8109C27.1222 17.1796 29.7225 16.7964 30.8873 16.6836H34.8328V8.3418H26.04Z"
        fill={`url(#${gid('paint4')})`}
      />
      <Path
        d="M26.04 6.9891V0.450909C26.4008 0.270546 28.2946 0.0751516 29.1964 0H34.8328V6.9891H26.04Z"
        fill={`url(#${gid('paint5')})`}
      />
      <Path
        d="M42.9492 8.11621H36.1855V16.6835H42.9492V8.11621Z"
        fill="#5E6166"
      />
      <Path
        d="M52.1928 8.11621H44.0764V16.3453L52.1928 8.11621Z"
        fill={secondary}
      />
      <Path d="M42.9492 6.9891V0H36.1855V6.9891H42.9492Z" fill="#8B8F92" />
      <Path d="M48.5855 6.9891V0H44.0764V6.9891H48.5855Z" fill={secondary} />
      <Path
        d="M53.5456 6.9891L60.1965 0H49.7129V6.9891H53.5456Z"
        fill={secondary}
      />
      <Path
        d="M30.0982 26.8292H26.491V39.0038H30.0982V26.8292Z"
        fill={`url(#${gid('paint6')})`}
      />

      {/* ===== GRADIENTS ===== */}
      <Defs>
        <RadialGradient
          id={gid('paint0')}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(47.2329 30.3238) rotate(-6.15184) scale(18.9345 7.22743)">
          <Stop offset="0.583468" stopColor="#7F8084" />
          <Stop offset="0.630143" stopColor="#5E6265" />
        </RadialGradient>

        <RadialGradient
          id={gid('paint1')}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(49.7129 25.7015) rotate(-45.1854) scale(24.6306 24.9842)">
          <Stop offset="0.573414" stopColor="#7E7F81" />
          <Stop offset="0.60358" stopColor="#5E6265" />
        </RadialGradient>

        <RadialGradient
          id={gid('paint2')}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(11.0473 16.12) rotate(-25.9249) scale(18.0491 50.0034)">
          <Stop offset="0.418269" stopColor={primary} />
          <Stop offset="0.4523" stopColor={primary} />
        </RadialGradient>

        <RadialGradient
          id={gid('paint3')}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(17.6982 -13.3018 24.3903 21.588 17.3599 21.7564)">
          <Stop offset="0.418269" stopColor={primary} />
          <Stop offset="0.464831" stopColor={primary} />
        </RadialGradient>

        <RadialGradient
          id={gid('paint4')}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(10.5964 -1.12727 4.58194 16.6879 35.96 9.46907)">
          <Stop offset="0.418269" stopColor={primary} />
          <Stop offset="0.5" stopColor={primary} />
        </RadialGradient>

        <RadialGradient
          id={gid('paint5')}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(8.45455 12.6255 -12.1455 14.3332 37.5382 2.81818)">
          <Stop offset="0.472275" stopColor={primary} />
          <Stop offset="0.521237" stopColor={primary} />
        </RadialGradient>

        <RadialGradient
          id={gid('paint6')}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(28.4073 24.011) rotate(-93.2839) scale(13.7754 13.2686)">
          <Stop offset="0.380895" stopColor="#777B7E" />
          <Stop offset="0.424954" stopColor="#5D6164" />
        </RadialGradient>
      </Defs>
    </Svg>
  );
}

export default memo(Logo);
