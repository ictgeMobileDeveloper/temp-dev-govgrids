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
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import CustomDrawer from '../Components/CustomDrawer';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import CustomHeader from '../Components/CustomHeader';
import {
  AppColors,
  AppFonts,
  CartRentalStatusList,
  City_Cart_Rental_Payment_List,
  normalized,
  ScreenProps,
  ScreenSize,
  sortingList,
} from '../../Utils/AppConstants';
import CustomButton from '../Components/CustomButton';
import {Routes} from '../../Utils/Routes';
import ForwardArrowIcon from '../Svg/ForwardArrowIcon';
import {ENDPOINTS} from '../../Network/Urls';
import {useIsFocused} from '@react-navigation/native';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {setShowToast} from '../../Redux/AppReducers';
import {AppStrings, Empty_Screen_Type} from '../../Utils/AppStrings';
import {
  capitalizeEachWord,
  formatAmountToUSD,
  getErrorMessage,
  getStatusColor,
} from '../../Utils/Helper';
import moment from 'moment';
import CustomInput from '../Components/CustomInput';
import CustomDropDownList from '../Components/CustomDropDownList';
import EmptyComp from '../Components/EmptyComp';
import LinearGradient from 'react-native-linear-gradient';
import SideFilterIcon from '../Svg/SideFilterIcon';
import ReturnDamangeComp from '../Components/CartRentalReturn';
import {useDrawer} from '../../Hooks/DrawerAnimation';
import {useFocusRefresh} from '../../Network/Services/FocusRefresh';

