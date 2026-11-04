import {useCallback, useRef, useState} from 'react';
import {Alert, Linking, Platform} from 'react-native';
import {
  check,
  openSettings,
  PERMISSIONS,
  request,
  RESULTS,
  type Permission,
} from 'react-native-permissions';
import {promptForEnableLocationIfNeeded} from 'react-native-android-location-enabler';
import GetLocation from 'react-native-get-location';
import DeviceInfo from 'react-native-device-info';
import Geocoder from 'react-native-geocoding';
import {extractAddressDetails} from '../Utils/Helper';
import type {Region} from 'react-native-maps';
import type {MutableRefObject} from 'react';
import type MapView from 'react-native-maps';

export type LatLng = {latitude: number; longitude: number};
export type ApiPolygonPoint = {
  lat?: number | string;
  lng?: number | string;
  latitude?: number | string;
  longitude?: number | string;
};

export type MapBounds = {
  boundsNorth: number;
  boundsSouth: number;
  boundsEast: number;
  boundsWest: number;
};

export const LOCATION_PERMISSION: Permission =
  Platform.OS === 'ios'
    ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
    : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

export const normalizePolygonPoint = (
  point: ApiPolygonPoint,
): LatLng | null => {
  const latitude = Number(point.latitude ?? point.lat);
  const longitude = Number(point.longitude ?? point.lng);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {latitude, longitude};
};

export const parseCityPolygon = (polygonData: unknown): LatLng[] => {
  try {
    if (!polygonData) return [];

    let data = polygonData;

    if (typeof polygonData === 'string') {
      const raw = polygonData.trim();

      if (!raw) return [];

      const normalized = raw
        .replace(/'/g, '"')
        .replace(/([{,])\s*(\w+)\s*:/g, '$1"$2":');

      data = JSON.parse(normalized);
    }

    if (!Array.isArray(data)) return [];

    return data
      .map(normalizePolygonPoint)
      .filter((point): point is LatLng => point !== null);
  } catch {
    return [];
  }
};

export const isPointInsidePolygon = (
  point: LatLng,
  polygon: LatLng[],
): boolean => {
  if (polygon.length < 3) return false;

  const x = point.longitude;
  const y = point.latitude;

  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].longitude;
    const yi = polygon[i].latitude;
    const xj = polygon[j].longitude;
    const yj = polygon[j].latitude;

    const isIntersecting =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (isIntersecting) {
      inside = !inside;
    }
  }

  return inside;
};

export const regionToBounds = ({
  latitude,
  longitude,
  latitudeDelta,
  longitudeDelta,
}: Region): MapBounds => ({
  boundsNorth: latitude + latitudeDelta / 2,
  boundsSouth: latitude - latitudeDelta / 2,
  boundsEast: longitude + longitudeDelta / 2,
  boundsWest: longitude - longitudeDelta / 2,
});

export const getPolygonBounds = (polygon: LatLng[]): MapBounds | null => {
  if (polygon.length < 3) return null;

  const lats = polygon.map(p => p.latitude);
  const lngs = polygon.map(p => p.longitude);

  return {
    boundsNorth: Math.max(...lats),
    boundsSouth: Math.min(...lats),
    boundsEast: Math.max(...lngs),
    boundsWest: Math.min(...lngs),
  };
};

