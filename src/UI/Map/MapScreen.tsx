import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Easing,
  LayoutChangeEvent,
  UIManager,
  ActivityIndicator,
  LayoutAnimation,
} from 'react-native';
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  MapPressEvent,
  Region,
} from 'react-native-maps';
import {useDispatch, useSelector} from 'react-redux';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useIsFocused} from '@react-navigation/native';
import Geocoder from 'react-native-geocoding';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {AppColors, normalized, ScreenProps} from '../../Utils/AppConstants';
import {AppStrings} from '../../Utils/AppStrings';
import {setShowToast} from '../../Redux/AppReducers';
import CustomHeader from '../Components/CustomHeader';
import {SECRET_KEYS} from '../../Network/Urls';
import CurrentLocationIcon from '../Svg/LiveLocation';
import CustomGooglePlacesInput, {
  PlaceResult,
} from '../Components/CustomGooglePlacesInput';
import {useLocationServices} from '../../Utils/useLocationServices';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type LatLng = {latitude: number; longitude: number};
//USA_NAME

const DEFAULT_ZOOM_DELTA = 0.04;
const SHEET_TARGET_HEIGHT_BASE = 180;

const MapScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const dispatch = useDispatch();
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const baseData = selector?.baseData || {};
  const mapViewRef = useRef<MapView>(null);
  const isFocused = useIsFocused();
  const isRight = props?.route?.params?.isRight;
  const [address, setAddress] = useState('');
  const [selectedCoord, setSelectedCoord] = useState<LatLng | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [liveLocationLoading, setLiveLocationLoading] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(true);

  const initialRegion = useMemo<Region>(
    () => ({
      latitude: baseData?.addressCoords?.lat,
      longitude: baseData?.addressCoords?.lng,
      latitudeDelta: 0.5,
      longitudeDelta: 0.5,
    }),
    [],
  );
  const lastChosenRef = useRef<any>(null);
  const sheetAnim = useRef(new Animated.Value(0)).current;
  const [measuredSheetHeight, setMeasuredSheetHeight] = useState<number>(
    normalized(SHEET_TARGET_HEIGHT_BASE) + insects.bottom + normalized(16),
  );

  const toastWarn = useCallback(
    (message: string) => {
      dispatch(setShowToast({type: AppStrings.ToastType.warning, message}));
    },
    [dispatch],
  );

  const {
    ensureLocationPermission,
    ensureLocationServicesEnabled,
    getCurrentLocation,
    getLocationErrorMessage,
    reverseGeocode,
    showPermissionBlockedAlert,
  } = useLocationServices(toastWarn);

  const isActiveRef = useRef(true);

  useEffect(() => {
    return () => {
      isActiveRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (SECRET_KEYS?.GOOGLE_MAP_KEY) {
      Geocoder.init(SECRET_KEYS.GOOGLE_MAP_KEY, {language: 'en'});
    }
  }, []);

  const centerMap = useCallback((coord: LatLng, delta = DEFAULT_ZOOM_DELTA) => {
    mapViewRef.current?.animateToRegion(
      {
        latitude: coord.latitude,
        longitude: coord.longitude,
        latitudeDelta: delta,
        longitudeDelta: delta,
      },
      350,
    );
  }, []);

  const enforceCountry = useCallback(
    (details: any) => {
      const detailCountry = (details?.country).trim().toLowerCase();
      const baseCountry = (baseData?.country).trim().toLowerCase();
      return detailCountry === baseCountry;
    },
    [baseData?.country],
  );

  const animateSheet = useCallback(
    (to: 0 | 1) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

      Animated.timing(sheetAnim, {
        toValue: to,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    },
    [sheetAnim],
  );

  const sendChosenLocation = useCallback(
    async (
      coord: LatLng,
      providedAddress?: string,
      source: 'map' | 'places' | 'search' = 'map',
      providedDetails?: any,
    ) => {
      const {address: resolvedAddress, details: geocodedDetails} =
        providedDetails
          ? {address: providedAddress, details: providedDetails}
          : await reverseGeocode(coord);

      const details = providedDetails ?? geocodedDetails;
      const finalAddress = providedAddress || resolvedAddress || '';

      // const {address: resolvedAddress, details} = await reverseGeocode(coord);
      // if (!isActiveRef.current) return;
      // const finalAddress = providedAddress || resolvedAddress || '';
      // console.log('details--->>>. ', details);

      if (!details || !enforceCountry(details)) {
        console.log(
          'Detail country',
          details?.country,
          'base country',
          baseData?.country,
        );
        toastWarn(
          `This application  supports  within the ${baseData?.country} only.`,
        );
        return;
      }

      const params = {
        zipCode: details?.postal_code || details?.zipcode || details?.zip || '',
        City:
          details?.city ||
          details?.locality ||
          details?.town ||
          details?.sublocality ||
          '',
        State: details?.state || details?.administrative_area_level_1 || '',
        address: finalAddress,
        location: {lat: coord.latitude, lng: coord.longitude},
        source,
      };

      setSelectedCoord(coord);
      setSelectedAddress(finalAddress);
      setAddress(finalAddress);

      animateSheet(1);
      lastChosenRef.current = params;
      return params;
    },
    [reverseGeocode, enforceCountry, toastWarn, animateSheet],
  );

  const handleCoordSelection = useCallback(
    async (coord: LatLng) => {
      return sendChosenLocation(coord, undefined, 'map');
    },
    [sendChosenLocation],
  );

  const onMapPress = useCallback(
    async (e: MapPressEvent) => {
      const coord = e.nativeEvent.coordinate;
      const previousCoord = selectedCoord;
      setSelectedCoord(coord);
      centerMap(coord);
      const resolved = await handleCoordSelection(coord);
      if (!resolved) {
        setSelectedCoord(previousCoord);
      }
    },
    [centerMap, handleCoordSelection, selectedCoord],
  );

  const bootstrapCurrentLocation = useCallback(async () => {
    const hasPermission = await ensureLocationPermission();
    if (!hasPermission || !isActiveRef.current) return;

    const servicesEnabled = await ensureLocationServicesEnabled();
    if (!servicesEnabled || !isActiveRef.current) return;

    try {
      const coord = await getCurrentLocation();
      if (!isActiveRef.current) return;
      centerMap(coord, DEFAULT_ZOOM_DELTA);
      await sendChosenLocation(coord, undefined, 'map');
    } catch (error: any) {
      console.warn('Current location bootstrap failed', error);
      toastWarn(getLocationErrorMessage(error));
    }
  }, [
    ensureLocationPermission,
    ensureLocationServicesEnabled,
    getCurrentLocation,
    centerMap,
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

  // useEffect(() => {
  //   if (!isFocused) return;
  //   bootstrapCurrentLocation();
  // }, [bootstrapCurrentLocation, isFocused]);

  // const onSubmitAddress = useCallback(async () => {
  //   const q = (address || '').trim();
  //   if (!q) return;

  //   try {
  //     const res = await Geocoder.from(q);
  //     const first = res.results?.[0];
  //     if (!first) return;

  //     const details = extractAddressDetails(first);
  //     console.log('detail -----  ', details);

  //     if (!enforceUSA(details)) {
  //       toastWarn(
  //         'This application currently supports locations within the United States only.',
  //       );
  //       return;
  //     }

  //     const loc = first.geometry?.location;
  //     if (typeof loc?.lat === 'number' && typeof loc?.lng === 'number') {
  //       const coord: LatLng = {latitude: loc.lat, longitude: loc.lng};
  //       centerMap(coord);
  //       // use unified sendChosenLocation with source 'search'
  //       await sendChosenLocation(coord, first.formatted_address || q, 'search');
  //     }
  //   } catch {}
  // }, [address, centerMap, enforceUSA, toastWarn, sendChosenLocation]);

  const hideBottomSheet = () => {
    animateSheet(0);
  };

  const onSheetContentLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h && Math.abs(h - measuredSheetHeight) > 1) {
      setMeasuredSheetHeight(h);
    }
  };

  // Animated height style
  const sheetHeightStyle = {
    height: sheetAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, measuredSheetHeight],
    }),
    overflow: 'hidden' as const,
  };

  return (
    <View style={{flex: 1}}>
      <View
        style={[
          styles.container,
          {
            paddingTop: insects.top - normalized(Platform.OS == 'ios' ? 15 : 0),
            paddingBottom: Platform.OS === 'android' ? insects.bottom : 0,
          },
        ]}>
        <StatusBar barStyle="light-content" />

        <CustomHeader
          onBackPress={() => props?.navigation?.goBack()}
          text={props?.route?.params?.headingTxt ?? 'Map'}
          isRight={props?.route?.params?.isRight}
        />

        <View style={{paddingHorizontal: normalized(20), flex: 1}}>
          <View style={{height: normalized(10)}} />
          <Text
            style={[
              styles.Input_Heading,
              {
                textAlign: isRight ? 'right' : 'left',
              },
            ]}>
            {props?.route?.params?.address ?? 'Address*'}
          </Text>

          <CustomGooglePlacesInput
            apiKey={SECRET_KEYS.GOOGLE_MAP_KEY}
            value={address}
            countryRestriction={baseData?.countryCode?.toLowerCase()}
            country={baseData?.country}
            onChangeText={setAddress}
            onPlaceSelected={async (p: PlaceResult) => {
              console.log('on select ----  ', p);
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
            placeholder={`Search address (${baseData.country})`}
            debounceMs={1000}
            minLength={2}
            maxResults={6}
          />
          <View
            style={[
              styles.mapCont,
              {
                marginVertical:
                  Platform.OS === 'android'
                    ? insects.bottom + normalized(20)
                    : normalized(20),
                flexGrow: 1,
                flexShrink: 1,
              },
            ]}>
            <MapView
              ref={mapViewRef}
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={initialRegion}
              minZoomLevel={Platform.OS === 'ios' ? 2 : 3}
              maxZoomLevel={18}
              zoomEnabled
              zoomTapEnabled
              onMapReady={() => setIsMapLoading(false)}
              // followsUserLocation
              onPress={onMapPress}>
              {selectedCoord && <Marker coordinate={selectedCoord} />}
            </MapView>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.liveLocationBtn}
              onPress={onPressLiveLocation}>
              <CurrentLocationIcon size={25} color={colors.Primary} />
            </TouchableOpacity>
          </View>
        </View>
        {/* Bottom sheet as a NORMAL view (no absolute). The map stays interactive. */}
        <Animated.View style={[styles.sheetContainer, sheetHeightStyle]}>
          <View onLayout={onSheetContentLayout} style={styles.sheetInner}>
            <View style={styles.sheetHandle} />
            <Text
              style={[
                styles.sheetTitle,
                {
                  textAlign: isRight ? 'right' : 'left',
                },
              ]}>
              {props?.route?.params?.selectedAddress ?? 'Selected Address'}
            </Text>
            <Text style={styles.sheetAddress} numberOfLines={3}>
              {selectedAddress || '—'}
            </Text>

            <View style={styles.sheetActions}>
              <TouchableOpacity
                style={styles.sheetBtnPrimary}
                onPress={() => {
                  const params = lastChosenRef.current;
                  if (params) {
                    try {
                      props?.route?.params?.onChooseLocation?.(params);
                    } catch (err) {
                      console.warn('onChooseLocation callback threw', err);
                    }
                  }
                  // Do something with the selected location if you want
                  hideBottomSheet();
                  props?.navigation?.goBack();
                }}>
                <Text style={styles.sheetBtnTextPrimary}>
                  {props?.route?.params?.btnTxt ?? 'Use this location'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
      {isMapLoading && (
        <View style={styles.loaderCont}>
          <ActivityIndicator size="large" color={colors.Primary} />
        </View>
      )}
    </View>
  );
};

export default MapScreen;

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
      marginTop: normalized(20),
      borderRadius: normalized(12),
      overflow: 'hidden',
      flex: 1,
      zIndex: 1,
    },

    // Bottom sheet as NORMAL view (stacked after the map)
    sheetContainer: {
      width: '100%',
      borderTopColor: colors.BorderColor,
      borderWidth: 1,
      borderTopLeftRadius: normalized(20),
      borderTopRightRadius: normalized(20),

      borderLeftColor: colors.BorderColor,
      borderRightColor: colors.BorderColor,
      borderBottomColor: 'transparent',
      backgroundColor: AppColors.White, // needed for proper shadow rendering
      // iOS: real top-only shadow (negative Y offset)
      // Android: use elevation (cannot be directional), we'll add a top cap below to fake “top-only”
      ...Platform.select({
        ios: {
          shadowColor: AppColors.Black,
          shadowOpacity: 0.15,
          shadowRadius: normalized(12),
          shadowOffset: {width: 0, height: -6},
        },
        android: {
          elevation: 4,
          shadowOffset: {width: 0, height: -6},
        },
      }),
    },

    // An extra thin “shadow cap” that sits *above* the sheet to make Android look top-only.
    topShadowCap: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: -1, // sits just above the top edge
      height: normalized(16),
      // iOS: softer shadow feather
      ...Platform.select({
        ios: {
          shadowColor: AppColors.Black,
          shadowOpacity: 0.12,
          shadowRadius: normalized(12),
          shadowOffset: {width: 0, height: -6},
          backgroundColor: 'transparent',
        },
        // Android: use elevation to fake a top-only glow
        android: {
          elevation: 10,
          backgroundColor: 'transparent',
        },
      }),
      // ensure it doesn’t block touches below
      pointerEvents: 'none',
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
      shadowColor: AppColors.Black,
      shadowOpacity: 0.2,
      shadowRadius: normalized(4),
      shadowOffset: {width: 0, height: 2},
    },
    sheetInner: {
      backgroundColor: colors.White || '#fff',
      borderTopLeftRadius: normalized(20),
      borderTopRightRadius: normalized(20),
      paddingHorizontal: normalized(16),
      paddingTop: normalized(10),
      paddingBottom: normalized(16),
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOpacity: 0.12,
          shadowRadius: 8,
          shadowOffset: {width: 0, height: -2},
        },
        android: {},
      }),
    },
    sheetHandle: {
      alignSelf: 'center',
      width: normalized(50),
      height: normalized(5),
      borderRadius: normalized(3),
      backgroundColor: '#D0D5DD',
      marginBottom: normalized(8),
    },
    sheetTitle: {
      fontSize: normalized(16),
      fontWeight: '600',
      marginBottom: normalized(6),
      color: colors.Black || '#111',
    },
    sheetAddress: {
      fontSize: normalized(14),
      color: colors.Black || '#111',
      opacity: 0.9,
    },
    sheetActions: {
      marginTop: normalized(14),
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: normalized(10),
    },
    sheetBtnPrimary: {
      flex: 1,
      backgroundColor: colors.Primary || '#0A84FF',
      paddingVertical: normalized(12),
      borderRadius: normalized(12),
      alignItems: 'center',
      justifyContent: 'center',
    },
    sheetBtnSecondary: {
      flex: 1,
      backgroundColor: '#F2F4F7',
      paddingVertical: normalized(12),
      borderRadius: normalized(12),
      alignItems: 'center',
      justifyContent: 'center',
    },
    sheetBtnTextPrimary: {
      color: '#fff',
      fontWeight: '600',
    },
    sheetBtnTextSecondary: {
      color: '#111',
      fontWeight: '600',
    },
  });
