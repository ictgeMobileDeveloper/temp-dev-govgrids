import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import moment from 'moment';
import {AppStyles} from '../../Utils/AppStyles';
import {normalized} from '../../Utils/AppConstants';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../Network/Urls';
import {setShowToast} from '../../Redux/AppReducers';
import {AppStrings} from '../../Utils/AppStrings';
import {
  capitalizeEachWord,
  formatAmountToUSD,
  getDurationInSeconds,
  getRemainingMinutes,
  getStatusColor,
  lightenHexColor,
} from '../../Utils/Helper';
import CountdownRing from '../Components/CountDownTimer';
import CustomHeader from '../Components/CustomHeader';
import CalendarIcon from '../Svg/CalendarIcon';
import ClockIcon from '../Svg/ClockIcon';
import DollarIcon from '../Svg/DollarIcon';
import ClockCheck from '../Svg/ClockCheckIcon';
import VehicleIcon from '../Svg/VehicleVector';
import SimpleButton from '../Components/SimpleButton';
import ExtendSessionModal from './Components/SessionExtensionModal';
import {paymentIntentReq} from '../../Network/Services/StripeServices';
import {
  initPaymentSheet,
  presentPaymentSheet,
} from '@stripe/stripe-react-native';
import {updateParkingSessionInStore} from '../../Network/Services/ParkingSessionService';
import {PaymentAlert} from '../Components/ConfirmationModal';

