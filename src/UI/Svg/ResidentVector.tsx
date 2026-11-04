import React from 'react';
import Svg, {Path} from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  color?: string;
  preserveAspectRatio?: string;
};

export default function ResidentVector({
  width = 40,
  height = 40,
  color = '#01BD91',
  preserveAspectRatio = 'xMidYMid meet',
}: Props) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 40 40"
      fill="none"
      preserveAspectRatio={preserveAspectRatio}>
      <Path
        d="M35 5V40H5V5H15C15 4.3099 15.1302 3.66536 15.3906 3.06641C15.651 2.46745 16.0091 1.93359 16.4648 1.46484C16.9206 0.996094 17.4479 0.638021 18.0469 0.390625C18.6458 0.143229 19.2969 0.0130208 20 0C20.6901 0 21.3346 0.130208 21.9336 0.390625C22.5326 0.651042 23.0664 1.00911 23.5352 1.46484C24.0039 1.92057 24.362 2.44792 24.6094 3.04688C24.8568 3.64583 24.987 4.29688 25 5H35ZM12.5 10H27.5V7.5H22.5V5C22.5 4.64844 22.4349 4.32292 22.3047 4.02344C22.1745 3.72396 21.9987 3.46354 21.7773 3.24219C21.556 3.02083 21.2891 2.83854 20.9766 2.69531C20.6641 2.55208 20.3385 2.48698 20 2.5C19.6484 2.5 19.3229 2.5651 19.0234 2.69531C18.724 2.82552 18.4635 3.0013 18.2422 3.22266C18.0208 3.44401 17.8385 3.71094 17.6953 4.02344C17.5521 4.33594 17.487 4.66146 17.5 5V7.5H12.5V10ZM20 30H17.5V32.5H20V30ZM20 15H17.5V27.5H20V15Z"
        fill={color}
      />
    </Svg>
  );
}
