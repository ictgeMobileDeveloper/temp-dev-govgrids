import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import Stepper from '../Components/Stepper';
import {
  normalized,
  RIP_STEPPER_LIST,
  ScreenProps,
} from '../../Utils/AppConstants';
import CustomGooglePlacesInput, {
  PlaceResult,
} from '../Components/CustomGooglePlacesInput';
import {SECRET_KEYS} from '../../Network/Urls';
import {AppStrings} from '../../Utils/AppStrings';
import {setShowToast, updateRipDraft} from '../../Redux/AppReducers';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import MapView, {
  LatLng,
  MapPressEvent,
  Marker,
  PROVIDER_GOOGLE,
  Region,
  Polygon,
} from 'react-native-maps';
import {useIsFocused} from '@react-navigation/native';
import Geocoder from 'react-native-geocoding';
import SimpleButton from '../Components/SimpleButton';
import CustomButton from '../Components/CustomButton';
import CurrentLocationIcon from '../Svg/LiveLocation';
import {
  useLocationServices,
  parseCityPolygon,
  isPointInsidePolygon,
  useBoundedMapRegion,
} from '../../Utils/useLocationServices';
import {Routes} from '../../Utils/Routes';

const RIPChooseLocScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const dispatch = useDispatch();
  const baseData = selector?.baseData;
  const isFocused = useIsFocused();
  const mapViewRef = useRef<MapView>(null);
  const draft = selector?.ripDraft ?? {};
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [address, setAddress] = useState(draft?.address ?? '');

  const [selectedCoord, setSelectedCoord] = useState<LatLng | null>(
    draft?.location
      ? {
          latitude: draft.location.lat,
          longitude: draft.location.lng,
        }
      : null,
  );

  const [selectedAddress, setSelectedAddress] = useState<string>(
    draft?.address ?? '',
  );

  const [addressObj, setAddressObj] = useState<any>(() =>
    draft?.location
      ? {
          zipCode: draft?.zipCode ?? '',
          city: draft?.city ?? '',
          state: draft?.state ?? '',
          address: draft?.address ?? '',
          location: draft?.location,
          source: draft?.source,
        }
      : {},
  );
  const polygonCoords = useMemo(
    () => parseCityPolygon(baseData?.cityAreaPolygon),
    [baseData?.cityAreaPolygon],
  );
  const {region, centerMap, fitToPolygon, onRegionChangeComplete} =
    useBoundedMapRegion(mapViewRef, polygonCoords, {
      latitude: polygonCoords?.[0]?.latitude ?? baseData?.addressCoords?.lat,
      longitude: polygonCoords?.[0]?.longitude ?? baseData?.addressCoords?.lng,
      latitudeDelta: 0.5,
      longitudeDelta: 0.5,
    });

  const [liveLocationLoading, setLiveLocationLoading] = useState(false);

  const country = baseData?.country;

  const isActiveRef = useRef(true);
  const toastWarn = useCallback(
    (message: string) => {
      dispatch(setShowToast({type: AppStrings.ToastType.warning, message}));
    },
    [dispatch],
  );

  const {
    reverseGeocode,
    ensureLocationPermission,
    ensureLocationServicesEnabled,
    getCurrentLocation,
    getLocationErrorMessage,
  } = useLocationServices(toastWarn);

  useEffect(() => {
    if (SECRET_KEYS?.GOOGLE_MAP_KEY) {
      Geocoder.init(SECRET_KEYS.GOOGLE_MAP_KEY, {language: 'en'});
    }
  }, []);

  useEffect(() => {
    if (!isFocused || polygonCoords.length < 3) return;
    const timeout = setTimeout(fitToPolygon, 500);
    return () => clearTimeout(timeout);
  }, [isFocused, polygonCoords, fitToPolygon]);

  const resetMapToInitialCenter = useCallback(() => {
    setSelectedCoord(null);
    setSelectedAddress('');
    setAddressObj({});

    if (polygonCoords.length >= 3) return fitToPolygon();

    const latitude =
      polygonCoords?.[0]?.latitude ?? baseData?.addressCoords?.lat;
    const longitude =
      polygonCoords?.[0]?.longitude ?? baseData?.addressCoords?.lng;
    if (latitude == null || longitude == null) return;

    centerMap({latitude, longitude}, 1);
  }, [
    polygonCoords,
    baseData?.addressCoords?.lat,
    baseData?.addressCoords?.lng,
    fitToPolygon,
    centerMap,
  ]);

  useEffect(() => {
    if (draft?.location) {
      const coord = {
        latitude: draft.location.lat,
        longitude: draft.location.lng,
      };

      setSelectedCoord(coord);
      setSelectedAddress(draft?.address ?? '');
      setAddress(draft?.address ?? '');
      centerMap(coord);
      return;
    }

    resetMapToInitialCenter();
  }, [draft?.location, draft?.address, centerMap, resetMapToInitialCenter]);
  // for dragging back to location

  const enforceArea = useCallback(
    (details: any) =>
      details?.city === baseData?.city &&
      (details?.state === baseData?.state ||
        details?.stateCode === baseData?.stateCode),
    [baseData?.city, baseData?.state, baseData?.stateCode],
  );

  const sendChosenLocation = useCallback(
    async (
      coord: LatLng,
      providedAddress?: string,
      source: 'map' | 'places' | 'search' = 'map',
      providedDetails?: any,
    ) => {
      const geoData = providedDetails
        ? {address: providedAddress || '', details: providedDetails}
        : await reverseGeocode(coord);

      const {address: resolvedAddress, details} = geoData;
      const finalAddress = providedAddress || resolvedAddress || '';

      console.log('Details ', details, 'BaseData', baseData);

      if (!details || !enforceArea(details)) {
        console.log(
          'DCity ',
          details?.city,
          'and Bcity',
          baseData?.city,
          'DState  ',
          details?.stateCode,
          'and BState',
          baseData?.stateCode,
        );
        // if (isResolvingLocationRef.current) return;
        toastWarn(
          `This application currently supports locations within the ${baseData?.city}, ${baseData?.country} only.`,
        );
        return;
      }

      const params = {
        zipCode: details?.postal_code || details?.zipcode || details?.zip || '',
        city:
          details?.city ||
          details?.locality ||
          details?.town ||
          details?.sublocality ||
          '',
        state: details?.state || details?.administrative_area_level_1 || '',
        address: finalAddress,
        location: {lat: coord.latitude, lng: coord.longitude},
        source,
      };

      setSelectedCoord(coord);
      setSelectedAddress(finalAddress);
      setAddress(finalAddress);
      setAddressObj(params);
      centerMap(coord);

      return params;
    },
    [reverseGeocode, enforceArea, toastWarn, baseData, centerMap],
  );

  const handleCoordSelection = useCallback(
    async (coord: LatLng) => {
      await sendChosenLocation(coord, undefined, 'map');
    },
    [sendChosenLocation],
  );

  const blockMapPressUntilRef = useRef(0);
  const onMapPress = useCallback(
    async (e: MapPressEvent) => {
      if (Date.now() < blockMapPressUntilRef.current) {
        return;
      }
      const coord = e.nativeEvent.coordinate;
      await handleCoordSelection(coord);
    },
    [handleCoordSelection],
  );

  // const onSubmitAddress = useCallback(async () => {
  //   const q = (address || '').trim();
  //   if (!q) return;

  //   try {
  //     const res = await Geocoder.from(q);
  //     const first = res.results?.[0];
  //     if (!first) return;

  //     const details = extractAddressDetails(first);
  //     if (!enforceArea(details)) {
  //       toastWarn(
  //         'This application currently supports locations within the United States only.',
  //       );
  //       return;
  //     }

  //     const loc = first.geometry?.location;
  //     if (typeof loc?.lat === 'number' && typeof loc?.lng === 'number') {
  //       const coord: LatLng = {latitude: loc.lat, longitude: loc.lng};

  //       await sendChosenLocation(coord, first.formatted_address || q, 'search');
  //     }
  //   } catch {}
  // }, [address, centerMap, enforceArea, toastWarn, sendChosenLocation]);

  // Live Location

  const bootstrapCurrentLocation = useCallback(async () => {
    const hasPermission = await ensureLocationPermission();
    if (!hasPermission || !isActiveRef.current) return;

    const servicesEnabled = await ensureLocationServicesEnabled();
    if (!servicesEnabled || !isActiveRef.current) return;

    try {
      const coord = await getCurrentLocation();
      if (!isActiveRef.current) return;

      await sendChosenLocation(coord, undefined, 'map');
    } catch (error: any) {
      console.warn('Current location bootstrap failed', error);
      toastWarn(getLocationErrorMessage(error));
    }
  }, [
    ensureLocationPermission,
    ensureLocationServicesEnabled,
    getCurrentLocation,
    sendChosenLocation,
    toastWarn,
    getLocationErrorMessage,
  ]);

  const onPressLiveLocation = useCallback(async () => {
    if (liveLocationLoading) {
      return;
    }

    setLiveLocationLoading(true);
    try {
      await bootstrapCurrentLocation();
    } finally {
      setLiveLocationLoading(false);
    }
  }, [bootstrapCurrentLocation, liveLocationLoading]);

  const onNext = () => {
    const data = {
      ...(selector?.ripDraft ?? {}),
      ...(props?.route?.params?.data ?? {}),
      ...addressObj,
    };

    dispatch(updateRipDraft(data));

    props?.navigation?.navigate(Routes.RIP.SubmitScreen, {data});
  };

  return (
    <View style={{flex: 1}}>
      <View style={styles.container}>
        <Stepper
          list={RIP_STEPPER_LIST}
          completedSteps={[]}
          activeStep={RIP_STEPPER_LIST[2]}
        />

        <View style={{paddingHorizontal: normalized(20), flex: 1}}>
          <Text style={[styles.Input_Heading]}>Address*</Text>

          <CustomGooglePlacesInput
            apiKey={SECRET_KEYS.GOOGLE_MAP_KEY}
            value={address}
            countryRestriction={baseData?.countryCode?.toLowerCase()}
            country={baseData?.country}
            allowedCity={baseData?.city}
            restrictToCity
            allowedState={baseData?.stateCode}
            onChangeText={setAddress}
            onClear={resetMapToInitialCenter}
            onPlaceSelected={async (p: PlaceResult) => {
              console.log('on select ----  ', p);
              blockMapPressUntilRef.current = Date.now() + 1200;
              const coord = {latitude: p.lat, longitude: p.lng};

              await sendChosenLocation(coord, p.address, 'places', {
                city: p.components?.city,
                state: p.components?.state,
                stateCode: p.components?.state,
                country: p.components?.country,
                postalCode: p.components?.postalCode,
              });
            }}
            onError={err => {
              dispatch(
                setShowToast({
                  type: AppStrings.ToastType.warning,
                  message: err?.message || 'Address search failed',
                }),
              );
            }}
            placeholder={`Search address (${baseData?.city}, ${baseData?.country})`}
            debounceMs={1000}
            minLength={2}
            maxResults={10}
          />
          <View
            style={[
              styles.mapCont,
              {
                flexGrow: 1,
                flexShrink: 1,
              },
            ]}>
            <MapView
              ref={mapViewRef}
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={region}
              minZoomLevel={Platform.OS === 'ios' ? 2 : 3}
              maxZoomLevel={18}
              onMapReady={() => setIsMapLoading(false)}
              zoomEnabled
              zoomTapEnabled
              followsUserLocation
              onPress={onMapPress}
              onRegionChangeComplete={onRegionChangeComplete}>
              {selectedCoord && <Marker coordinate={selectedCoord} />}

              {polygonCoords.length >= 3 && (
                <Polygon
                  coordinates={polygonCoords}
                  strokeWidth={3}
                  strokeColor={colors?.Primary}
                  fillColor="transparent"
                  zIndex={2}
                />
              )}
            </MapView>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.liveLocationBtn}
              onPress={onPressLiveLocation}>
              <CurrentLocationIcon size={25} color={colors.Primary} />
            </TouchableOpacity>
          </View>
        </View>

        {addressObj?.location && (
          <View
            style={[
              styles.btnRow,
              {
                marginBottom:
                  Platform.OS === 'android'
                    ? insects.bottom + normalized(20)
                    : normalized(20),
              },
            ]}>
            <View style={styles.nextBtnCont}>
              <SimpleButton
                text={'Back'}
                onPress={() => props?.navigation?.goBack()}
                loading={false}
              />
            </View>
            <View style={styles.nextBtnCont}>
              <CustomButton text={'Next'} onPress={onNext} loading={false} />
            </View>
          </View>
        )}
      </View>
      {isMapLoading && (
        <View style={styles.loaderCont}>
          <ActivityIndicator size="large" color={colors.Primary} />
        </View>
      )}
    </View>
  );
};

export default RIPChooseLocScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    googlePlacesContainer: {
      width: '100%',
      alignSelf: 'center',
      borderRadius: normalized(10),
      overflow: 'hidden',
      zIndex: 1,
    },
    map: {
      flex: 1,
      backgroundColor: '#000',
      overflow: 'hidden',
      zIndex: 1,
    },
    mapCont: {
      marginTop: normalized(12),
      borderRadius: normalized(12),
      overflow: 'hidden',
      flex: 1,
      zIndex: 1,
    },
    nextBtnCont: {
      width: normalized(90),
    },
    btnRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: normalized(20),
    },
    liveLocationBtn: {
      position: 'absolute',
      right: normalized(12),
      bottom: normalized(12),
      width: normalized(44),
      height: normalized(44),
      borderRadius: normalized(22),
      backgroundColor: colors.White,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
      elevation: 6,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: normalized(4),
      shadowOffset: {width: 0, height: 2},
    },
  });
