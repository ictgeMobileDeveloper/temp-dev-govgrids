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
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import CustomHeader from '../Components/CustomHeader';
import {
  AppFonts,
  normalized,
  ScreenProps,
  ScreenSize,
} from '../../Utils/AppConstants';
import CustomInput from '../Components/CustomInput';
import CustomButton from '../Components/CustomButton';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../Network/Urls';
import {setShowToast} from '../../Redux/AppReducers';
import {AppStrings} from '../../Utils/AppStrings';
import {getErrorMessage} from '../../Utils/Helper';
import {Routes} from '../../Utils/Routes';

const Comp = ({item, onLedgerPress}: any) => {
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  return (
    <View style={styles.itemCont}>
      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Name</Text>
          <Text style={styles.valueTxt}>{item?.bankName}</Text>
        </View>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'flex-end',
            height: normalized(26),
            flexDirection: 'row',
            gap: normalized(12),
          }}>
          <View
            style={[styles.statusCont, {backgroundColor: colors.Dark_Blue}]}>
            <Text style={styles.statusTxt}>
              {item?.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
          <CustomButton
            style={{
              height: normalized(26),
              width: normalized(75),
              marginTop: 0,
            }}
            text={'Ledger'}
            onPress={onLedgerPress}
            loading={false}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Accrued</Text>
          <Text style={styles.valueTxt}>{item?.totalRemainingHours}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Accrued Forecast</Text>
          <Text style={styles.valueTxt}>00h 00m</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Used</Text>
          <Text style={styles.valueTxt}>00h 00m</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Used Forecast</Text>
          <Text style={styles.valueTxt}>00h 00m</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Expired</Text>
          <Text style={styles.valueTxt}>00h 00m</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Expired Forecast</Text>
          <Text style={styles.valueTxt}>00h 00m</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Balanced</Text>
          <Text style={styles.valueTxt}>{item?.totalRemainingHours}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Active Rules</Text>
          {Array.isArray(item?.accrualRules) && item.accrualRules.length > 0 ? (
            item.accrualRules.map((rule: any, idx: number) => (
              <Text
                key={rule?.id ?? `${idx}-${rule?.name ?? 'rule'}`}
                style={styles.valueTxt}>
                {idx + 1}. {rule?.name ?? '—'}
              </Text>
            ))
          ) : (
            <Text style={styles.valueTxt}>None</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const Button = ({item}: any) => {
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  return (
    <View style={styles.btnCont}>
      <Text style={styles.firstTxt}>{item?.key}</Text>
      <Text style={styles.secondTxt}>{item?.value}</Text>
    </View>
  );
};

const TimeKeepingHoursScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const dispatch = useDispatch();
  const colors = selector?.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const [search, setSearch] = useState('');
  const [list, setList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const userData = selector?.TimeKeepingUserData;
  const [page, setPage] = useState(1);
  const [data, setData] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    getAccruals();
  }, []);

  const getAccruals = () => {
    !data && setIsLoading(true);
    search?.length > 0 && setSearchLoading(true);
    apiHandler({
      endpoint: ENDPOINTS.getAccrualBanks,
      queryParams: {page, pageSize: 10, query: search},
      authContext: 'TIMEKEEPING',
      onComplete: (resp: any) => {
        if (resp?.status) {
          setData(resp?.data?.data);
          setIsLoading(false);
          setSearchLoading(false);
        } else {
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.error,
              message: getErrorMessage(resp),
            }),
          );
          setSearchLoading(false);
          setIsLoading(false);
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
        text={'Hours'}
      />

      {!isLoading ? (
        <FlatList
          data={[1, 2, 3]}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{
            marginTop: normalized(10),
            paddingHorizontal: normalized(20),
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({item, index}) =>
            index === 0 ? (
              <View style={styles.btnRow}>
                <Button
                  item={{
                    key: 'Total Accrued Hours',
                    value: data?.totalAllTimeAccruedHours,
                  }}
                />
                <Button
                  item={{
                    key: 'Total Used Hours',
                    value: data?.totalAllTimeUsedHours,
                  }}
                />
                <Button
                  item={{
                    key: 'Total Remaining Hours',
                    value: data?.totalAllTimeRemainingHours,
                  }}
                />
              </View>
            ) : list?.length === 0 && isLoading ? (
              <View style={styles.loaderCont}>
                <ActivityIndicator color={colors.Primary} size="large" />
              </View>
            ) : index == 1 ? (
              <View style={[styles.rowCont, {flex: 1, gap: normalized(10)}]}>
                <View style={{flex: 1}}>
                  <CustomInput
                    placeholder={'Search'}
                    value={search}
                    setValue={(val: any) => {
                      setSearch(val);
                    }}
                  />
                </View>
                <View style={styles.searchBtn}>
                  <CustomButton
                    text={'Search'}
                    loading={searchLoading}
                    onPress={getAccruals}
                    style={{marginTop: 0, height: normalized(45)}}
                  />
                </View>
              </View>
            ) : (
              <FlatList
                data={data?.accrualBanks}
                showsVerticalScrollIndicator={false}
                style={{
                  gap: normalized(12),
                  marginVertical: normalized(15),
                }}
                renderItem={({item}) => (
                  <Comp
                    item={item}
                    onLedgerPress={() =>
                      props?.navigation?.navigate(
                        Routes.TimeKeeping.LedgerScreen,
                        {data: item},
                      )
                    }
                  />
                )}
                ListFooterComponent={() => (
                  <View style={{height: normalized(30)}} />
                )}
              />
            )
          }
        />
      ) : (
        <View style={styles.loaderCont}>
          <ActivityIndicator size={'large'} color={colors.Primary} />
        </View>
      )}
    </View>
  );
};

export default TimeKeepingHoursScreen;

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
    btnCont: {
      borderRadius: normalized(12),
      backgroundColor: colors.Primary,
      justifyContent: 'center',
      padding: normalized(10),
      height: normalized(90),
      flex: 1,
      gap: normalized(5),
    },
    firstTxt: {
      fontSize: normalized(14),
      fontFamily: AppFonts.UbuntuMedium,
      color: colors.White,
      textAlign: 'center',
    },
    secondTxt: {
      fontSize: normalized(18),
      fontFamily: AppFonts.UbuntuBold,
      color: colors.White,
      textAlign: 'center',
    },
    btnRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(12),
      justifyContent: 'space-between',
      marginBottom: normalized(12),
    },
    searchBtn: {
      width: normalized(80),
    },
  });
