import React, {useRef, useEffect} from 'react';
import {Animated} from 'react-native';
import Svg, {Path} from 'react-native-svg';

interface AnimatedChevronProps {
  expanded: boolean;
  size?: number;
  color?: string;
  duration?: number;
}

const AnimatedChevron: React.FC<AnimatedChevronProps> = ({
  expanded,
  size = 20,
  color = '#33363F',
  duration = 300,
}) => {
  const rotateValue = useRef(new Animated.Value(expanded ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(rotateValue, {
      toValue: expanded ? 1 : 0,
      duration,
      useNativeDriver: true,
    }).start();
  }, [expanded, duration, rotateValue]);

  // Path is drawn pointing UP by default.
  // Collapsed -> rotated 180deg (points down, "tap to expand")
  // Expanded  -> 0deg (points up, "tap to collapse")
  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '0deg'],
  });

  return (
    <Animated.View style={{transform: [{rotate}]}}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M18 15l-6-6-6 6" stroke={color} strokeWidth={2} />
      </Svg>
    </Animated.View>
  );
};

export default AnimatedChevron;
