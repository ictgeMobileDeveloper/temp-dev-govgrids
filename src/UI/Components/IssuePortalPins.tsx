import React, {memo, useEffect, useState} from 'react';
import {View} from 'react-native';
import {Marker} from 'react-native-maps';
import Svg, {Circle, Path, Rect} from 'react-native-svg';
import {AppColors} from '../../Utils/AppConstants';

const PIN_COLORS: Record<string, string> = {
  open: AppColors.ToastColors.Alarm,
  acknowledged: AppColors.Ice_Blue,
  closed: AppColors.ToastColors.Success,
  archived: AppColors.Grey_2,
};

const PIN_SIZE = 22;
const PIN_HEIGHT = Math.round(PIN_SIZE * 1.25);

const PIN_SIZE_SELECTED = 26;
const PIN_HEIGHT_SELECTED = Math.round(PIN_SIZE_SELECTED * 1.25);

const MAX_WIDTH = PIN_SIZE_SELECTED;
const MAX_HEIGHT = PIN_HEIGHT_SELECTED;

const IssuePortalPinMarker = memo(({item, isSelected, onPress}: Props) => {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  const status = PIN_COLORS[item?.status] ? item.status : 'open';
  const fill = PIN_COLORS[status];
  const stroke = AppColors.Black;

  const size = isSelected ? PIN_SIZE_SELECTED : PIN_SIZE;
  const height = isSelected ? PIN_HEIGHT_SELECTED : PIN_HEIGHT;

  useEffect(() => {
    setTracksViewChanges(true);

    const timer = setTimeout(() => {
      setTracksViewChanges(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [isSelected, fill]);

  return (
    <Marker
      coordinate={{
        latitude: item.addressCoords.lat,
        longitude: item.addressCoords.lng,
      }}
      anchor={{x: 0.5, y: 1}}
      zIndex={isSelected ? 999 : 1}
      tracksViewChanges={tracksViewChanges}
      onPress={() => onPress(item)}>
      <View
        collapsable={false}
        style={{
          width: MAX_WIDTH,
          height: MAX_HEIGHT,
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}>
        <Svg
          width={size}
          height={height}
          viewBox="0 0 28 35"
          preserveAspectRatio="xMidYMid meet">
          <Path d="M14 35 L10 27 L18 27 Z" fill={fill} />

          <Rect
            x="5"
            y="4"
            width="18"
            height="18"
            rx="4"
            transform="rotate(45 14 13)"
            fill={fill}
            stroke={stroke}
            strokeWidth="0.5"
          />

          <Rect x="12.7" y="7.5" width="2.6" height="7" rx="1.3" fill="#fff" />

          <Circle cx="14" cy="17.5" r="1.4" fill="#fff" />
        </Svg>
      </View>
    </Marker>
  );
});

type Props = {
  item: any;
  isSelected: boolean;
  onPress: (item: any) => void;
};

export default IssuePortalPinMarker;
