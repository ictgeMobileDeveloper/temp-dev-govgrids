import React, {memo, useEffect, useRef} from 'react';
import {Animated, Easing, View} from 'react-native';
import {Marker} from 'react-native-maps';
import Svg, {Circle} from 'react-native-svg';
import {AppColors} from '../../Utils/AppConstants';

type Props = {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  fill?: string;
  stroke?: string;
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RIPSelectedLocation = memo(
  ({
    coordinate,
    fill = AppColors.Dark_Blue,
    stroke = AppColors.Black,
  }: Props) => {
    const pingProgress = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const animation = Animated.loop(
        Animated.timing(pingProgress, {
          toValue: 1,
          duration: 1600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
      );

      animation.start();

      return () => {
        animation.stop();
        pingProgress.stopAnimation();
      };
    }, [pingProgress]);

    const pingRadius = pingProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [9, 19],
    });

    const pingOpacity = pingProgress.interpolate({
      inputRange: [0, 0.15, 1],
      outputRange: [0.55, 0.35, 0],
    });

    return (
      <Marker coordinate={coordinate} anchor={{x: 0.5, y: 0.5}}>
        <View
          collapsable={false}
          style={{
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Svg width={40} height={40} viewBox="0 0 40 40">
            {/* Animated ping */}
            <AnimatedCircle
              cx="20"
              cy="20"
              r={pingRadius}
              fill="none"
              stroke={stroke}
              strokeWidth={0.7}
              opacity={pingOpacity}
            />

            {/* Main circle */}
            <Circle
              cx="20"
              cy="20"
              r="8"
              fill={fill}
              stroke={stroke}
              strokeWidth={1}
            />
          </Svg>
        </View>
      </Marker>
    );
  },
);

export default RIPSelectedLocation;
