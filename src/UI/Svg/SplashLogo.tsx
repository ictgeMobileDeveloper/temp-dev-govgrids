import React, {useEffect, useRef} from 'react';
import {Animated, Easing, Image, ImageSourcePropType, View} from 'react-native';

type Props = {
  width?: number;
  height?: number;
  source?: ImageSourcePropType;
};

// Source SVG viewBox is 241x248, revealed through an animated 9x9 tile mask
// (radial "bloom": center tile blooms first, outer tiles follow with more delay).
// Each tile fades/scales in, holds, then fades/scales out, looping forever;
// animation-delay only offsets the FIRST cycle (matches CSS infinite semantics).

const IMG_W = 241;
const IMG_H = 248;
const DURATION = 4200; // ms, matches 4.2s CSS animation
const BLOOM_EASING = Easing.bezier(0.22, 0.61, 0.36, 1);

// Keyframes: 0% opacity 0 / scale 0 -> 24% opacity 1 / scale 1.14
//            -> 30% scale 1 -> 84% hold -> 100% opacity 0 / scale 0
const KEYFRAME_INPUT = [0, 0.24, 0.3, 0.84, 1];
const OPACITY_OUTPUT = [0, 1, 1, 1, 0];
const SCALE_OUTPUT = [0, 1.14, 1, 1, 0];

type TileData = {x: number; y: number; w: number; h: number; delay: number};

const TILES: TileData[] = [
  {x: 0, y: 0, w: 27.28, h: 28.06, delay: 0.9},
  {x: 26.78, y: 0, w: 27.28, h: 28.06, delay: 0.795},
  {x: 53.56, y: 0, w: 27.28, h: 28.06, delay: 0.712},
  {x: 80.33, y: 0, w: 27.28, h: 28.06, delay: 0.656},
  {x: 107.11, y: 0, w: 27.28, h: 28.06, delay: 0.636},
  {x: 133.89, y: 0, w: 27.28, h: 28.06, delay: 0.656},
  {x: 160.67, y: 0, w: 27.28, h: 28.06, delay: 0.712},
  {x: 187.44, y: 0, w: 27.28, h: 28.06, delay: 0.795},
  {x: 214.22, y: 0, w: 27.28, h: 28.06, delay: 0.9},
  {x: 0, y: 27.56, w: 27.28, h: 28.06, delay: 0.795},
  {x: 26.78, y: 27.56, w: 27.28, h: 28.06, delay: 0.675},
  {x: 53.56, y: 27.56, w: 27.28, h: 28.06, delay: 0.574},
  {x: 80.33, y: 27.56, w: 27.28, h: 28.06, delay: 0.503},
  {x: 107.11, y: 27.56, w: 27.28, h: 28.06, delay: 0.477},
  {x: 133.89, y: 27.56, w: 27.28, h: 28.06, delay: 0.503},
  {x: 160.67, y: 27.56, w: 27.28, h: 28.06, delay: 0.574},
  {x: 187.44, y: 27.56, w: 27.28, h: 28.06, delay: 0.675},
  {x: 214.22, y: 27.56, w: 27.28, h: 28.06, delay: 0.795},
  {x: 0, y: 55.11, w: 27.28, h: 28.06, delay: 0.712},
  {x: 26.78, y: 55.11, w: 27.28, h: 28.06, delay: 0.574},
  {x: 53.56, y: 55.11, w: 27.28, h: 28.06, delay: 0.45},
  {x: 80.33, y: 55.11, w: 27.28, h: 28.06, delay: 0.356},
  {x: 107.11, y: 55.11, w: 27.28, h: 28.06, delay: 0.318},
  {x: 133.89, y: 55.11, w: 27.28, h: 28.06, delay: 0.356},
  {x: 160.67, y: 55.11, w: 27.28, h: 28.06, delay: 0.45},
  {x: 187.44, y: 55.11, w: 27.28, h: 28.06, delay: 0.574},
  {x: 214.22, y: 55.11, w: 27.28, h: 28.06, delay: 0.712},
  {x: 0, y: 82.67, w: 27.28, h: 28.06, delay: 0.656},
  {x: 26.78, y: 82.67, w: 27.28, h: 28.06, delay: 0.503},
  {x: 53.56, y: 82.67, w: 27.28, h: 28.06, delay: 0.356},
  {x: 80.33, y: 82.67, w: 27.28, h: 28.06, delay: 0.225},
  {x: 107.11, y: 82.67, w: 27.28, h: 28.06, delay: 0.159},
  {x: 133.89, y: 82.67, w: 27.28, h: 28.06, delay: 0.225},
  {x: 160.67, y: 82.67, w: 27.28, h: 28.06, delay: 0.356},
  {x: 187.44, y: 82.67, w: 27.28, h: 28.06, delay: 0.503},
  {x: 214.22, y: 82.67, w: 27.28, h: 28.06, delay: 0.656},
  {x: 0, y: 110.22, w: 27.28, h: 28.06, delay: 0.636},
  {x: 26.78, y: 110.22, w: 27.28, h: 28.06, delay: 0.477},
  {x: 53.56, y: 110.22, w: 27.28, h: 28.06, delay: 0.318},
  {x: 80.33, y: 110.22, w: 27.28, h: 28.06, delay: 0.159},
  {x: 107.11, y: 110.22, w: 27.28, h: 28.06, delay: 0.0},
  {x: 133.89, y: 110.22, w: 27.28, h: 28.06, delay: 0.159},
  {x: 160.67, y: 110.22, w: 27.28, h: 28.06, delay: 0.318},
  {x: 187.44, y: 110.22, w: 27.28, h: 28.06, delay: 0.477},
  {x: 214.22, y: 110.22, w: 27.28, h: 28.06, delay: 0.636},
  {x: 0, y: 137.78, w: 27.28, h: 28.06, delay: 0.656},
  {x: 26.78, y: 137.78, w: 27.28, h: 28.06, delay: 0.503},
  {x: 53.56, y: 137.78, w: 27.28, h: 28.06, delay: 0.356},
  {x: 80.33, y: 137.78, w: 27.28, h: 28.06, delay: 0.225},
  {x: 107.11, y: 137.78, w: 27.28, h: 28.06, delay: 0.159},
  {x: 133.89, y: 137.78, w: 27.28, h: 28.06, delay: 0.225},
  {x: 160.67, y: 137.78, w: 27.28, h: 28.06, delay: 0.356},
  {x: 187.44, y: 137.78, w: 27.28, h: 28.06, delay: 0.503},
  {x: 214.22, y: 137.78, w: 27.28, h: 28.06, delay: 0.656},
  {x: 0, y: 165.33, w: 27.28, h: 28.06, delay: 0.712},
  {x: 26.78, y: 165.33, w: 27.28, h: 28.06, delay: 0.574},
  {x: 53.56, y: 165.33, w: 27.28, h: 28.06, delay: 0.45},
  {x: 80.33, y: 165.33, w: 27.28, h: 28.06, delay: 0.356},
  {x: 107.11, y: 165.33, w: 27.28, h: 28.06, delay: 0.318},
  {x: 133.89, y: 165.33, w: 27.28, h: 28.06, delay: 0.356},
  {x: 160.67, y: 165.33, w: 27.28, h: 28.06, delay: 0.45},
  {x: 187.44, y: 165.33, w: 27.28, h: 28.06, delay: 0.574},
  {x: 214.22, y: 165.33, w: 27.28, h: 28.06, delay: 0.712},
  {x: 0, y: 192.89, w: 27.28, h: 28.06, delay: 0.795},
  {x: 26.78, y: 192.89, w: 27.28, h: 28.06, delay: 0.675},
  {x: 53.56, y: 192.89, w: 27.28, h: 28.06, delay: 0.574},
  {x: 80.33, y: 192.89, w: 27.28, h: 28.06, delay: 0.503},
  {x: 107.11, y: 192.89, w: 27.28, h: 28.06, delay: 0.477},
  {x: 133.89, y: 192.89, w: 27.28, h: 28.06, delay: 0.503},
  {x: 160.67, y: 192.89, w: 27.28, h: 28.06, delay: 0.574},
  {x: 187.44, y: 192.89, w: 27.28, h: 28.06, delay: 0.675},
  {x: 214.22, y: 192.89, w: 27.28, h: 28.06, delay: 0.795},
  {x: 0, y: 220.44, w: 27.28, h: 28.06, delay: 0.9},
  {x: 26.78, y: 220.44, w: 27.28, h: 28.06, delay: 0.795},
  {x: 53.56, y: 220.44, w: 27.28, h: 28.06, delay: 0.712},
  {x: 80.33, y: 220.44, w: 27.28, h: 28.06, delay: 0.656},
  {x: 107.11, y: 220.44, w: 27.28, h: 28.06, delay: 0.636},
  {x: 133.89, y: 220.44, w: 27.28, h: 28.06, delay: 0.656},
  {x: 160.67, y: 220.44, w: 27.28, h: 28.06, delay: 0.712},
  {x: 187.44, y: 220.44, w: 27.28, h: 28.06, delay: 0.795},
  {x: 214.22, y: 220.44, w: 27.28, h: 28.06, delay: 0.9},
];

