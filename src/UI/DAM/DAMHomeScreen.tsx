import {
  ActivityIndicator,
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  RefreshControl,
  View,
  Animated as RNAnimated,
  Easing,
} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {
  useWebSocket,
  WebSocketProvider,
} from '../../Network/Services/WebSocketProvider';
import {DeviceEventEmitter} from 'react-native';
import {
  AppFonts,
  jobStatusList,
  normalized,
  ScreenProps,
  ScreenSize,
  sortingList,
} from '../../Utils/AppConstants';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppStyles} from '../../Utils/AppStyles';
import {useIsFocused} from '@react-navigation/native';
import MainHeader from '../Components/MainHeader';
import {Routes} from '../../Utils/Routes';
import CustomButton from '../Components/CustomButton';
import ForwardArrowIcon from '../Svg/ForwardArrowIcon';
import CustomInput from '../Components/CustomInput';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS, SOCKET_ENDPOINTS} from '../../Network/Urls';
import {setIsLoader, setShowToast} from '../../Redux/AppReducers';
import {AppStrings, Empty_Screen_Type} from '../../Utils/AppStrings';
import {
  capitalizeEachWord,
  getErrorMessage,
  getStatusColor,
} from '../../Utils/Helper';
import CustomDropDownList from '../Components/CustomDropDownList';
import moment from 'moment';
import ThemeModal from '../Modal/ThemeModal';
import EmptyComp from '../Components/EmptyComp';
import {forceLogout} from '../../Network/Services/ForceLogout';
import {useSessionExpirySocket} from '../../Network/Services/useSessionExpirySocket';
import PermissionDeniedScreen from '../Components/PermissionDenied';
import CustomDrawer from '../Components/CustomDrawer';
import {useDrawer} from '../../Hooks/DrawerAnimation';
import {useFocusRefresh} from '../../Network/Services/FocusRefresh';

