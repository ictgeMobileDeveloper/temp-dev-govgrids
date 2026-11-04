import React, {useEffect, useRef} from 'react';
import {Platform, View} from 'react-native';
import {Marker, MapMarker} from 'react-native-maps';
import Svg, {Circle, Path, Rect, Text as SvgText} from 'react-native-svg';
import {darkenHexColor} from '../../Utils/Helper';

export type ParkingSite = {
  id: number | string;
  buildingName?: string;
  buildingAddress?: string;
  buildingAddressCoords?: string;
  siteImageURL?: string;
  zones?: any[];
  [key: string]: any;
};

export const parseSiteCoords = (
  raw: string | undefined,
): {lat: number; lng: number} | null => {
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed?.lat === 'number' && typeof parsed?.lng === 'number') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

type MarkerPinProps = {
  site: ParkingSite;
  isActive: boolean;
  isPermit: boolean;
  colors: any;
  onPress: (site: ParkingSite) => void;
};

const MarkerPin = React.memo(
  ({site, isActive, isPermit, colors, onPress}: MarkerPinProps) => {
    const coords = parseSiteCoords(site.buildingAddressCoords);
    const markerRef = useRef<MapMarker>(null);

    // Android snapshots custom Marker children into a bitmap and only
    // refreshes it on request. redraw() is the documented, deterministic
    // way to force that refresh — no timing guesswork needed. No-op on iOS.
    useEffect(() => {
      if (Platform.OS !== 'android') return;
      const id = requestAnimationFrame(() => {
        markerRef.current?.redraw();
      });
      return () => cancelAnimationFrame(id);
    }, [isActive, isPermit]);

    if (!coords) {
      return null;
    }

    const size = 30;
    const height = Math.round(size * 1.22);
    const fill = isActive
      ? darkenHexColor(colors.Primary, 0.7)
      : colors.Primary;
    const stroke = colors.Primary;

    return (
      <Marker
        ref={markerRef}
        identifier={String(site.id)}
        coordinate={{latitude: coords.lat, longitude: coords.lng}}
        tracksViewChanges={false}
        anchor={{x: 0.5, y: 1}}
        onPress={e => {
          e.stopPropagation();
          onPress(site);
        }}>
        <View collapsable={false} style={{width: size, height}}>
          <Svg
            width={size}
            height={height}
            viewBox="0 0 30 36"
            preserveAspectRatio="xMidYMid meet">
            <Path d="M15 36 L11 28 L19 28 Z" fill={stroke} />

            {isPermit ? (
              <>
                <Rect
                  x="2"
                  y="2"
                  width="26"
                  height="26"
                  rx="6"
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={1.5}
                />
                <SvgText
                  x="15"
                  y="20.5"
                  fontSize="15"
                  fontWeight="800"
                  textAnchor="middle"
                  fill="#fff"
                  fontFamily="Arial">
                  P
                </SvgText>
              </>
            ) : (
              <>
                <Circle
                  cx="15"
                  cy="15"
                  r="13"
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={1.5}
                />
                <Circle
                  cx="15"
                  cy="15"
                  r="8"
                  fill="none"
                  stroke="#fff"
                  strokeWidth={1.6}
                />
                <Path
                  d="M15 10.5V15l3.2 1.9"
                  stroke="#fff"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  fill="none"
                />
              </>
            )}
          </Svg>
        </View>
      </Marker>
    );
  },
  (prev, next) =>
    prev.site.id === next.site.id &&
    prev.isActive === next.isActive &&
    prev.isPermit === next.isPermit &&
    prev.colors === next.colors,
);

export default MarkerPin;
