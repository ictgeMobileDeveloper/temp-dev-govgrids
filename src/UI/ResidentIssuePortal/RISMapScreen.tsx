import {
  ActivityIndicator,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  AppImages,
  MAP_CUSTOMIZATION,
  normalized,
  ScreenProps,
  ScreenSize,
} from '../../Utils/AppConstants';
import Geocoder from 'react-native-geocoding';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import MapView, {
  LatLng,
  MapPressEvent,
  Marker,
  Polygon,
  PROVIDER_GOOGLE,
  Region,
} from 'react-native-maps';
import {setShowToast} from '../../Redux/AppReducers';
import CustomGooglePlacesInput, {
  PlaceResult,
} from '../Components/CustomGooglePlacesInput';
import {ENDPOINTS, SECRET_KEYS} from '../../Network/Urls';
import {AppStrings} from '../../Utils/AppStrings';
import {capitalizeEachWord, extractAddressDetails} from '../../Utils/Helper';
import {apiHandler} from '../../Network/Services/ApiHandler';
import CustomHeader from '../Components/CustomHeader';
import Modal from 'react-native-modal';
import CloseIcon from '../Svg/CloseIcon';
import moment from 'moment';
import SimpleButton from '../Components/SimpleButton';
import CustomButton from '../Components/CustomButton';
import {Routes} from '../../Utils/Routes';
import {useIsFocused} from '@react-navigation/native';
import IssuePortalPinMarker from '../Components/IssuePortalPins';
import CityOfficePin from '../Svg/CityOfficePin';
import MapLegend from '../Components/MapLegends';
import RIPSelectedLocation from '../Svg/RIPSelectedPlace';

const DEFAULT_ZOOM_DELTA = 0.04;

