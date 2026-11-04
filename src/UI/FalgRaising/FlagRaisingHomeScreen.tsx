import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
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
import {
  AppColors,
  FlagRaisingStatusList,
  normalized,
  ScreenProps,
  ScreenSize,
  sortingList,
} from '../../Utils/AppConstants';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import CustomHeader from '../Components/CustomHeader';
import CustomButton from '../Components/CustomButton';
import ForwardArrowIcon from '../Svg/ForwardArrowIcon';
import {Routes} from '../../Utils/Routes';
import CustomInput from '../Components/CustomInput';
import CustomDropDownList from '../Components/CustomDropDownList';
import {useIsFocused} from '@react-navigation/native';
import moment from 'moment';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../Network/Urls';
import {setShowToast} from '../../Redux/AppReducers';
import {AppStrings, Empty_Screen_Type} from '../../Utils/AppStrings';
import {capitalizeEachWord, getErrorMessage} from '../../Utils/Helper';
import EmptyComp from '../Components/EmptyComp';
import LinearGradient from 'react-native-linear-gradient';
import SideFilterIcon from '../Svg/SideFilterIcon';
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
        <Text style={styles.nameTxt}>{item?.requestId}</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Requester Name</Text>
          <Text style={styles.valueTxt}>
            {`${item?.firstName} ${item?.lastName}`}
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Flag Being Raised</Text>
          <Text style={styles.valueTxt}>{item?.flagBeingRaised}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Date of Raising</Text>
          <Text style={styles.valueTxt}>
            {moment(item?.desiredDateOfRaising).format('LL')}
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Expected Attendes</Text>
          <Text style={styles.valueTxt}>{item?.numberOfAttendeesExpected}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Submission On</Text>
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
                backgroundColor:
                  item?.status == 'pending'
                    ? colors.ToastColors.Alarm
                    : item?.status == 'declined'
                    ? colors.ToastColors.Error
                    : colors.Primary,
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
        <Text style={styles.keyTxt}>Description</Text>
        <Text numberOfLines={4} style={styles.valueTxt}>
          {item?.descriptionOfEvent}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const FlagRaisingHomeScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const dispatch = useDispatch();
  const [search, setSearch] = useState('');
  const [sortIndex, setSortIndex] = useState<any>(null);
  const [list, setList] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const userData = selector?.residentUserData;

  const [queryParams, setQueryparams] = useState({});
  const {isDrawerOpen, drawerAnim, overlayAnim, openDrawer, closeDrawer} =
    useDrawer();

  // useEffect(() => {
  //   getRequests();
  // }, [page, search, queryParams]);

  // useEffect(() => {
  //   if (search === '') return;
  //   setPage(1);
  //   getRequests();
  // }, [search]);

  const onRefresh = () => {
    setRefreshing(true);
    if (page === 1) {
      fetchFlagList();
    } else {
      setPage(1);
    }
  };
  const fetchFlagList = ({silent = false} = {}) => {
    if (!silent && page === 1) setIsLoading(true);

    apiHandler({
      endpoint: ENDPOINTS.flagRaisingReqs,
      method: 'GET',
      queryParams: {
        page,
        pageSize: 10,
        query: search,
        sort: sortingList[sortIndex]?.key ?? '',
        ...queryParams,
      },
      authContext: 'RESIDENT',
      onComplete: (resp: any) => {
        if (resp?.status) {
          setIsLoading(false);
          setRefreshing(false);
          setTotalItems(resp?.pagination?.totalItems ?? 0);
          if (page === 1) {
            setList(resp?.data?.data || []);
          } else {
            setList((prevList: any) => [
              ...prevList,
              ...resp?.data?.filter(
                (item: any) => !prevList.some((p: any) => p?.id === item?.id),
              ),
            ]);
          }
        } else {
          setIsLoading(false);
          setRefreshing(false);
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

  useFocusRefresh(fetchFlagList, [page, search, queryParams]);

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
        text={'Flag Raising Requests'}
      />

      <ScrollView
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
          paddingHorizontal: normalized(20),
          paddingBottom: normalized(30),
        }}>
        <CustomButton
          text={'Flag Raising Request'}
          onPress={() => {
            props?.navigation?.navigate(Routes.FlagRaising.NewReqScreen);
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
            keyExtractor={(item, idx) => String(item?.id ?? idx)}
            contentContainerStyle={{
              marginTop: normalized(10),
              gap: normalized(12),
            }}
            showsVerticalScrollIndicator={false}
            renderItem={({item}) => (
              <Comp
                item={item}
                onPress={() =>
                  props?.navigation?.navigate(
                    Routes.FlagRaising.ReqDetailScreen,
                    {requestId: item?.requestId},
                  )
                }
              />
            )}
            ListEmptyComponent={() =>
              !isLoading ? (
                <View style={styles.emptyCont}>
                  <EmptyComp
                    type={Empty_Screen_Type.List}
                    subText="No Request Found"
                  />
                </View>
              ) : null
            }
            ListFooterComponent={() =>
              list.length < totalItems ? (
                <View
                  style={{height: normalized(20), marginTop: normalized(12)}}>
                  <ActivityIndicator size="large" color={colors.Primary} />
                </View>
              ) : (
                <View style={{height: normalized(10)}} />
              )
            }
            onEndReachedThreshold={0.2}
            onEndReached={() => {
              if (!isLoading && list.length < totalItems) {
                setPage(prev => prev + 1);
              }
            }}
          />
        )}
      </ScrollView>
      <CustomDrawer
        isVisible={isDrawerOpen}
        drawerAnim={drawerAnim}
        statusList={FlagRaisingStatusList}
        overlayAnim={overlayAnim}
        hideSearchBar={true}
        hidePaymentStatus={true}
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

export default FlagRaisingHomeScreen;

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
      minHeight: ScreenSize.height / 1.4,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyCont: {
      minHeight: ScreenSize.height / 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
