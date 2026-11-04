import React from 'react';
import Svg, {Path} from 'react-native-svg';
import type {SvgProps} from 'react-native-svg';

type Props = SvgProps & {
  primary?: string;
  size?: number;
};

function ProblemIcon({
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
        d="M3 20v-2h2.75l-.4-.35c-.817-.817-1.412-1.704-1.787-2.662A8.017 8.017 0 013 12.05c0-1.85.554-3.496 1.663-4.937C5.772 5.672 7.217 4.717 9 4.25v2.1a5.927 5.927 0 00-2.9 2.213A5.919 5.919 0 005 12.05c0 .75.142 1.48.425 2.188.283.709.725 1.363 1.325 1.962l.25.25V14h2v6H3zm8.288-3.287A.968.968 0 0111 16c0-.283.096-.52.288-.712A.973.973 0 0112 15c.283 0 .52.095.713.288A.96.96 0 0113 16a.983.983 0 01-.288.713A.95.95 0 0112 17a.978.978 0 01-.712-.287zM11 13V7h2v6h-2zm4 6.75v-2.1a5.927 5.927 0 002.9-2.213A5.919 5.919 0 0019 11.95c0-.75-.142-1.48-.425-2.188-.283-.709-.725-1.363-1.325-1.962L17 7.55V10h-2V4h6v2h-2.75l.4.35c.817.817 1.412 1.704 1.787 2.662A8.017 8.017 0 0121 11.95c0 1.85-.554 3.496-1.663 4.937C18.228 18.328 16.783 19.283 15 19.75z"
        fill={primary}
      />
    </Svg>
  );
}

export default React.memo(ProblemIcon);
