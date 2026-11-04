import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../../Redux/AppStore';
import {AppStyles} from '../../../Utils/AppStyles';
import {
  AppColors,
  AppFonts,
  BillingAccStatus,
  normalized,
  ScreenProps,
  ScreenSize,
} from '../../../Utils/AppConstants';
import CustomHeader from '../../Components/CustomHeader';
import PoliceDutyBillingVector from '../../Svg/PoliceDutyBillingVector';
import CustomButton from '../../Components/CustomButton';
import PrimaryButton from '../../Components/PrimaryButton';
import {Routes} from '../../../Utils/Routes';
import {apiHandler} from '../../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../../Network/Urls';
import {getUserProfileReq} from '../../../Network/Services/GeneralServices';
import {AppStrings, AsyncKeyStrings} from '../../../Utils/AppStrings';
import {setDataInAsync} from '../../../Utils/AsyncStorage';
import {setResidentUserData, setShowToast} from '../../../Redux/AppReducers';
import {capitalizeEachWord, getErrorMessage} from '../../../Utils/Helper';
import moment from 'moment';

const PoliceDutyScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const selector: any = useSelector(
    (state: AppRootStore) => state.SliceReducer,
  );
  const colors = selector?.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const dispatch = useDispatch();
  const userData = selector?.residentUserData;

  const [isLoading, setIsLoading] = useState(false);
  const [billingProfile, setBillingProfile] = useState<any>(null);
  const [billingProLoading, setBillingProLoading] = useState(false);
  const [totalInvoices, setTotalInvoices] = useState(0);

  useEffect(() => {
    if (
      userData?.specialBillingAccount?.billingAccountStatus ==
      BillingAccStatus.pending
    ) {
      refreshUserData();
    }
  }, []);

  const onApplyForBillingAcc = () => {
    setIsLoading(true);
    apiHandler({
      endpoint: ENDPOINTS.applyForBillingAccount,
      method: 'POST',
      authContext: 'RESIDENT',
      onComplete: (resp: any) => {
        console.log('applyForBillingAccount resp--- ', resp);
        if (resp?.status) {
          setIsLoading(false);
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.success,
              message: resp?.data?.message,
            }),
          );
          refreshUserData();
        } else {
          setIsLoading(false),
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

  const refreshUserData = () => {
    getUserProfileReq(ENDPOINTS.getProfile, (response: any) => {
      if (response?.status) {
        const updatedData = {
          ...response?.data,
        };
        dispatch(setResidentUserData(updatedData));
      }
    });
  };

  useEffect(() => {
    if (
      userData?.specialBillingAccount?.billingAccountStatus ==
      BillingAccStatus.approve
    ) {
      getBillingProfile();
    }
  }, []);

  const getBillingProfile = () => {
    setBillingProLoading(true);
    apiHandler({
      endpoint: ENDPOINTS.getBillingProfile,
      method: 'GET',
      authContext: 'RESIDENT',
      onComplete: (resp: any) => {
        if (resp?.status) {
          getInvoices();
          setBillingProfile(resp?.data?.data);
        } else {
          setBillingProLoading(false);
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

  const getInvoices = () => {
    apiHandler({
      endpoint: ENDPOINTS.getInvoices,
      method: 'GET',
      queryParams: {
        page: 1,
        pageSize: 1,
        sort: '',
      },
      authContext: 'RESIDENT',
      onComplete: (resp: any) => {
        if (resp?.status) {
          setTotalInvoices(resp?.data?.pagination?.totalItems);
          setBillingProLoading(false);
        } else {
          setBillingProLoading(false);
        }
      },
    });
  };

  if (billingProLoading) {
    return (
      <View style={styles.loaderCont}>
        <ActivityIndicator color={colors.Primary} size={'large'} />
      </View>
    );
  }

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
        text={'Police Duty Billing Account'}
      />

      {userData?.specialBillingAccount?.billingAccountStatus ==
      BillingAccStatus.notApply ? (
        <View style={styles.wrapper}>
          <PoliceDutyBillingVector />
          <View style={styles.btnCont}>
            <CustomButton
              text={'Request For Special Billing'}
              onPress={onApplyForBillingAcc}
              loading={isLoading}
            />
          </View>
        </View>
      ) : userData?.specialBillingAccount?.billingAccountStatus ==
        BillingAccStatus.pending ? (
        <View style={styles.pendingCont}>
          <View style={styles.statusCont}>
            <Text style={styles.statusTxt}>Pending Admin Approval</Text>
          </View>
          <Text style={styles.headTxt}>
            Thank you for submitting your request for special billing.
          </Text>
          <Text style={styles.simpleTxt}>
            Our admin team will review your request to ensure eligibility. You
            will receive an update once your request has been approved or
            declined.
          </Text>
        </View>
      ) : userData?.specialBillingAccount?.billingAccountStatus ==
        BillingAccStatus.approve ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingHorizontal: normalized(20)}}>
          <View style={styles.btnRow}>
            <PrimaryButton
              firstTxt={'Balance'}
              secondTxt={`$${billingProfile?.fundAccount?.currentBalance}`}
            />
            <PrimaryButton
              firstTxt={'Invoices'}
              secondTxt={totalInvoices}
              isShowLastIcon
              onPress={() =>
                props?.navigation?.navigate(Routes.PoliceDuty.InvoiceScreen)
              }
            />
          </View>
          <View style={{height: normalized(12)}} />
          <Text style={styles.Modal_Heading_Txt}>Resident Info</Text>
          <View style={{height: normalized(12)}} />
          <View style={styles.itemCont}>
            <View style={styles.rowCont}>
              <Text
                style={
                  styles.nameTxt
                }>{`${billingProfile?.resident?.firstName} ${billingProfile?.resident?.lastName}`}</Text>
              {billingProfile?.resident?.isVerified && (
                <View
                  style={[
                    styles.statusCont,
                    {
                      backgroundColor: colors.Primary,
                    },
                  ]}>
                  <Text style={styles.statusTxt}>Verified</Text>
                </View>
              )}
            </View>
            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Email</Text>
                <Text style={styles.valueTxt}>
                  {billingProfile?.resident?.email}
                </Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Phone Number</Text>
                <Text style={styles.valueTxt}>
                  {billingProfile?.resident?.phoneNumber}
                </Text>
              </View>
            </View>

            <View style={styles.item}>
              <Text style={styles.keyTxt}>Address</Text>
              <Text style={styles.valueTxt}>
                {billingProfile?.resident?.address}
              </Text>
            </View>

            {/* <View style={styles.item}>
              <Text style={styles.keyTxt}>Location</Text>
              <Text style={styles.valueTxt}>Example Location</Text>
            </View>*/}
          </View>

          <View style={{height: normalized(12)}} />
          <Text style={styles.Modal_Heading_Txt}>Billing Finance</Text>
          <View style={{height: normalized(12)}} />
          <View style={styles.itemCont}>
            <View style={styles.rowCont}>
              <Text
                style={
                  styles.nameTxt
                }>{`Round Fees: ${billingProfile?.roundFeesTo}`}</Text>
              <View
                style={[
                  styles.statusCont,
                  {
                    backgroundColor: billingProfile?.accountStatus
                      ? colors.Primary
                      : colors.ToastColors.Alarm,
                  },
                ]}>
                <Text style={styles.statusTxt}>
                  {capitalizeEachWord(billingProfile?.accountStatus)}
                </Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Conversion</Text>
                <Text style={styles.valueTxt}>
                  {billingProfile?.timeConversionMethod ?? 'N/A'}
                </Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Markup/Discount</Text>
                <Text
                  style={
                    styles.valueTxt
                  }>{`${billingProfile?.markupOrDiscount}%`}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Interest Rate</Text>
                <Text
                  style={
                    styles.valueTxt
                  }>{`${billingProfile?.annualInterestRate} %`}</Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Interest Type</Text>
                <Text style={styles.valueTxt}>
                  {capitalizeEachWord(billingProfile?.interestType)}
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Finance Charge</Text>
                <Text
                  style={
                    styles.valueTxt
                  }>{`$${billingProfile?.financeChargeAmount}`}</Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Discount</Text>
                <Text
                  style={
                    styles.valueTxt
                  }>{`${billingProfile?.discountPercentage} % (${billingProfile?.discountDaysDue} Days)`}</Text>
              </View>
            </View>

            <View style={styles.item}>
              <Text style={styles.keyTxt}>Billing Cycle</Text>
              <Text style={styles.valueTxt}>
                {billingProfile?.billingCycle ?? 'N/A'}
              </Text>
            </View>
          </View>

          <View style={{height: normalized(12)}} />
          <Text style={styles.Modal_Heading_Txt}>Billing Finance</Text>
          <View style={{height: normalized(12)}} />
          <View style={styles.itemCont}>
            <View style={styles.item}>
              <Text style={styles.keyTxt}>Last Bill</Text>
              <Text style={styles.valueTxt}>
                {billingProfile?.lastBillDate
                  ? moment(billingProfile?.lastBillDate).format('LL')
                  : 'N/A'}
              </Text>
            </View>
            <View style={styles.item}>
              <Text style={styles.keyTxt}>Last Payment</Text>
              <Text style={styles.valueTxt}>
                {billingProfile?.lastPaymentDate
                  ? moment(billingProfile?.lastPaymentDate).format('LL')
                  : 'N/A'}
              </Text>
            </View>
          </View>
          <View style={{height: normalized(20)}} />
        </ScrollView>
      ) : (
        <View />
      )}
    </View>
  );
};

export default PoliceDutyScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    wrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: normalized(-120),
      flex: 1,
      marginHorizontal: normalized(20),
    },
    btnCont: {
      marginTop: normalized(20),
      width: '100%',
    },
    pendingCont: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: normalized(20),
      gap: normalized(8),
    },
    statusCont: {
      height: normalized(24),
      paddingHorizontal: normalized(20),
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: normalized(24),
      backgroundColor: AppColors.ToastColors.Alarm,
    },
    statusTxt: {
      fontSize: normalized(12),
      color: AppColors.White,
      fontFamily: AppFonts.UbuntuBold,
    },
    headTxt: {
      fontSize: normalized(12),
      color: colors.Black,
      fontFamily: AppFonts.UbuntuBold,
    },
    simpleTxt: {
      fontSize: normalized(12),
      color: colors.Desc_Txt,
      fontFamily: AppFonts.UbuntuRegular,
    },
    btnRow: {
      flex: 1,
      alignItems: 'center',
      flexDirection: 'row',
      gap: normalized(12),
      justifyContent: 'space-between',
      marginVertical: normalized(10),
    },
    itemCont: {
      width: '100%',
      borderWidth: 1,
      borderRadius: normalized(8),
      borderColor: colors.BorderColor,
      padding: normalized(12),
      gap: normalized(8),
    },
    keyTxt: {
      fontFamily: AppFonts.UbuntuRegular,
      fontSize: normalized(13),
      color: colors.Desc_Txt,
    },
    valueTxt: {
      fontFamily: AppFonts.UbuntuRegular,
      fontSize: normalized(14),
      color: colors.Heading_Txt,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rowCont: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    item: {
      flex: 1,
      gap: normalized(3),
      alignItems: 'flex-start',
    },
    loaderCont: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.Background,
    },
  });
