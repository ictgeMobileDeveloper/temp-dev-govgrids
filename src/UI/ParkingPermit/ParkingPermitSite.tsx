import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  Easing,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import MapView, {
  Marker,
  Polygon,
  PROVIDER_GOOGLE,
  Region,
} from 'react-native-maps';
import {useDispatch, useSelector} from 'react-redux';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {
  AppFonts,
  MAP_CUSTOMIZATION,
  normalized,
  Parking_Site_SwitcherList,
  Parking_Site_Type_List,
  ScreenProps,
} from '../../Utils/AppConstants';
import {ENDPOINTS} from '../../Network/Urls';
import CustomHeader from '../Components/CustomHeader';
import CurrentLocationIcon from '../Svg/LiveLocation';
import CustomGooglePlacesInput, {
  PlaceResult,
} from '../Components/CustomGooglePlacesInput';
import {SECRET_KEYS} from '../../Network/Urls';
import {
  parseCityPolygon,
  useLocationServices,
  useBoundedMapRegion,
  regionToBounds,
  type MapBounds,
} from '../../Utils/useLocationServices';
import ParkingSiteCard from './Components/ParkingPermitComp';
import CustomSwitcher from '../Components/CustomSwitcher';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {setShowToast} from '../../Redux/AppReducers';
import {AppStrings, Empty_Screen_Type} from '../../Utils/AppStrings';
import {getErrorMessage} from '../../Utils/Helper';
import ClockIcon from '../Svg/ClockIcon';
import {Routes} from '../../Utils/Routes';
import EmptyComp from '../Components/EmptyComp';
import ActiveSessionCard from './Components/ActiveSessionCard';
import MarkerPin from '../Svg/Dummy';
import CityOfficePin from '../Svg/CityOfficePin';
import {useIsFocused} from '@react-navigation/native';

type ParkingSite = {
  id: number | string;
  buildingName?: string;
  buildingAddress?: string;
  buildingAddressCoords?: string;
  siteImageURL?: string;
  zoneRequired?: boolean;
  zones?: any[];
  [key: string]: any;
};

const DEFAULT_DELTA = 0.08;
const BOUNDS_DEBOUNCE_MS = 500;

