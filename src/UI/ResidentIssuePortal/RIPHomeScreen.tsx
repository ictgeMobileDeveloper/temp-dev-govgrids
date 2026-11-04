import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated as RNAnimated,
  Easing,
} from 'react-native';
import CustomDrawer from '../Components/CustomDrawer';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {
  AppFonts,
  normalized,
  ResidentIssuePortal_StatusList,
  ScreenProps,
  ScreenSize,
  sortingList,
} from '../../Utils/AppConstants';
import CustomButton from '../Components/CustomButton';
import {Routes} from '../../Utils/Routes';
import ForwardArrowIcon from '../Svg/ForwardArrowIcon';
import RIPComp from '../Components/RIPComp';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../Network/Urls';
import {setShowToast} from '../../Redux/AppReducers';
import {AppStrings, Empty_Screen_Type} from '../../Utils/AppStrings';
import CustomInput from '../Components/CustomInput';
import CustomDropDownList from '../Components/CustomDropDownList';
import {useIsFocused} from '@react-navigation/native';
import MapIcon from '../Svg/MapIcon';
import BackArrowIcon from '../Svg/BackArrowIcon';
import LinearGradient from 'react-native-linear-gradient';
import OfflineIcon from '../Svg/OfflineIcon';
import {getErrorMessage} from '../../Utils/Helper';
import EmptyComp from '../Components/EmptyComp';
import SideFilterIcon from '../Svg/SideFilterIcon';
import {useDrawer} from '../../Hooks/DrawerAnimation';
import {useFocusRefresh} from '../../Network/Services/FocusRefresh';
import CustomHeader from '../Components/CustomHeader';

const RIPHomeScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const userData = selector?.residentUserData;
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState('10');
  const [list, setList] = useState<any>([]);
  const [search, setSearch] = useState('');
  const [totalItems, setTotalItems] = useState<any>('');
  const [sortIndex, setSortIndex] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [queryParams, setQueryparams] = useState({});
  const {isDrawerOpen, drawerAnim, overlayAnim, openDrawer, closeDrawer} =
    useDrawer();

  // useEffect(() => {
  //   if (!isFocused) {
  //     return;
  //   }

  //   fetchReq();
  // }, [page, isFocused, search, queryParams]);

  const fetchReq = ({silent = false} = {}) => {
    if (!silent && page == 1) setIsLoading(true);

    apiHandler({
      endpoint: ENDPOINTS.requestList,
      method: 'GET',
      requiresAuth: true,
      useRecaptcha: true,
      queryParams: {
        page,
        pageSize: 10,
        query: search,
        sort: sortingList[sortIndex]?.key ?? '',
        ...queryParams,
      },
      authContext: 'RESIDENT',
      onComplete: (resp: any) => {
        setRefreshing(false);
        if (resp?.status) {
          setTotalItems(resp?.data?.pagination?.totalItems);
          if (page == 1) {
            setList(resp?.data?.data?.data?.requests || []);
          } else {
            setList((prevList: any) => [
              ...prevList,
              ...resp?.data?.data?.data?.requests?.filter(
                (item: any) => !prevList.some((p: any) => p.id == item.id),
              ),
            ]);
          }
          setIsLoading(false);
        } else {
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.error,
              message: getErrorMessage(resp),
            }),
          );
          setIsLoading(false);
        }
      },
    });
  };

  useFocusRefresh(fetchReq, [page, search, queryParams]);
  const onRefresh = () => {
    setRefreshing(true);
    if (page !== 1) {
      setPage(1);
      return;
    }
    fetchReq();
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insects.top - normalized(Platform.OS == 'ios' ? 15 : 0),
          paddingBottom: Platform.OS == 'android' ? insects.bottom : 0,
        },
      ]}>
      <StatusBar
        barStyle={selector?.isDarkTheme ? 'light-content' : 'dark-content'}
      />

      <View style={styles.headerCont}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => props?.navigation?.goBack()}>
          <BackArrowIcon
            primary={selector?.isDarkTheme ? colors.Desc_Txt : '#2E2F30'}
          />
        </TouchableOpacity>

        <Text style={styles.txt}>Resident Issue Portal</Text>
        <TouchableOpacity
          style={styles.mapIconCont}
          activeOpacity={1}
          onPress={() => props?.navigation?.navigate(Routes.RIP.MapScreen)}>
          <MapIcon />
        </TouchableOpacity>
      </View>
      {/* <CustomHeader
        text="Resident Issue Portal"
        onBackPress={() => props?.navigation?.goBack()}
        RightIcon={<MapIcon />}
        onRightIconPress={() =>
          props?.navigation?.navigate(Routes.RIP.MapScreen)
        }
      /> */}
      <View style={{paddingHorizontal: normalized(20)}}>
        <CustomButton
          text={'Submit New Request'}
          onPress={() => {
            props?.navigation?.navigate(Routes.RIP.SubmitReqScreen);
          }}
          RightIcon={ForwardArrowIcon}
          loading={false}
        />

        <View
          style={[
            styles.row,
            {marginTop: normalized(12), gap: normalized(10)},
          ]}>
          <View style={{flex: 1}}>
            <CustomInput
              value={search}
              setValue={setSearch}
              placeholder={'Search'}
              placeholderColor={colors.Heading_Txt}
              style={{height: normalized(45)}}
            />
          </View>
          <LinearGradient
            colors={[colors.Primary, colors.Secondary]}
            style={styles.sidePanelCont}>
            <TouchableOpacity activeOpacity={1} onPress={openDrawer}>
              <SideFilterIcon />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {list.length === 0 && isLoading ? (
          <View style={styles.loaderCont}>
            <ActivityIndicator color={colors.Primary} size="large" />
          </View>
        ) : (
          <FlatList
            data={list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.Primary}
                colors={[colors.Primary]}
              />
            }
            contentContainerStyle={{
              gap: normalized(10),
              marginTop: normalized(12),
            }}
            onEndReached={() => {
              if (!isLoading && list.length < totalItems) {
                setPage(prevPage => prevPage + 1);
              }
            }}
            renderItem={({item, index}) => (
              <RIPComp
                item={item}
                onView={() => {
                  props?.navigation?.navigate(Routes.RIP.ReqDetail, {
                    item: item,
                  });
                }}
                onMapPress={() =>
                  props?.navigation?.navigate(Routes.RIP.MapScreen, {
                    item: item,
                  })
                }
              />
            )}
            ListEmptyComponent={() => {
              if (isLoading) {
                return null;
              }

              return (
                <View style={styles.loaderCont}>
                  <EmptyComp
                    type={Empty_Screen_Type.List}
                    subText="No Request Found"
                  />
                </View>
              );
            }}
            ListFooterComponent={() =>
              list?.length < totalItems ? (
                <View
                  style={{height: normalized(250), marginTop: normalized(12)}}>
                  <ActivityIndicator size={'large'} color={colors.Primary} />
                </View>
              ) : (
                <View style={{height: normalized(180)}} />
              )
            }
          />
        )}
      </View>
      <CustomDrawer
        isVisible={isDrawerOpen}
        drawerAnim={drawerAnim}
        statusList={ResidentIssuePortal_StatusList}
        overlayAnim={overlayAnim}
        hideSearchBar={true}
        hidePaymentStatus={true}
        isResidentIssuePortal={true}
        onClose={closeDrawer}
        topOffset={insects.top + normalized(Platform.OS == 'ios' ? 36 : 52)}
        closeDrawer={closeDrawer}
        onApply={(queryString: any, params: any) => {
          setQueryparams(params);
          setPage(1);
        }}
      />
    </View>
  );
};

export default RIPHomeScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    dropdownList: {
      position: 'absolute',
      zIndex: 99,
      top: normalized(45),
      width: '100%',
    },
    loaderCont: {
      minHeight: ScreenSize.height / 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerCont: {
      width: '100%',
      height: normalized(52),
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: normalized(10),
      flexDirection: 'row',
      paddingHorizontal: normalized(20),
      borderWidth: 1,
      borderTopColor: 'transparent',
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderBottomColor: colors.BorderColor,
    },
    txt: {
      fontFamily: AppFonts.UbuntuSemiBold,
      fontSize: normalized(20),
      color: colors.Heading_Txt,
      flex: 1,
    },
    mapIconCont: {
      width: normalized(24),
      height: normalized(24),
      borderRadius: normalized(4),
      backgroundColor: colors.Primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headTxt: {
      fontSize: normalized(18),
      color: colors.Heading_Txt,
      fontFamily: AppFonts.UbuntuBold,
      marginTop: normalized(5),
    },
  });