export const useLocationServices = (toastWarn: (msg: string) => void) => {
  const openLocationSettings = useCallback(async () => {
    try {
      await openSettings();
      return;
    } catch {}
    try {
      await Linking.openSettings();
    } catch {}
  }, []);

  const showPermissionBlockedAlert = useCallback(() => {
    Alert.alert(
      'Location Permission Blocked',
      'Location access is blocked for this app. Please enable it in Settings.',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Open Settings', onPress: () => openLocationSettings()},
      ],
    );
  }, [openLocationSettings]);

  const ensureLocationPermission = useCallback(async () => {
    let status = await check(LOCATION_PERMISSION);
    if (status === RESULTS.DENIED) {
      status = await request(LOCATION_PERMISSION);
    }
    if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) return true;
    if (status === RESULTS.BLOCKED) {
      showPermissionBlockedAlert();
      return false;
    }
    if (status === RESULTS.UNAVAILABLE) {
      toastWarn('Location is not available on this device.');
      return false;
    }
    toastWarn('Location permission was not granted.');
    return false;
  }, [showPermissionBlockedAlert, toastWarn]);

  const ensureLocationServicesEnabled = useCallback(async () => {
    try {
      const enabled = await DeviceInfo.isLocationEnabled();
      if (enabled) return true;
    } catch (error) {
      console.warn('Unable to verify location services state', error);
    }

    if (Platform.OS === 'android') {
      try {
        await promptForEnableLocationIfNeeded({
          interval: 10_000,
          // fastInterval: 5_000,
          // forceHighAccuracy: true,
          // openLocationSettings: true,
        });
        return true;
      } catch {
        Alert.alert(
          'Turn On Location',
          'Please enable Location services to continue.',
          [{text: 'OK'}],
        );
        return false;
      }
    }

    Alert.alert(
      'Turn On Location',
      'Location Services are turned off. Please enable them in Settings.',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Open Settings', onPress: () => openLocationSettings()},
      ],
    );
    return false;
  }, [openLocationSettings]);

  const getCurrentLocation = useCallback(async (): Promise<LatLng> => {
    try {
      const loc = await GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
      });
      return {latitude: loc.latitude, longitude: loc.longitude};
    } catch (error: any) {
      const code = error?.code;
      if (code !== 'TIMEOUT' && code !== 'UNAVAILABLE') {
        throw error;
      }
    }

    const fallbackLoc = await GetLocation.getCurrentPosition({
      enableHighAccuracy: false,
      timeout: 10000,
    });
    return {latitude: fallbackLoc.latitude, longitude: fallbackLoc.longitude};
  }, []);

  const getLocationErrorMessage = useCallback((error: any) => {
    switch (error?.code) {
      case 'UNAUTHORIZED':
        return 'Location permission is required to fetch your current location.';
      case 'TIMEOUT':
        return 'Location request timed out. Please try again.';
      case 'UNAVAILABLE':
        return 'Unable to determine your location right now.';
      case 'CANCELLED':
        return 'Location request was cancelled.';
      default:
        return error?.message || 'Unable to fetch your current location.';
    }
  }, []);

  const reverseGeocode = useCallback(async (coord: LatLng) => {
    try {
      const res = await Geocoder.from(coord.latitude, coord.longitude);
      const first = res.results?.[0];
      if (!first) return {address: '', details: null as any};
      const details = extractAddressDetails(first);
      return {address: first.formatted_address || '', details};
    } catch (error) {
      console.log('reverseGeocode error:', error);
      return {address: '', details: null as any};
    }
  }, []);

  return {
    ensureLocationPermission,
    ensureLocationServicesEnabled,
    getCurrentLocation,
    getLocationErrorMessage,
    reverseGeocode,
    showPermissionBlockedAlert,
    openLocationSettings,
  };
};

const DEFAULT_ZOOM_DELTA = 0.04;
const EDGE_PADDING = {top: 40, right: 40, bottom: 40, left: 40};

export const useBoundedMapRegion = (
  mapRef: MutableRefObject<MapView | null>,
  polygonCoords: LatLng[],
  initialRegion: Region,
) => {
  const [region, setRegion] = useState<Region>(initialRegion);
  const lastValidRegionRef = useRef<Region>(initialRegion);
  const isReturningRef = useRef(false);

  const centerMap = useCallback(
    (coord: LatLng, delta = DEFAULT_ZOOM_DELTA) => {
      const next: Region = {
        ...coord,
        latitudeDelta: delta,
        longitudeDelta: delta,
      };
      setRegion(next);
      lastValidRegionRef.current = next;
      mapRef.current?.animateToRegion(next, 350);
    },
    [mapRef],
  );

  const fitToPolygon = useCallback(() => {
    if (polygonCoords.length < 3) return;
    mapRef.current?.fitToCoordinates(polygonCoords, {
      edgePadding: EDGE_PADDING,
      animated: true,
    });
  }, [mapRef, polygonCoords]);

  const onRegionChangeComplete = useCallback(
    (nextRegion: Region) => {
      const accept = () => {
        setRegion(nextRegion);
        lastValidRegionRef.current = nextRegion;
      };

      if (polygonCoords.length < 3) return accept();

      if (isReturningRef.current) {
        isReturningRef.current = false;
        return accept();
      }

      const center: LatLng = {
        latitude: nextRegion.latitude,
        longitude: nextRegion.longitude,
      };

      if (isPointInsidePolygon(center, polygonCoords)) {
        return accept();
      }

      isReturningRef.current = true;

      mapRef.current?.animateToRegion(
        {
          ...lastValidRegionRef.current,
          latitudeDelta: nextRegion.latitudeDelta,
          longitudeDelta: nextRegion.longitudeDelta,
        },
        300,
      );
    },
    [polygonCoords, mapRef],
  );
  return {region, centerMap, fitToPolygon, onRegionChangeComplete};
};
