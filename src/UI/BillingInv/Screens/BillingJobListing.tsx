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
import React, {useMemo, useRef, useState, useEffect} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../../Redux/AppStore';
import {AppStyles} from '../../../Utils/AppStyles';
import CustomHeader from '../../Components/CustomHeader';
import {
  normalized,
  ScreenProps,
  ScreenSize,
  sortingList,
} from '../../../Utils/AppConstants';
import {Routes} from '../../../Utils/Routes';
import {ENDPOINTS} from '../../../Network/Urls';
import {useIsFocused} from '@react-navigation/native';
import {apiHandler} from '../../../Network/Services/ApiHandler';
import {setShowToast} from '../../../Redux/AppReducers';
import {AppStrings, Empty_Screen_Type} from '../../../Utils/AppStrings';
import {
  formatStatus,
  getErrorMessage,
  getStatusColor,
} from '../../../Utils/Helper';
import moment from 'moment';
import CustomInput from '../../Components/CustomInput';
import EmptyComp from '../../Components/EmptyComp';

const JobItem = (props: any) => {
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...AppStyles(colors), ...makeStyles(colors)}),
    [colors],
  );
  const item = props?.item;

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={props?.onPress}
      style={styles.itemCont}>
      <View style={styles.rowCont}>
        <Text style={styles.nameTxt}>{item?.jobId}</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Category</Text>
          <Text style={styles.valueTxt}>{item?.category?.name}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Job Type</Text>
          <Text style={styles.valueTxt}>{item?.jobType?.name}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Hiring Date</Text>
          <Text style={styles.valueTxt}>
            {item?.hiringDate ? moment(item?.hiringDate).format('LL') : '-'}
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
            <Text style={styles.statusTxt}>{formatStatus(item?.status)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const JobListingScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;
  const styles = useMemo(
    () => ({...AppStyles(colors), ...makeStyles(colors)}),
    [colors],
  );

  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [query, setQuery] = useState('');
  const [searchLoader, setSearchLoader] = useState(false);
  const [jobList, setJobList] = useState<any[]>([]);
  const [jobLoader, setJobLoader] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sortIndex, setSortIndex] = useState<any>(null);
  const isManualRefreshRef = useRef(false);

  const [queryParams, setQueryParams] = useState({});

  const isFocused = useIsFocused();
  const dispatch = useDispatch();

  useEffect(() => {
    getJobList();
  }, [page, isFocused, query, sortIndex, queryParams]);

  const getJobList = () => {
    const isManualRefresh = isManualRefreshRef.current;
    page === 1 && !isManualRefresh && setJobLoader(true);
    apiHandler({
      endpoint: ENDPOINTS.getBillingJobListing,
      method: 'GET',
      queryParams: {
        page,
        pageSize: 10,
        query,
        sort: sortingList[sortIndex]?.key ? sortingList[sortIndex]?.key : '',
        ...queryParams,
      },
      authContext: 'DAM',
      onComplete: (resp: any) => {
        isManualRefreshRef.current = false;
        setRefreshing(false);
        if (resp?.status) {
          console.log('JobListing', resp);
          setJobLoader(false);
          setSearchLoader(false);
          setTotalItems(resp?.data?.pagination?.totalItems ?? 0);
          const data = resp?.data?.data?.data ?? [];
          if (page === 1) {
            setJobList(data);
          } else {
            setJobList(prev => [
              ...prev,
              ...data.filter(
                (it: any) => !prev.some((p: any) => p?.id === it?.id),
              ),
            ]);
          }
        } else {
          setJobLoader(false);
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

  const onRefresh = () => {
    isManualRefreshRef.current = true;
    setRefreshing(true);
    if (page !== 1) {
      setPage(1);
      return;
    }
    getJobList();
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
        text={'Jobs'}
      />

      <View
        style={[
          styles.row,
          {
            marginTop: normalized(12),
            marginHorizontal: normalized(20),
            gap: normalized(20),
          },
        ]}>
        <View style={{flex: 1}}>
          <CustomInput
            placeholder="Search Jobs"
            placeholderColor={colors.Heading_Txt}
            value={query}
            setValue={(v: string) => {
              setQuery(v);
              if (v === '') {
                setPage(1);
              }
            }}
            style={{height: normalized(45)}}
          />
        </View>
      </View>

      {jobList?.length === 0 && jobLoader ? (
        <View style={styles.loaderCont}>
          <ActivityIndicator color={colors.Primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={jobList}
          contentContainerStyle={{paddingHorizontal: normalized(20)}}
          keyExtractor={(item, index) => String(item?.id ?? index)}
          style={{
            marginTop: normalized(10),
            marginBottom: normalized(30),
            gap: normalized(12),
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.Primary}
              colors={[colors.Primary]}
            />
          }
          renderItem={({item}) => (
            <JobItem
              item={item}
              onPress={() =>
                props?.navigation?.navigate(
                  Routes.PoliceDuty.BillingJobDetails,
                  {
                    item: item,
                  },
                )
              }
            />
          )}
          ListEmptyComponent={() =>
            !jobLoader ? (
              <View style={styles.emptyCont}>
                <EmptyComp
                  type={Empty_Screen_Type.List}
                  subText="No Jobs Found"
                />
              </View>
            ) : null
          }
          ListFooterComponent={() =>
            jobList.length < totalItems ? (
              <View
                style={{
                  height: normalized(20),
                  marginTop: normalized(12),
                }}>
                <ActivityIndicator size="large" color={colors.Primary} />
              </View>
            ) : (
              <View style={{height: normalized(10)}} />
            )
          }
          onEndReachedThreshold={0.2}
          onEndReached={() => {
            if (!jobLoader && jobList.length < totalItems) {
              setPage(prev => prev + 1);
            }
          }}
        />
      )}
    </View>
  );
};

export default JobListingScreen;

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
      marginBottom: normalized(12),
    },
    loaderCont: {
      flex: 1,
      minHeight: ScreenSize.height / 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyCont: {
      height: ScreenSize.height / 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