const parseSiteCoords = (
  raw: string | undefined,
): {lat: number; lng: number} | null => {
  if (!raw) return null;
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

const ParkingSitesScreen = (props: ScreenProps) => {
  const insets = useSafeAreaInsets();
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );

  const selector: any = useSelector(
    (state: AppRootStore) => state.SliceReducer,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  const baseData = useSelector(
    (state: AppRootStore) => state.SliceReducer.baseData || {},
  );

  const userData = selector?.residentUserData;
  const dispatch = useDispatch();

  const polygonCoords = useMemo(
    () => parseCityPolygon(baseData?.cityAreaPolygon),
    [baseData?.cityAreaPolygon],
  );

  const isFocused = useIsFocused();
  const isFocusedRef = useRef(isFocused);
  isFocusedRef.current = isFocused;

  const [sitelistIndex, setSitelistIndex] = useState(1);
  // const [currentSessions, setCurrentSessions] = useState<any[]>([]);

  const typelistIndex = props?.route?.params?.type;

  const [sites, setSites] = useState<ParkingSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState<ParkingSite | null>(null);
  const mapRef = useRef<MapView>(null);
  const cardAnim = useRef(new Animated.Value(0)).current;
  const [mapReady, setMapReady] = useState(false);
  const residentUserData = useSelector(
    (state: AppRootStore) => state.SliceReducer.residentUserData,
  );

  const authSessions = useSelector(
    (state: AppRootStore) => state.SliceReducer.activeParkingSessions ?? [],
  );
  const guestSessions = useSelector(
    (state: AppRootStore) => state.SliceReducer.guestParkingSessions ?? [],
  );
  const isMapView = sitelistIndex == 1;
  const currentCategory: 'PAYG' | 'CONTRACT' =
    typelistIndex === 0 ? 'CONTRACT' : 'PAYG';

  const initialRegion = useMemo<Region>(
    () => ({
      latitude: baseData?.addressCoords?.lat ?? 41.66,
      longitude: baseData?.addressCoords?.lng ?? -72.78,
      latitudeDelta: DEFAULT_DELTA,
      longitudeDelta: DEFAULT_DELTA,
    }),
    [baseData?.addressCoords?.lat, baseData?.addressCoords?.lng],
  );

  const {
    ensureLocationPermission,
    ensureLocationServicesEnabled,
    getCurrentLocation,
  } = useLocationServices(() => {});

  const {region, onRegionChangeComplete: boundedOnRegionChangeComplete} =
    useBoundedMapRegion(mapRef, polygonCoords, initialRegion);

  const getParkingList = useCallback(
    (bounds?: MapBounds) => {
      setLoading(true);
      apiHandler({
        endpoint: ENDPOINTS.parkingSiteList,
        method: 'GET',
        authContext: 'RESIDENT',
        queryParams: bounds,
        useRecaptcha: true,
        onComplete: (resp: any) => {
          setLoading(false);
          if (!isFocusedRef.current) return;
          if (resp?.status) {
            setSites(resp?.data?.data ?? []);
          } else {
            dispatch(
              setShowToast({
                type: AppStrings.ToastType.error,
                message: getErrorMessage(resp),
              }),
            );
          }
        },
      });
    },
    [dispatch],
  );

  const boundsDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onRegionChangeComplete = useCallback(
    (nextRegion: Region) => {
      boundedOnRegionChangeComplete(nextRegion);

      if (boundsDebounceRef.current) {
        clearTimeout(boundsDebounceRef.current);
      }

      boundsDebounceRef.current = setTimeout(() => {
        if (!isFocusedRef.current) return;
        getParkingList(regionToBounds(nextRegion));
      }, BOUNDS_DEBOUNCE_MS);
    },
    [boundedOnRegionChangeComplete, getParkingList],
  );

  useEffect(
    () => () => {
      if (boundsDebounceRef.current) clearTimeout(boundsDebounceRef.current);
    },
    [],
  );

  useEffect(() => {
    getParkingList(regionToBounds(initialRegion));
    // getSessions();
  }, []);

  // ---- Marker press / card animation ----------------------------------
  const showCard = useCallback(
    (site: ParkingSite) => {
      setSelectedSite(site);
      const coords = parseSiteCoords(site.buildingAddressCoords);
      if (coords) {
        mapRef.current?.animateToRegion(
          {
            latitude: coords.lat,
            longitude: coords.lng,
            latitudeDelta: DEFAULT_DELTA,
            longitudeDelta: DEFAULT_DELTA,
          },
          300,
        );
      }
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    },
    [cardAnim],
  );

  // const getSessions = () => {
  //   apiHandler({
  //     endpoint: ENDPOINTS.allParkingSession,
  //     method: 'GET',
  //     queryParams: {
  //       page: 1,
  //       pageSize: 10,
  //     },
  //     authContext: 'RESIDENT',
  //     onComplete: (resp: any) => {
  //       if (!resp?.status) return;

  //       const activeSessions = (resp?.data?.data?.data ?? []).filter(
  //         (session: any) => session?.status?.toLowerCase() === 'active',
  //       );

  //       setCurrentSessions(activeSessions);
  //     },
  //   });
  // };

  const allActiveSessions = useMemo(() => {
    const now = Date.now();
    const merged = new Map();

    console.log(guestSessions, authSessions, 'all sessions');

    [...guestSessions, ...authSessions]
      .filter((s: any) => s && s.sessionId)
      .forEach((s: any) => merged.set(s.sessionId, s));

    return Array.from(merged.values())
      .filter((s: any) => {
        const end = new Date(s.endTime).getTime();
        return !isNaN(end) && end > now;
      })
      .sort(
        (a: any, b: any) =>
          new Date(a.endTime).getTime() - new Date(b.endTime).getTime(),
      );
  }, [authSessions, guestSessions]);

  const hideCard = useCallback(() => {
    Animated.timing(cardAnim, {
      toValue: 0,
      duration: 180,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => setSelectedSite(null));
  }, [cardAnim]);

  const onPressLiveLocation = useCallback(async () => {
    const granted = await ensureLocationPermission();
    if (!granted) return;
    const enabled = await ensureLocationServicesEnabled();
    if (!enabled) return;
    try {
      const coord = await getCurrentLocation();
      mapRef.current?.animateToRegion(
        {
          latitude: coord.latitude,
          longitude: coord.longitude,
          latitudeDelta: DEFAULT_DELTA,
          longitudeDelta: DEFAULT_DELTA,
        },
        300,
      );
    } catch (err) {
      console.warn('Could not fetch current location', err);
    }
  }, [
    ensureLocationPermission,
    ensureLocationServicesEnabled,
    getCurrentLocation,
  ]);

  const cardTranslateY = cardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [normalized(160), 0],
  });

  const zoneMatchesCategory = (zone: any, category: 'PAYG' | 'CONTRACT') =>
    category === 'CONTRACT'
      ? zone?.allowsReserveParkingPermit === true
      : zone?.allowOnDemandPermit === true;

  const filteredSites = useMemo<ParkingSite[]>(() => {
    return sites
      .map(site => ({
        ...site,
        zones: (site?.zones ?? []).filter(zone =>
          zoneMatchesCategory(zone, currentCategory),
        ),
      }))
      .filter(
        site => !(site?.zoneRequired === true && site.zones.length === 0),
      );
  }, [sites, currentCategory]);
  // ---- Render helpers ---------------------------------------------------
  const renderMap = () => (
    <View style={{flex: 1}}>
      <CustomGooglePlacesInput
        apiKey={SECRET_KEYS.GOOGLE_MAP_KEY}
        value={''}
        countryRestriction={baseData?.countryCode?.toLowerCase()}
        country={baseData?.country}
        allowedCity={baseData?.city}
        restrictToCity
        onPlaceSelected={(p: PlaceResult) => {
          mapRef.current?.animateToRegion(
            {
              latitude: p.lat,
              longitude: p.lng,
              latitudeDelta: DEFAULT_DELTA,
              longitudeDelta: DEFAULT_DELTA,
            },
            300,
          );
        }}
        placeholder="Search for location"
        debounceMs={800}
        minLength={2}
        maxResults={6}
      />
      <View style={{height: normalized(10)}} />

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        customMapStyle={MAP_CUSTOMIZATION}
        showsBuildings={false}
        initialRegion={initialRegion}
        onRegionChangeComplete={onRegionChangeComplete}
        onMapReady={() => setMapReady(true)}>
        {/* {filteredSites.map(site => {
          const coords = parseSiteCoords(site.buildingAddressCoords);
          if (!coords) return null;
          const isActive = selectedSite?.id === site.id;
          return (
            <Marker
              key={site.id}
              coordinate={{latitude: coords.lat, longitude: coords.lng}}
         
              onPress={e => {
                e.stopPropagation();
                showCard(site);
              }}>
              <View
                style={[
                  styles.markerPin,
                  isActive && {
                    backgroundColor: colors.SecondaryDark || '#0F3D2E',
                  },
                ]}>
                {typelistIndex === 0 ? (
                  <Text style={styles.markerPinTxt}>P</Text>
                ) : (
                  <Image
                    source={require('./../../assets/images/timer.png')}
                    width={5}
                    height={5}
                  />
                )}
              </View>
            </Marker>
          );
        })} */}
        {filteredSites.map(site => (
          <MarkerPin
            key={site.id}
            site={site}
            isActive={selectedSite?.id === site.id}
            isPermit={typelistIndex === 0}
            colors={colors}
            onPress={showCard}
          />
        ))}
        {mapReady && baseData?.addressCoords?.lat != null && (
          <CityOfficePin
            coordinate={{
              latitude: baseData?.addressCoords?.lat,
              longitude: baseData?.addressCoords?.lng,
            }}
          />
        )}
        {isFocused && polygonCoords.length >= 3 && (
          <Polygon
            coordinates={polygonCoords}
            strokeWidth={3}
            strokeColor={colors?.Primary}
            fillColor={'rgba(0, 0, 0, 0.06)'}
            zIndex={2}
          />
        )}
      </MapView>

      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.liveLocationBtn}
        onPress={onPressLiveLocation}>
        <CurrentLocationIcon size={22} color={colors.Primary} />
      </TouchableOpacity>
      <Modal
        visible={!!selectedSite}
        transparent
        animationType="none"
        onRequestClose={hideCard}>
        <Pressable style={styles.sheetBackdrop} onPress={hideCard} />
        <Animated.View
          style={[
            styles.sheetWrap,
            {transform: [{translateY: cardTranslateY}]},
          ]}
          pointerEvents="box-none">
          {selectedSite && (
            <ParkingSiteCard
              item={selectedSite}
              variant="sheet"
              btnTxt={typelistIndex === 0 ? 'Apply for Permit' : 'Book Parking'}
              onClose={hideCard}
              chipPress={zone => {
                hideCard();
                if (residentUserData || typelistIndex === 1) {
                  props?.navigation?.navigate(
                    Routes.ParkingPermit.RequestSubmit,
                    {
                      site: selectedSite,
                      zone: zone,
                      category: currentCategory,
                    },
                  );
                } else {
                  props?.navigation?.navigate(Routes.Auth.Login, {
                    route: Routes.ParkingPermit.RequestSubmit,
                  });
                }
              }}
              onApplyPermit={() => {
                hideCard();
                if (residentUserData || typelistIndex === 1) {
                  props?.navigation?.navigate(
                    Routes.ParkingPermit.RequestSubmit,
                    {
                      site: selectedSite,
                      category: currentCategory,
                    },
                  );
                } else {
                  props?.navigation?.navigate(Routes.Auth.Login, {
                    route: Routes.ParkingPermit.RequestSubmit,
                  });
                }
              }}
            />
          )}
        </Animated.View>
      </Modal>
    </View>
  );

  const renderList = () => (
    <FlatList
      data={filteredSites}
      keyExtractor={item => String(item.id)}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: normalized(24),
      }}
      renderItem={({item}) => (
        <ParkingSiteCard
          item={item}
          variant="list"
          btnTxt={typelistIndex === 0 ? 'Apply for Permit' : 'Book Parking'}
          chipPress={zone => {
            if (residentUserData || typelistIndex === 1) {
              props?.navigation?.navigate(Routes.ParkingPermit.RequestSubmit, {
                site: item,
                zone: zone,
                category: currentCategory,
              });
            } else {
              props?.navigation?.navigate(Routes.Auth.Login, {
                route: Routes.ParkingPermit.RequestSubmit,
              });
            }
          }}
          onApplyPermit={() => {
            if (residentUserData || typelistIndex === 1) {
              props?.navigation?.navigate(Routes.ParkingPermit.RequestSubmit, {
                site: item,
                category: currentCategory,
              });
            } else {
              props?.navigation?.navigate(Routes.Auth.Login, {
                route: Routes.ParkingPermit.RequestSubmit,
              });
            }
          }}
        />
      )}
      ListEmptyComponent={() =>
        !loading ? (
          <View style={styles.loaderCont}>
            <EmptyComp
              type={Empty_Screen_Type.List}
              subText="No Parking Found"
            />
          </View>
        ) : null
      }
    />
  );

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top - normalized(Platform.OS === 'ios' ? 15 : 0),
          paddingBottom: Platform.OS === 'android' ? insets.bottom : 0,
        },
      ]}>
      <StatusBar
        // translucent
        // backgroundColor="transparent"
        barStyle={selector?.isDarkTheme ? 'light-content' : 'dark-content'}
      />
      <CustomHeader
        onBackPress={() => props?.navigation?.goBack()}
        text="Parking Sites"
        desc="View all parking sites across the city."
      />

      <View style={styles.body}>
        {typelistIndex === 1 && allActiveSessions.length > 0 && (
          <ActiveSessionCard sessions={allActiveSessions} />
        )}
        <CustomSwitcher
          list={Parking_Site_SwitcherList}
          selectedIndex={sitelistIndex}
          onChange={i => setSitelistIndex(i)}
        />

        <View style={{flex: 1}}>{isMapView ? renderMap() : renderList()}</View>
      </View>
    </View>
  );
};

export default ParkingSitesScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    body: {
      flex: 1,
      paddingHorizontal: normalized(20),
    },
    subTitle: {
      marginTop: normalized(4),
      color: colors.Desc_Txt,
      fontSize: normalized(13),
      fontFamily: AppFonts.UbuntuRegular,
    },
    mapCont: {
      marginTop: normalized(12),
      borderRadius: normalized(12),
      overflow: 'hidden',
      flex: 1,
      zIndex: 1,
    },
    map: {
      flex: 1,
      borderRadius: normalized(10),
      backgroundColor: '#000',
      overflow: 'hidden',
      zIndex: 1,
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
    markerPin: {
      width: normalized(30),
      height: normalized(30),
      borderRadius: normalized(8),
      backgroundColor: colors.Primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.White,
    },
    markerPinTxt: {
      color: colors.White,
      fontFamily: AppFonts.UbuntuBold,
      fontSize: normalized(14),
    },
    mapCardWrap: {
      position: 'absolute',
      left: normalized(12),
      right: normalized(12),
      bottom: normalized(12),
    },

    sheetBackdrop: {
      ...StyleSheet.absoluteFill,
      backgroundColor: 'rgba(0,0,0,0.35)',
    },
    sheetWrap: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
    },
  });