const Tile: React.FC<{
  tile: TileData;
  scaleX: number;
  scaleY: number;
  source: ImageSourcePropType;
}> = ({tile, scaleX, scaleY, source}) => {
  const anim = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    anim.setValue(0);
    const timeout = setTimeout(() => {
      loopRef.current = Animated.loop(
        Animated.timing(anim, {
          toValue: 1,
          duration: DURATION,
          easing: BLOOM_EASING,
          useNativeDriver: true,
        }),
      );
      loopRef.current.start();
    }, tile.delay * 1000);

    return () => {
      clearTimeout(timeout);
      loopRef.current?.stop();
    };
  }, [anim, tile.delay]);

  const opacity = anim.interpolate({
    inputRange: KEYFRAME_INPUT,
    outputRange: OPACITY_OUTPUT,
  });
  const scale = anim.interpolate({
    inputRange: KEYFRAME_INPUT,
    outputRange: SCALE_OUTPUT,
  });

  const left = tile.x * scaleX;
  const top = tile.y * scaleY;
  const tileW = tile.w * scaleX;
  const tileH = tile.h * scaleY;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left,
        top,
        width: tileW,
        height: tileH,
        overflow: 'hidden',
        opacity,
        transform: [{scale}],
      }}>
      <Image
        source={source}
        resizeMode="stretch"
        style={{
          position: 'absolute',
          left: -left,
          top: -top,
          width: IMG_W * scaleX,
          height: IMG_H * scaleY,
        }}
      />
    </Animated.View>
  );
};

const SplashLogo: React.FC<Props> = ({
  width = 82,
  height = 96,
  source = require('../../assets/images/logo.png'),
}) => {
  const scaleX = width / IMG_W;
  const scaleY = height / IMG_H;

  return (
    <View style={{width, height}}>
      {TILES.map((tile, i) => (
        <Tile
          key={i}
          tile={tile}
          scaleX={scaleX}
          scaleY={scaleY}
          source={source}
        />
      ))}
    </View>
  );
};

export default SplashLogo;