const Comp = (props: any) => {
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const item = props?.item;

  const paymentStatus = item?.paidForCurrentBillingCycle ? 'Paid' : 'Unpaid';

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={props?.onPress}
      style={styles.itemCont}>
      <View style={styles.rowCont}>
        <Text style={styles.nameTxt}>{item?.requestId}</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Billing Cycle</Text>
          <Text style={styles.valueTxt}>{`${item?.billingCycle?.name}`}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Category</Text>
          <Text style={styles.valueTxt}>{item?.category?.propertyType}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Property Ownwer</Text>
          {(item?.propertyOwner?.firstName ||
            item?.propertyOwner?.lastName) && (
            <Text style={styles.valueTxt}>
              {[item?.propertyOwner?.firstName, item?.propertyOwner?.lastName]
                .filter(Boolean)
                .join(' ')}
            </Text>
          )}
        </View>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Billing Address</Text>
          <Text style={styles.valueTxt}>{item?.billingAddress?.address}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Created At</Text>
          <Text style={styles.valueTxt}>
            {moment(item?.createdAt).format('LL')}
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Status</Text>
          <View
            style={[
              styles.statusCont,
              {
                backgroundColor: getStatusColor(item?.status, colors),
                alignSelf: 'flex-start',
              },
            ]}>
            <Text style={styles.statusTxt}>
              {capitalizeEachWord(item?.status)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.item}>
        <Text style={styles.keyTxt}>Payment Status</Text>
        <View
          style={[
            styles.statusCont,
            {
              backgroundColor: getStatusColor(paymentStatus, colors),
              alignSelf: 'flex-start',
            },
          ]}>
          <Text style={styles.statusTxt}>
            {capitalizeEachWord(paymentStatus)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const CartRentalHomeScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [requestId, setRequestId] = useState('');
  const [debouncedRequestId, setDebouncedRequestId] = useState('');
  const [requestIdError, setRequestIdError] = useState('');
  const [searchLoader, setSearchLoader] = useState(false);
  const [requestList, setRequestList] = useState<any[]>([]);
  const [requestLoader, setRequestLoader] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sortIndex, setSortIndex] = useState<any>(null);
  const userData = selector?.CDRUserData;
  const isManualRefreshRef = useRef(false);
  const reference = props?.route?.params?.navigation;
  const {isDrawerOpen, drawerAnim, overlayAnim, openDrawer, closeDrawer} =
    useDrawer();
  const [queryParams, setQueryparams] = useState({});

  const dispatch = useDispatch();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedRequestId(requestId);
      setPage(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [requestId]);

  // useEffect(() => {
  //   getReqHistory();
  // }, [page, debouncedRequestId, sortIndex, queryParams, reference]);

  const getEndpoint = () => {
    switch (reference) {
      case 'CartDamage':
        return ENDPOINTS.cartDamageClaimList;
      case 'CartReturn':
        return ENDPOINTS.cartReturnRequestList;
      default:
        return ENDPOINTS.cityCartReqs;
    }
  };
  const getReqHistory = ({silent = false} = {}) => {
    const isManualRefresh = isManualRefreshRef.current;
    if (page === 1 && !isManualRefresh && !silent) setRequestLoader(true);
    apiHandler({
      endpoint: getEndpoint(),
      method: 'GET',
      queryParams: {
        page,
        pageSize: 10,
        query: debouncedRequestId,
        sort: sortingList[sortIndex]?.key ? sortingList[sortIndex]?.key : '',
        ...queryParams,
      },
      authContext: 'RESIDENT',
      onComplete: (resp: any) => {
        isManualRefreshRef.current = false;
        setRefreshing(false);
        if (resp?.status) {
          setRequestLoader(false);
          setSearchLoader(false);
          setTotalItems(resp?.data?.pagination?.totalItems ?? 0);
          const data = resp?.data?.data;
          if (page === 1) {
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
        } else {
          setRequestLoader(false);
          setSearchLoader(false);
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
  useFocusRefresh(getReqHistory, [
    page,
    debouncedRequestId,
    sortIndex,
    queryParams,
    reference,
  ]);
  const onRefresh = () => {
    isManualRefreshRef.current = true;
    setRefreshing(true);
    if (page !== 1) {
      setPage(1);
      return;
    }
    getReqHistory();
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
      <CustomHeader
        onBackPress={() => props?.navigation?.goBack()}
        text={
          reference === 'CartDamage'
            ? 'Damage Claims'
            : reference === 'CartReturn'
            ? 'Return Requests'
            : 'City Cart Rental Requests'
        }
      />

      <FlatList
        data={[1, 2, 3]}
        contentContainerStyle={{paddingHorizontal: normalized(20)}}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.Primary}
            colors={[colors.Primary]}
          />
        }
        renderItem={({item, index}) => (
          <>
            {index === 0 ? (
              <View
                style={[
                  styles.row,
                  {marginTop: normalized(12), gap: normalized(10)},
                ]}>
                <View style={{flex: 1}}>
                  <CustomInput
                    placeholder="Search Request ID"
                    placeholderColor={colors.Heading_Txt}
                    value={requestId}
                    setValue={(v: string) => {
                      setRequestIdError('');
                      setRequestId(v);
                      if (v === '') {
                        setPage(1);
                      }
                    }}
                    errorMsg={requestIdError}
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
            ) : (
              index == 1 && (
                <>
                  {requestList?.length === 0 && requestLoader ? (
                    <View style={styles.loaderCont}>
                      <ActivityIndicator color={colors.Primary} size="large" />
                    </View>
                  ) : (
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
                      renderItem={({item}) =>
                        reference === 'CartRequest' ? (
                          <Comp
                            item={item}
                            onPress={() =>
                              props?.navigation?.navigate(
                                Routes.CartRental.DetailScreen,
                                {id: item?.id},
                              )
                            }
                          />
                        ) : (
                          <ReturnDamangeComp
                            item={item}
                            reference={reference}
                            onPress={() =>
                              props?.navigation?.navigate(
                                Routes.CartRental.ReportDetails,
                                {item: item, navigation: reference},
                              )
                            }
                          />
                        )
                      }
                      ListEmptyComponent={() =>
                        !requestLoader ? (
                          <View style={styles.emptyCont}>
                            <EmptyComp
                              type={Empty_Screen_Type.List}
                              subText="No Request Found"
                            />
                          </View>
                        ) : null
                      }
                      ListFooterComponent={() =>
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
                    />
                  )}
                </>
              )
            )}
          </>
        )}
      />
      <CustomDrawer
        isVisible={isDrawerOpen}
        drawerAnim={drawerAnim}
        statusList={CartRentalStatusList}
        overlayAnim={overlayAnim}
        paymentStatusParamKey="paymentStatus"
        hideSearchBar={true}
        paymentStatusList={City_Cart_Rental_Payment_List}
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

export default CartRentalHomeScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    itemCont: {
      width: '100%',
      borderWidth: 1,
      borderRadius: normalized(8),
      borderColor: colors.BorderColor,
      padding: normalized(12),
      gap: normalized(8),
    },
    trackTxt: {
      fontSize: normalized(14),
      color: colors.Heading_Txt,
      fontFamily: AppFonts.UbuntuRegular,
      marginTop: normalized(12),
      marginBottom: normalized(3),
    },
    reqCont: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(12),
      width: '100%',
      justifyContent: 'center',
      marginTop: normalized(12),
    },
    loaderCont: {
      flex: 1,
      minHeight: ScreenSize.height / 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    trashDayCont: {
      flexDirection: 'row',
      gap: normalized(8),
      flexWrap: 'wrap',
    },
    trashTxt: {
      backgroundColor: AppColors.Grey_bg,
      fontFamily: AppFonts.UbuntuRegular,
      color: AppColors.Black,
      borderRadius: normalized(100),
      paddingHorizontal: normalized(10),
      paddingVertical: normalized(4),
    },
    dropdownList: {
      position: 'absolute',
      zIndex: 99,
      top: normalized(45),
      width: '100%',
    },
    emptyCont: {
      height: ScreenSize.height / 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
