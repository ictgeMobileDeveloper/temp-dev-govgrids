import {
  ActivityIndicator,
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {normalized, ScreenProps, ScreenSize} from '../../Utils/AppConstants';
import CustomHeader from '../Components/CustomHeader';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import CustomInput from '../Components/CustomInput';
import {useIsFocused} from '@react-navigation/native';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../Network/Urls';
import {setShowToast} from '../../Redux/AppReducers';
import {AppStrings} from '../../Utils/AppStrings';
import {formatTo12Hour, getErrorMessage} from '../../Utils/Helper';
import moment from 'moment';

const Comp = ({item}: any) => {
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  return (
    <View style={styles.itemCont}>
      <View style={styles.rowCont}>
        <Text style={styles.nameTxt}>{item?.totalHoursRequested}</Text>
        <View
          style={[
            styles.statusCont,
            {
              backgroundColor:
                item?.status == 'Approved'
                  ? colors.Primary
                  : item?.status == 'Pending'
                  ? colors.ToastColors.Alarm
                  : colors.ToastColors?.Error,
            },
          ]}>
          {/* <Text style={styles.statusTxt}>{capitalizeEachWord(item?.status == 'partiallyPublished' ? 'Partially Published' : item?.status)}</Text> */}
          <Text style={styles.statusTxt}>{item?.status}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Employee Name</Text>
          <Text
            style={
              styles.valueTxt
            }>{`${item?.employee?.firstName} ${item?.employee?.lastName}`}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Bank</Text>
          <Text style={styles.valueTxt}>{item?.accrualBank?.bankName}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Start Time</Text>
          <Text style={styles.valueTxt}>{formatTo12Hour(item?.startTime)}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Date</Text>
          <Text style={styles.valueTxt}>
            {moment(item?.leaveDate).format('MMM DD, YYYY')}
          </Text>
        </View>
      </View>

      <View style={styles.item}>
        <Text style={styles.keyTxt}>Reason</Text>
        <Text style={styles.valueTxt}>{item?.reason}</Text>
      </View>
    </View>
  );
};

const TimeKeepingRequestsScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector?.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const [search, setSearch] = useState('');
  const [list, setList] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState<any>('');
  const isSearching = (search?.length ?? 0) > 0;

  useEffect(() => {
    getLeaveReqHistory();
  }, []);

  useEffect(() => {
    if (search != '') setIsLoading(true);
    getLeaveReqHistory();
  }, [page, isFocused, search]);

  const getLeaveReqHistory = () => {
    page == 1 && setIsLoading(true);
    apiHandler({
      endpoint: ENDPOINTS.getLeaveReqHistory,
      method: 'GET',
      queryParams: {
        page: page,
        pageSize: 10,
        query: search,
      },
      authContext: 'TIMEKEEPING',
      onComplete: (resp: any) => {
        if (resp?.status) {
          setIsLoading(false);
          setTotalItems(resp?.data?.pagination?.totalItems);
          if (page == 1) {
            setList(resp?.data?.data?.data || []);
          } else {
            setList((prevList: any) => [
              ...prevList,
              ...resp?.data?.data?.data?.filter(
                (item: any) =>
                  !prevList.some((prevItem: any) => prevItem.id == item.id),
              ),
            ]);
          }
        } else {
          setIsLoading(false);
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
        text={'Request'}
      />
      <View
        style={{
          marginTop: normalized(12),
          paddingHorizontal: normalized(20),
        }}>
        <CustomInput
          placeholder={'Search'}
          value={search}
          setValue={(val: any) => {
            setSearch(val);
          }}
        />
      </View>

      {isLoading && (list?.length === 0 || isSearching) ? (
        <View style={styles.loaderCont}>
          <ActivityIndicator color={colors.Primary} size={'large'} />
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item: any, index) => item?.id ?? index.toString()}
          contentContainerStyle={{
            marginTop: normalized(10),
            gap: normalized(12),
            paddingHorizontal: normalized(20),
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => <Comp item={item} />}
          ListFooterComponent={() =>
            list?.length < totalItems ? (
              <View style={{height: normalized(30), marginTop: normalized(12)}}>
                <ActivityIndicator size={'large'} color={colors.Primary} />
              </View>
            ) : (
              <View style={{height: normalized(30)}} />
            )
          }
          onEndReached={() => {
            if (list?.length < totalItems) {
              setPage(prevPage => prevPage + 1);
            }
          }}
        />
      )}
    </View>
  );
};

export default TimeKeepingRequestsScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    loaderCont: {
      flex: 1,
      minHeight: ScreenSize.height / 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