const CustomModal = ({isVisible, onClose, onPress, item}: any) => {
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const baseData = selector?.baseData;

  return (
    <Modal
      isVisible={isVisible}
      animationIn={'zoomIn'}
      animationOut={'zoomOut'}
      animationInTiming={400}
      animationOutTiming={400}
      style={{
        height: ScreenSize.height,
        width: ScreenSize.width,
      }}>
      <StatusBar barStyle={'light-content'} />
      <View style={styles.box}>
        <View style={styles.headingCont}>
          <Text style={styles.Modal_Heading_Txt}>{item?.requestId}</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onClose}
            style={styles.closeCont}>
            <CloseIcon primary={colors.Desc_Txt} />
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />

        <View style={{paddingHorizontal: normalized(20)}}>
          <View
            style={[
              styles.row,
              {gap: normalized(12), alignItems: 'flex-start'},
            ]}>
            <View style={styles.item}>
              <Text style={styles.keyTxt}>Created At</Text>
              <Text style={styles.valueTxt}>
                {moment(item?.createdAt).format('LLL')}
              </Text>
            </View>
            <View style={styles.item}>
              <Text style={styles.keyTxt}>Status</Text>
              <View
                style={[
                  styles.statusCont,
                  {
                    backgroundColor: colors.Primary,
                    alignSelf: 'flex-start',
                  },
                ]}>
                <Text style={styles.statusTxt}>
                  {capitalizeEachWord(item?.status)}
                </Text>
              </View>
            </View>
          </View>

          <View style={{height: normalized(10)}} />

          <View
            style={[
              styles.row,
              {gap: normalized(12), alignItems: 'flex-start'},
            ]}>
            <View style={styles.item}>
              <Text style={styles.keyTxt}>Address</Text>
              <Text style={styles.valueTxt}>{item?.address}</Text>
            </View>
            <View style={styles.item}>
              <Text style={styles.keyTxt}>Reporter</Text>
              <Text style={styles.valueTxt}>
                {item?.resident
                  ? `${item?.resident?.firstName} ${item?.resident?.lastName}`
                  : baseData?.cityName}
              </Text>
            </View>
          </View>

          <View style={{height: normalized(10)}} />

          <View style={styles.row}>
            <View style={styles.item}>
              <Text style={styles.keyTxt}>Description</Text>
              <Text style={styles.valueTxt}>{item?.description}</Text>
            </View>
          </View>

          <View style={styles.btnRow}>
            <View style={{width: normalized(80)}}>
              <SimpleButton text={'Cancel'} onPress={onClose} loading={false} />
            </View>
            <View style={{width: normalized(120)}}>
              <CustomButton
                text={'View Details'}
                onPress={() => {
                  onPress(item);
                }}
                loading={false}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const RISMapScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const baseData = selector?.baseData;
  const colors = selector.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const [isShowModal, setIsShowModal] = useState(false);
  const dispatch = useDispatch();

  // const [isShowModal, setIsShowModal] = useState(
  //   props?.route?.params?.item ? true : false,
  // );

  const toastWarn = useCallback(
    (message: string) => {
      dispatch(setShowToast({type: AppStrings.ToastType.warning, message}));
    },
    [dispatch],
  );
  const isFocused = useIsFocused();
  const mapViewRef = useRef<MapView>(null);
  const [address, setAddress] = useState('');
  const [addressObj, setAddressObj] = useState({});
  const [selectedItem, setSelectedItem] = useState<any>(
    props?.route?.params?.item ?? null,
  );

  const [region, setRegion] = useState<Region>({
    latitudeDelta: 0,
    longitudeDelta: 0,
    latitude: baseData?.addressCoords?.lat,
    longitude: baseData?.addressCoords?.lng,
  });
  const [selectedCoord, setSelectedCoord] = useState<LatLng>({
    longitude: 0,
    latitude: 0,
  });
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const centerMap = useCallback((coord: LatLng, delta = DEFAULT_ZOOM_DELTA) => {
    setRegion(prev => ({
      ...prev,
      latitude: coord.latitude,
      longitude: coord.longitude,
      latitudeDelta: delta,
      longitudeDelta: delta,
    }));

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

  const reverseGeocode = useCallback(async (coord: LatLng) => {
    try {
      const res = await Geocoder.from(coord.latitude, coord.longitude);
      const first = res.results?.[0];
      if (!first) return {address: '', details: null as any};
      const details = extractAddressDetails(first);
      return {address: first.formatted_address || '', details};
    } catch {
      return {address: '', details: null as any};
    }
  }, []);

  const sendChosenLocation = useCallback(
    async (
      coord: LatLng,
      providedAddress?: string,
      source: 'map' | 'places' | 'search' = 'map',
    ) => {
      const {address: resolvedAddress, details} = await reverseGeocode(coord);
      const finalAddress = providedAddress || resolvedAddress || '';
      //   if (!details || !enforceUSA(details)) {
      // toastWarn(
      //   'This application currently supports locations within the United States only.',
      // );
      // return;
      //   }

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
      // setSelectedAddress(finalAddress);
      setAddress(finalAddress);
      setAddressObj(params);
      return params;
    },
    [reverseGeocode, toastWarn],
  );

  // const handleCoordSelection = useCallback(
  //   async (coord: LatLng) => {
  //     await sendChosenLocation(coord, undefined, 'map');
  //   },
  //   [sendChosenLocation],
  // );

  // const onMapPress = useCallback(
  //   async (e: MapPressEvent) => {
  //     const coord = e.nativeEvent.coordinate;
  //     centerMap(coord);
  //     await handleCoordSelection(coord);
  //   },
  //   [centerMap, handleCoordSelection],
  // );

  useEffect(() => {
    fetchResReq();
  }, [isFocused]);

  const fetchResReq = () => {
    if (list?.length == 0) {
      setLoading(true);
    }
    apiHandler({
      endpoint: ENDPOINTS.requestList,
      method: 'GET',
      queryParams: {page: 1, pageSize: 'all'},
      authContext: 'RESIDENT',
      useRecaptcha: true,
      onComplete: (resp: any) => {
        if (resp?.status) {
          const requests = resp?.data?.data?.data?.requests;

          setList(requests);
          setLoading(false);
          if (requests?.length > 0) {
            setTimeout(() => {
              const coords = requests
                .map((item: any) => ({
                  latitude: item?.addressCoords?.lat,
                  longitude: item?.addressCoords?.lng,
                }))
                .filter((c: any) => c.latitude && c.longitude);

              // if (coords.length > 0) {
              //   mapViewRef.current?.fitToCoordinates(coords, {
              //     edgePadding: {top: 80, right: 80, bottom: 80, left: 80},
              //     animated: true,
              //   });
              // }
            }, 500);
          }
        } else {
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.error,
              message: resp?.message,
            }),
          );
          setLoading(false);
        }
      },
    });
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insects.top - normalized(Platform.OS == 'ios' ? 15 : 0),
          paddingBottom: insects.bottom,
        },
      ]}>
      <StatusBar
        barStyle={selector?.isDarkTheme ? 'light-content' : 'dark-content'}
      />
      <CustomHeader
        onBackPress={() => props?.navigation?.goBack()}
        text={'Map'}
      />
      {loading ? (
        <View style={styles.loaderCont}>
          <ActivityIndicator size={'large'} color={colors.Primary} />
        </View>
      ) : (
        <View
          style={{
            paddingHorizontal: normalized(20),
            flex: 1,
            paddingTop: normalized(12),
          }}>
          {/* <Text style={[styles.Input_Heading]}>Address*</Text> */}
          <CustomGooglePlacesInput
            apiKey={SECRET_KEYS.GOOGLE_MAP_KEY}
            value={address}
            onChangeText={setAddress}
            countryRestriction={baseData?.countryCode?.toLowerCase()}
            restrictToCity
            allowedCity={baseData?.city}
            country={baseData?.country}
            onPlaceSelected={async (p: PlaceResult) => {
              const coord = {latitude: p.lat, longitude: p.lng};
              centerMap(coord);
              setSelectedCoord(coord);
              await sendChosenLocation(coord, p.address, 'places');
            }}
            onError={err => {
              dispatch(
                setShowToast({
                  type: AppStrings.ToastType.warning,
                  message: err?.message || 'Address search failed',
                }),
              );
            }}
            placeholder="Search address (USA only)"
            debounceMs={300}
            minLength={2}
            maxResults={6}
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
              region={region}
              initialRegion={region}
              initialCamera={{
                center: region,
                zoom: 16,
                heading: 0,
                pitch: 0,
              }}
              customMapStyle={MAP_CUSTOMIZATION}
              minZoomLevel={Platform.OS === 'ios' ? 2 : 3}
              maxZoomLevel={16}
              zoomEnabled
              zoomTapEnabled
              followsUserLocation>
              {Array.isArray(list) &&
                list.map((item: any) => {
                  if (
                    item?.addressCoords?.lat == null ||
                    item?.addressCoords?.lng == null
                  ) {
                    return null;
                  }
                  const isSelected =
                    item.requestId === selectedItem?.requestId ||
                    item.requestId === props?.route?.params?.item?.requestId;

                  return (
                    <IssuePortalPinMarker
                      key={`${item.id}-${isSelected}`}
                      item={item}
                      isSelected={isSelected}
                      onPress={(item: any) => {
                        setSelectedItem(item);
                        setIsShowModal(true);
                      }}
                    />
                  );
                })}
              <CityOfficePin
                coordinate={{
                  latitude: baseData?.addressCoords?.lat,
                  longitude: baseData?.addressCoords?.lng,
                }}
              />
              <RIPSelectedLocation
                coordinate={{
                  longitude: selectedCoord.longitude,
                  latitude: selectedCoord.latitude,
                }}
              />
            </MapView>
            <MapLegend />
          </View>
        </View>
      )}
      <CustomModal
        isVisible={isShowModal}
        onClose={() => setIsShowModal(false)}
        item={selectedItem}
        onPress={(item: any) => {
          setIsShowModal(false);
          setTimeout(() => {
            props?.navigation?.navigate(Routes.RIP.ReqDetail, {item: item});
          }, 750);
        }}
      />
    </View>
  );
};

export default RISMapScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.ScreenBackground,
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
      marginVertical: normalized(12),
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
      justifyContent: 'flex-end',
      marginHorizontal: normalized(20),
      gap: normalized(12),
    },
    loaderCont: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    box: {
      width: '90%',
      paddingVertical: normalized(20),
      borderRadius: normalized(12),
      backgroundColor: colors.Background,
    },
    headingCont: {
      alignItems: 'center',
      marginHorizontal: normalized(20),
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    closeCont: {
      width: normalized(30),
      height: normalized(30),
      alignItems: 'center',
      justifyContent: 'center',
    },
    divider: {
      backgroundColor: colors.Grey_2,
      width: '100%',
      height: normalized(1),
      marginVertical: normalized(12),
      alignSelf: 'center',
    },
  });