const Comp = ({item, onPress}: any) => {
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      style={styles.itemCont}>
      <View style={styles.rowCont}>
        <Text style={styles.nameTxt}>{item?.jobId}</Text>
        <View
          style={[
            styles.statusCont,
            {
              backgroundColor: getStatusColor(item?.status, colors),
            },
          ]}>
          <Text style={styles.statusTxt}>
            {capitalizeEachWord(
              item?.status == 'inProgress' ? 'in progress' : item?.status,
            )}
          </Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Request Name</Text>
          <Text style={styles.valueTxt}>
            {`${item?.requester?.firstName} ${item?.requester?.lastName}`}
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Title</Text>
          <Text style={styles.valueTxt}>{item?.title}</Text>
        </View>
      </View>

      <View style={[styles.row, {gap: normalized(12)}]}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Assignee Type</Text>
          <Text style={styles.valueTxt}>{item?.assigneeType}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Vendor/Designer</Text>
          <Text style={styles.valueTxt}>
            {`${item?.vendor?.firstName} ${item?.vendor?.lastName}`}
          </Text>
        </View>
      </View>

      <View style={styles.item}>
        <Text style={styles.keyTxt}>Created At</Text>
        <Text style={styles.valueTxt}>
          {moment(item?.createdAt).format('LL')}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const DAMHomeScreen = (props: ScreenProps) => {
  return <DAMHomeScreenInner {...props} />;
};

const DAMHomeScreenInner = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector?.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const userData = selector?.damUserData;

  const dispatch = useDispatch();

  const [search, setSearch] = useState('');
  const [requestIdError, setRequestIdError] = useState('');
  const [searchLoader, setSearchLoader] = useState(false);
  const [requestList, setRequestList] = useState<any[]>([]);
  const [requestLoader, setRequestLoader] = useState(false);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [sortIndex, setSortIndex] = useState<any>(null);
  const [statusIndex, setStatusIndex] = useState<any>(null);
  const {getUnreadCount, notifications, markAllAsRead} = useWebSocket('DAM');

  const [isPermissionDenied, setIsPermissionDenied] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const handleForceLogout = () => {
    forceLogout({
      dispatch,
      navigation: props.navigation,
      authContext: 'DAM',
      homeRoute: Routes.Vender.HomeScreen, // or omit, per your DAM nav requirements
    });
  };

  useSessionExpirySocket({
    authContext: 'DAM',
    endpoint: SOCKET_ENDPOINTS.vendorSession,
    label: 'DAM',
    dependencyKey: selector?.damUserData?.id,
    enabled: Boolean(selector?.damUserData?.id),
    onExpired: handleForceLogout,
  });

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(
      'NOTIFICATIONS_MARKED_READ',
      payload => {
        if (payload?.type === 'DAM') {
          markAllAsRead();
        }
      },
    );

    return () => sub.remove();
  }, [markAllAsRead]);

  const getJobsHistory = (
    pageParam = page,
    {isRefresh = false, silent = false} = {},
  ) => {
    if (isRefresh) {
      setRefreshing(true);
    } else if (pageParam === 1 && !silent) {
      setRequestLoader(true);
    }

    apiHandler({
      endpoint: ENDPOINTS.jobsList,
      method: 'GET',
      queryParams: {
        page: pageParam,
        pageSize: 10,
        query: search,
        sort: sortIndex ? sortingList[sortIndex]?.key : '',
      },
      authContext: 'DAM',
      onComplete: (resp: any) => {
        setRequestLoader(false);
        setSearchLoader(false);
        setRefreshing(false);
        if (resp?.status) {
          setTotalItems(resp?.data?.pagination?.totalItems ?? 0);
          const payload = resp?.data?.data;
          const data = Array.isArray(payload?.data) ? payload.data : [];

          if (pageParam === 1) {
            setRequestList(data);
          } else {
            setRequestList(prev => [
              ...prev,
              ...data.filter(
                (it: any) =>
                  !prev.some(
                    (p: any) => (p?.id ?? p?.NO) === (it?.id ?? it?.NO),
                  ),
              ),
            ]);
          }
        } else if (resp?.httpStatus === 403) {
          setIsPermissionDenied(true);
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
  };

  // Pagination
  useEffect(() => {
    if (page === 1) return;
    getJobsHistory(page);
  }, [page]);

  // Filters: sort + status -> loud fetch
  useEffect(() => {
    setPage(1);
    getJobsHistory(1);
  }, [sortIndex, statusIndex]);

  // Mount + refocus
  useFocusRefresh(({silent = false} = {}) => getJobsHistory(1, {silent}), []);

  const onRefresh = () => {
    getJobsHistory(1, {isRefresh: true});
  };

  const onSearch = () => {
    if (search.trim() === '') {
      setRequestIdError('...');
      return;
    }
    setRequestIdError('');
    setSearchLoader(true);
    setPage(1);
    getJobsHistory();
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insects.top - normalized(Platform.OS == 'ios' ? 15 : 0),
          paddingBottom: Platform.OS === 'android' ? insects.bottom : 0,
        },
      ]}>
      <StatusBar
        barStyle={selector?.isDarkTheme ? 'light-content' : 'dark-content'}
      />

      <MainHeader
        onNotiPress={() => {
          props?.navigation?.navigate(Routes.NotificationScreen, {
            type: 'DAM',
            initialNotifications: notifications,
          });
        }}
        onProfilePress={() =>
          props?.navigation?.navigate(Routes.SIR.ProfileScreen, {
            isDamUser: true,
          })
        }
        name={`${userData?.vendorName}`}
        unreadNoti={getUnreadCount()}
        img={userData?.profilePicture ? userData?.profilePicture : null}
      />

      {requestList?.length === 0 && requestLoader ? (
        <View style={styles.loaderCont}>
          <ActivityIndicator color={colors.Primary} size="large" />
        </View>
      ) : isPermissionDenied ? (
        <PermissionDeniedScreen
          message="You don't have permission to view billing for this account."
          onGoBack={() => props?.navigation?.goBack()}
        />
      ) : (
        <FlatList
          data={[1, 2, 3, 4]}
          contentContainerStyle={{paddingHorizontal: normalized(20)}}
          keyExtractor={(_, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.Primary]}
              tintColor={colors.Primary}
            />
          }
          // ListHeaderComponent={() => (
          //     <ClockBlock time={selector?.cdrTime?.logoutTime} />
          // )}
          renderItem={({index}) => (
            <>
              {index === 0 ? (
                <CustomButton
                  text="View Tasks"
                  onPress={() =>
                    props?.navigation?.navigate(Routes.DAM.taskList)
                  }
                  RightIcon={ForwardArrowIcon}
                  loading={false}
                />
              ) : index === 1 ? (
                <>
                  <Text style={styles.trackTxt}>Search Jobs</Text>
                  <View style={{height: normalized(5)}} />
                  <View style={styles.reqCont}>
                    <View style={{flex: 1}}>
                      <CustomInput
                        placeholder="Search Jobs"
                        placeholderColor={colors.Heading_Txt}
                        value={search}
                        setValue={(v: string) => {
                          setRequestIdError('');
                          setSearch(v);
                          if (v === '') {
                            setPage(1);
                            getJobsHistory();
                          }
                        }}
                        errorMsg={requestIdError}
                      />
                    </View>
                    <View
                      style={{
                        width: normalized(75),
                        marginBottom: normalized(3),
                      }}>
                      <CustomButton
                        text="Search"
                        onPress={onSearch}
                        loading={searchLoader}
                        style={{marginTop: 0}}
                      />
                    </View>
                  </View>
                </>
              ) : index == 2 ? (
                <>
                  {/* {!requestLoader && ( */}
                  <View
                    style={[
                      styles.row,
                      {marginTop: normalized(12), gap: normalized(10)},
                    ]}>
                    <View style={{flex: 1}}>
                      <CustomDropDownList
                        list={sortingList.map(o => o.label)}
                        selectedIndex={sortIndex}
                        onChange={i => setSortIndex(i)}
                        placeholder="Sort By"
                        listStyle={styles.dropdownList}
                      />
                    </View>
                    <View style={{flex: 1}}>
                      <CustomDropDownList
                        list={jobStatusList.map(o => o.label)}
                        selectedIndex={statusIndex}
                        onChange={i => setStatusIndex(i)}
                        placeholder="Status"
                        listStyle={styles.dropdownList}
                      />
                    </View>
                  </View>
                  {/* )} */}
                </>
              ) : index === 3 ? (
                <>
                  {/* <Text style={styles.headTxt}>Jobs</Text> */}

                  <FlatList
                    data={requestList}
                    keyExtractor={(item, index) =>
                      String(item?.id ?? item?.NO ?? index)
                    }
                    style={{
                      marginTop: normalized(10),
                      marginBottom: normalized(30),
                      gap: normalized(12),
                    }}
                    showsVerticalScrollIndicator={false}
                    renderItem={({item}: any) => (
                      // <View />
                      <Comp
                        item={item}
                        onPress={() =>
                          props?.navigation?.navigate(Routes.DAM.jobDetail, {
                            item: item,
                          })
                        }
                      />
                    )}
                    ListFooterComponent={() =>
                      requestList.length != totalItems &&
                      requestList.length < totalItems ? (
                        <View
                          style={{
                            height: normalized(20),
                            marginTop: normalized(12),
                          }}>
                          <ActivityIndicator
                            size="large"
                            color={colors.Primary}
                          />
                        </View>
                      ) : (
                        <View style={{height: normalized(10)}} />
                      )
                    }
                    onEndReachedThreshold={0.2}
                    onEndReached={() => {
                      if (!requestLoader && requestList.length < totalItems) {
                        setPage(prev => prev + 1);
                      }
                    }}
                    ListEmptyComponent={() =>
                      !requestLoader ? (
                        <View style={styles.emptyCont}>
                          <EmptyComp
                            type={Empty_Screen_Type.List}
                            subText="No Jobs Found"
                          />
                        </View>
                      ) : null
                    }
                  />
                </>
              ) : null}
            </>
          )}
        />
      )}
    </View>
  );
};

export default DAMHomeScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    btnCont: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: normalized(10),
      marginTop: normalized(12),
    },
    trackTxt: {
      fontSize: normalized(14),
      color: colors.Heading_Txt,
      fontFamily: AppFonts.UbuntuRegular,
      marginTop: normalized(12),
      marginBottom: normalized(3),
    },
    emptyCont: {
      height: ScreenSize.height / 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    reqCont: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(12),
      width: '100%',
      justifyContent: 'center',
    },
    headTxt: {
      fontSize: normalized(18),
      color: colors.Heading_Txt,
      fontFamily: AppFonts.UbuntuBold,
      marginTop: normalized(5),
    },
    loaderCont: {
      flex: 1,
      minHeight: ScreenSize.height / 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dropdownList: {
      position: 'absolute',
      zIndex: 99,
      top: normalized(45),
      width: '100%',
    },
  });