const ParkingSessionDetailScreen = (props: any) => {
  const insects = useSafeAreaInsets();
  const dispatch = useDispatch();
  const selector: any = useSelector((state: any) => state.SliceReducer);
  const colors = selector?.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  const [data, setData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [paymentLoading, setpaymentLoading] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);

  const remainingExtensionMinutes = getRemainingMinutes(
    data?.startTime,
    data?.durationMinutes,
  );

  useEffect(() => {
    fetchSessionDetail();
  }, []);

  const fetchSessionDetail = () => {
    setIsLoading(true);
    apiHandler({
      endpoint: ENDPOINTS.getParkingSessionDetail,
      method: 'GET',
      queryParams: {
        sessionId: props?.route?.params?.SessionId ?? props?.route?.params?.id,
      },
      authContext: 'RESIDENT',
      onComplete: (resp: any) => {
        setIsLoading(false);
        if (resp?.status) {
          const fresh = resp?.data?.data ?? {};
          console.log(fresh, 'session details');
          setData(fresh);
          updateParkingSessionInStore(
            dispatch,
            selector?.activeParkingSessions ?? [],
            selector?.guestParkingSessions ?? [],
            fresh,
          );
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
  };

  const extendSession = (additionalMinutes: number) => {
    setIsLoading(true);
    apiHandler({
      endpoint: ENDPOINTS.parkingextendSession,
      method: 'POST',
      payload: {
        additionalMinutes,
        licensePlate: data?.licensePlate,
        sessionId: data?.sessionId,
      },
      authContext: 'RESIDENT',
      onComplete: (resp: any) => {
        setIsLoading(false);
        if (resp?.status) {
          onPayment({extensionId: resp?.data?.data?.id});
        } else {
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.error,
              message: resp?.error,
            }),
          );
        }
      },
    });
  };

  const onPayment = async (payload: any, amount?: any) => {
    setpaymentLoading(true);
    console.log('payload ==0===. ', payload, amount);

    const isZero = String(amount) === '0.00';
    const isMinimum = Number(amount) > 0 && Number(amount) < 0.5;

    if (isMinimum) {
      PaymentAlert.show('Sorry', 'this amount cannot be processed');
      return;
    }

    try {
      await paymentIntentReq(
        payload,
        'RESIDENT',
        ENDPOINTS.parkingExtendSessionPaymentIntent,
        async (response: any) => {
          console.log('paymentIntent API Response:', response);

          const clientSecret = response?.clientSecret;

          if (!isZero) {
            if (!clientSecret) {
              PaymentAlert.show('Error', 'Payment client secret is missing.');
              return;
            }

            const {error: initError} = await initPaymentSheet({
              merchantDisplayName: 'FOIA',
              paymentIntentClientSecret: clientSecret,
              allowsDelayedPaymentMethods: false,
            });

            if (initError) {
              PaymentAlert.show('Stripe Init Error', initError.message);
              return;
            }

            const {error: paymentError} = await presentPaymentSheet();

            if (paymentError) {
              PaymentAlert.show('Payment Failed', paymentError.message);
              return;
            }
          }

          PaymentAlert.show('Success', 'Payment completed successfully.', [
            {
              text: 'OK',
              onPress: () => {
                fetchSessionDetail();
                dispatch(
                  setShowToast({
                    type: AppStrings.ToastType.success,
                    message: 'Your session is extended ',
                  }),
                );
              },
            },
          ]);
        },
      );
    } catch (err) {
      console.log('PaymentSheet Init Error:', err);
      PaymentAlert.show(
        'Error',
        'Something went wrong initializing payment sheet.',
      );
    } finally {
      setpaymentLoading(false);
    }
  };

  console.log(data);
  const totalSeconds = getDurationInSeconds(data?.startTime, data?.endTime);

  // const vehicle = data?.vehicles?.[0];

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insects.top - normalized(Platform.OS === 'ios' ? 15 : 0),
          paddingBottom: Platform.OS === 'android' ? insects.bottom : 0,
        },
      ]}>
      <StatusBar
        barStyle={selector?.isDarkTheme ? 'light-content' : 'dark-content'}
      />

      <CustomHeader
        onBackPress={() => props?.navigation?.goBack()}
        text={'Active Session'}
        CustomPress
        btnTxt={'extend'}
        onbtnPress={console.log('hello')}
      />

      {isLoading ? (
        <View style={styles.loaderCont}>
          <ActivityIndicator size="large" color={colors.Primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: normalized(20),
            paddingBottom: normalized(30),
          }}
          showsVerticalScrollIndicator={false}>
          <View style={styles.row}>
            <Text style={[styles.Input_Heading, {color: colors.Primary}]}>
              ACTIVE PARKING SESSION
            </Text>
            <View style={{width: normalized(90)}}>
              <SimpleButton
                text={'extend'}
                onPress={() => setShowExtendModal(true)}
              />
            </View>
          </View>

          <Text style={styles.nameTxt}>{data?.siteName ?? 'N/A'}</Text>
          <Text style={styles.keyTxt}>
            {data?.zoneName ?? 'N/A'} · {data?.bookingType ?? 'N/A'} ·{' '}
            {data?.sessionId ?? 'N/A'}
          </Text>

          <View style={styles.ringWrap}>
            {data?.endTime && (
              <CountdownRing
                expiresAt={data.endTime}
                totalSeconds={totalSeconds}
                color={colors.Primary}
              />
            )}
          </View>

          <View style={styles.gridRow}>
            <View style={[styles.itemCont, styles.gridItem]}>
              <View style={styles.iconCont}>
                <CalendarIcon primary={colors.Primary} height={20} width={20} />
              </View>
              <Text style={styles.keyTxt}>Start</Text>
              <Text style={styles.valueTxt}>
                {data?.startTime
                  ? moment(data.startTime).format('MMM D, YYYY, h:mm:ss A')
                  : 'N/A'}
              </Text>
            </View>
            <View style={[styles.itemCont, styles.gridItem]}>
              <View style={styles.iconCont}>
                <ClockIcon primary={colors.Primary} height={20} width={20} />
              </View>

              <Text style={styles.keyTxt}>End</Text>
              <Text style={styles.valueTxt}>
                {data?.endTime
                  ? moment(data.endTime).format('MMM D, YYYY, h:mm:ss A')
                  : 'N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.gridRow}>
            <View style={[styles.itemCont, styles.gridItem]}>
              <View style={styles.iconCont}>
                <DollarIcon primary={colors.Primary} size={20} />
              </View>
              <Text style={styles.keyTxt}>Amount</Text>
              <Text style={styles.valueTxt}>
                {formatAmountToUSD(data?.amount) ?? 'N/A'}
              </Text>
            </View>
            <View style={[styles.itemCont, styles.gridItem]}>
              <View style={styles.iconCont}>
                <ClockCheck color={colors.Primary} size={20} />
              </View>
              <Text style={styles.keyTxt}>Payment Status</Text>
              <View
                style={[
                  styles.statusCont,
                  {
                    backgroundColor: getStatusColor(
                      data?.paymentStatus,
                      colors,
                    ),
                    alignSelf: 'flex-start',
                  },
                ]}>
                <Text style={styles.statusTxt}>
                  {capitalizeEachWord(data?.paymentStatus)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.itemCont}>
            <View
              style={[
                styles.avatar,
                {backgroundColor: lightenHexColor(colors.Primary, 0.85)},
              ]}>
              <Text style={[styles.keyTxt, {color: colors.Primary}]}>
                {(data?.firstName ?? '-')[0]}
                {(data?.lastName ?? '-')[0]}
              </Text>
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.nameTxt}>
                {data?.firstName ?? 'N/A'} {data?.lastName ?? ''}
              </Text>
              <Text style={styles.keyTxt}>{data?.phoneNumber ?? 'N/A'}</Text>
              <Text style={styles.keyTxt}>{data?.email ?? 'N/A'}</Text>
            </View>
          </View>
          <View style={{height: normalized(10)}} />
          {data?.vehicles?.length > 0 && (
            <View style={styles.itemCont}>
              <Text style={styles.nameTxt}>Vehicles</Text>

              {data.vehicles.map((v: any, index: number) => (
                <View key={v?.id ?? index} style={styles.vehicleRow}>
                  <View
                    style={[
                      styles.iconCont,
                      {backgroundColor: lightenHexColor(colors.Primary, 0.85)},
                    ]}>
                    <VehicleIcon
                      primary={colors.Primary}
                      width={20}
                      height={20}
                    />
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.nameTxt}>
                      {v?.makeOfVehicle ?? 'N/A'} {v?.vehicleModel ?? ''}
                    </Text>
                    <Text style={styles.keyTxt}>
                      {v?.licensePlate ?? 'N/A'} · {v?.vehicleColor ?? 'N/A'} ·{' '}
                      {v?.vehicleState ?? 'N/A'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
      <ExtendSessionModal
        visible={showExtendModal}
        onClose={() => setShowExtendModal(false)}
        maxMinutes={remainingExtensionMinutes}
        isLoading={isLoading}
        colors={colors}
        onContinue={additionalMinutes => {
          setShowExtendModal(false);
          extendSession(additionalMinutes);
        }}
      />
    </View>
  );
};

export default ParkingSessionDetailScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {flex: 1, backgroundColor: colors.Background},
    extendBtn: {
      borderWidth: 1,
      borderColor: colors.Primary,
      borderRadius: normalized(8),
      paddingHorizontal: normalized(14),
      paddingVertical: normalized(6),
    },

    ringWrap: {alignItems: 'center', marginVertical: normalized(24)},
    gridRow: {
      flexDirection: 'row',
      gap: normalized(12),
      marginBottom: normalized(12),
    },
    iconCont: {
      width: normalized(35),
      height: normalized(35),
      borderRadius: normalized(8),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: lightenHexColor(colors.Primary, 0.6),
    },
    gridItem: {flex: 1},
    avatar: {
      width: normalized(44),
      height: normalized(44),
      borderRadius: normalized(22),
      alignItems: 'center',
      justifyContent: 'center',
    },
    vehicleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(12),
      borderWidth: 1,
      borderColor: colors.BorderColor,
      borderRadius: normalized(8),
      padding: normalized(12),
      marginTop: normalized(10),
    },
  });
