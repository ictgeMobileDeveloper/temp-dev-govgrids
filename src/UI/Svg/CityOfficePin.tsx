import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {Marker} from 'react-native-maps';
import Svg, {Circle, Path} from 'react-native-svg';
import {AppColors} from '../../Utils/AppConstants';

type CityOfficePinProps = {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  fill?: string;
  stroke?: string;
  identifier?: string;
  onPress?: () => void;
};

const CityOfficePin = React.memo(
  ({
    coordinate,
    fill = AppColors.ToastColors.Alarm,
    stroke = AppColors.ToastColors.Alarm,
    identifier,
    onPress,
  }: CityOfficePinProps) => {
    const [trackChanges, setTrackChanges] = useState(true);

    useEffect(() => {
      setTrackChanges(true);

      const timer = setTimeout(() => {
        setTrackChanges(false);
      }, 150);

      return () => clearTimeout(timer);
    }, [fill, stroke]);

    return (
      <Marker
        identifier={identifier}
        coordinate={coordinate}
        tracksViewChanges={trackChanges}
        anchor={{x: 0.5, y: 1}}
        onPress={onPress}>
        <View
          collapsable={false}
          style={{
            width: 36,
            height: 44,
          }}>
          <Svg
            width={36}
            height={44}
            viewBox="0 0 24 29"
            preserveAspectRatio="xMidYMid meet">
            <Path
              d="M12 0C7.58 0 4 3.58 4 8c0 6 8 16 8 16s8-10 8-16c0-4.42-3.58-8-8-8z"
              fill={fill}
              stroke={stroke}
              strokeWidth={1}
            />

            <Circle cx="12" cy="8" r="6" fill="#fff" />

            <Path
              d="M9 10.5V6.8l3-1.6 3 1.6v3.7z"
              fill="none"
              stroke={fill}
              strokeWidth={1.1}
              strokeLinejoin="round"
            />

            <Path
              d="M10.4 10.5V8.2h3.2v2.3"
              fill="none"
              stroke={fill}
              strokeWidth={1.1}
            />
          </Svg>
        </View>
      </Marker>
    );
  },
);

export default CityOfficePin;
