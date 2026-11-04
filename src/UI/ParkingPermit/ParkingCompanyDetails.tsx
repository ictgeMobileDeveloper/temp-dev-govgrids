import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import moment from 'moment';
import {normalized, ScreenProps} from '../../Utils/AppConstants';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {AppStrings} from '../../Utils/AppStrings';
import {
  capitalizeEachWord,
  formatAmountToUSD,
  getStatusColor,
} from '../../Utils/Helper';
import CustomHeader from '../Components/CustomHeader';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../Network/Urls';
import {setShowToast} from '../../Redux/AppReducers';
import ForwardArrowIcon from '../Svg/ForwardArrowIcon';
import {Routes} from '../../Utils/Routes';
import CustomButton from '../Components/CustomButton';

const CompanyDetailScreen = (props: ScreenProps) => {
  const insets = useSafeAreaInsets();
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const dispatch = useDispatch();

  const companyId = props?.route?.params?.companyId;

  const [data, setData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDetail = useCallback(
    (isRefresh = false) => {
      isRefresh ? setRefreshing(true) : setIsLoading(true);

      apiHandler({
        endpoint: ENDPOINTS.parkingassociationDetail,
        method: 'GET',
        queryParams: {id: companyId},
        payload: {id: companyId},
        authContext: 'RESIDENT',
        onComplete: (resp: any) => {
          setRefreshing(false);
          setIsLoading(false);
          if (resp?.status) {
            setData(resp?.data?.data ?? {});
          } else {
            dispatch(
              setShowToast({
                type: AppStrings.ToastType.error,
                message: resp?.message ?? 'Something went wrong',
              }),
            );
          }
        },
      });
    },
    [companyId, dispatch],
  );

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const sites: any[] = data?.sites ?? [];

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
        barStyle={selector?.isDarkTheme ? 'light-content' : 'dark-content'}
      />
      <CustomHeader
        onBackPress={() => props?.navigation?.goBack()}
        text="Company Details"
      />

      {isLoading ? (
        <View style={styles.loaderCont}>
          <ActivityIndicator size="large" color={colors.Primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{marginHorizontal: normalized(20)}}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchDetail(true)}
              colors={[colors.Primary]}
              tintColor={colors.Primary}
            />
          }>
          {data?.canApply === true && (
            <CustomButton
              text={'Submit New Request'}
              onPress={() => {
                props?.navigation?.navigate(
                  Routes.ParkingPermit.RequestSubmit,
                  {
                    isCompany: true,
                    companyId: companyId,
                  },
                );
              }}
              RightIcon={ForwardArrowIcon}
              loading={false}
            />
          )}
          <View style={{height: normalized(12)}} />

          {/* Contract */}
          <View style={styles.itemCont}>
            <View style={styles.rowCont}>
              <Text style={styles.nameTxt}>Company Details</Text>
            </View>

            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Permit Type</Text>
                <Text style={styles.valueTxt}>
                  {capitalizeEachWord(data?.permitType?.type) || 'N/A'}
                </Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Billing Frequency</Text>
                <Text style={styles.valueTxt}>
                  {capitalizeEachWord(data?.contractBillingFrequency) || 'N/A'}
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Contract Start Date</Text>
                <Text style={styles.valueTxt}>
                  {moment(data?.contractStartDate).format('MMM DD, YYYY') ||
                    'N/A'}
                </Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Contract End Date</Text>
                <Text style={styles.valueTxt}>
                  {moment(data?.contractEndDate).format('MMM DD, YYYY') ||
                    'N/A'}
                </Text>
              </View>
            </View>
          </View>

          <View style={{height: normalized(12)}} />

          <View style={styles.itemCont}>
            <View style={styles.rowCont}>
              <Text style={styles.nameTxt}>{`Sites (${sites.length})`}</Text>
            </View>

            {sites.map((data: any, i: number) => {
              const lateFee = data?.lateFeeEnabled ? 'enabled' : 'disabled';
              return (
                <View key={data?.id ?? i}>
                  <View style={styles.itemCont}>
                    <View style={styles.row}>
                      <View style={styles.item}>
                        <Text style={styles.nameTxt}>
                          {data?.site?.buildingName ?? 'N/A'}
                        </Text>
                        {!!data?.site?.buildingAddress && (
                          <Text style={styles.valueTxt}>
                            {data.site.buildingAddress}
                          </Text>
                        )}
                      </View>
                    </View>

                    <View style={styles.row}>
                      <View style={styles.item}>
                        <Text style={styles.keyTxt}>Vehicle Capacity</Text>
                        <Text style={styles.valueTxt}>
                          {data?.vehicleCapacity ?? 'N/A'}
                        </Text>
                      </View>

                      <View style={styles.item}>
                        <Text style={styles.keyTxt}>Late Fee</Text>
                        <View
                          style={[
                            styles.statusCont,
                            {
                              backgroundColor: getStatusColor(lateFee, colors),
                              alignSelf: 'flex-start',
                            },
                          ]}>
                          <Text style={styles.statusTxt}>
                            {capitalizeEachWord(lateFee)}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.item}>
                      <Text style={styles.keyTxt}>Rate</Text>
                      <Text style={styles.Heading1}>
                        {formatAmountToUSD(data?.rate)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={{height: normalized(35)}} />
        </ScrollView>
      )}
    </View>
  );
};

export default CompanyDetailScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    loaderCont: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    divider: {
      height: normalized(1),
      backgroundColor: colors.Grey_2,
      marginVertical: normalized(8),
    },
  });
