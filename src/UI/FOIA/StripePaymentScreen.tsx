import React, {useMemo, useState} from 'react';
import {View, Text, StyleSheet, Alert, StatusBar, Platform} from 'react-native';
import {CardForm, useStripe} from '@stripe/stripe-react-native';
import {useDispatch, useSelector} from 'react-redux';
import {paymentIntentReq} from '../../Network/Services/StripeServices';
import {AppRootStore} from '../../Redux/AppStore';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppStyles} from '../../Utils/AppStyles';
import CustomHeader from '../Components/CustomHeader';
import {normalized, ScreenProps} from '../../Utils/AppConstants';
import CustomButton from '../Components/CustomButton';
import {setShowToast} from '../../Redux/AppReducers';
import {AppStrings} from '../../Utils/AppStrings';
import {ENDPOINTS} from '../../Network/Urls';

type CardDetails = {
  complete: boolean;
};

export default function PaymentScreen(props: ScreenProps) {
  const {confirmPayment} = useStripe();
  const [cardDetails, setCardDetails] = useState<CardDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);

  const insects = useSafeAreaInsets();
  const colors = selector.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const dispatch = useDispatch();
  console.log(' props?.route?.params---- ', props?.route?.params);

  const releaseId = props?.route?.params?.releaseId;
  const invoiceNo = props?.route?.params?.invoiceNo;
  const paymentId = props?.route?.params?.paymentId;
  const id = props?.route?.params?.id;

  const handlePayPress = async () => {
    try {
      setLoading(true);

      const body: any = {};

      if (releaseId) body.releaseId = releaseId;
      if (invoiceNo) body.invoiceNumber = invoiceNo;
      if (paymentId) {
        body.paymentId = paymentId;
        body.id = id;
      }

      await paymentIntentReq(
        body,
        'RESIDENT',
        ENDPOINTS.cityCartPaymentIntent,
        async (response: any) => {
          console.log('FIOA Payment :', response);
          const clientSecret = response?.clientSecret;

          if (!clientSecret) {
            setLoading(false);
            Alert.alert('Error', 'ClientSecret missing from backend response.');
            return;
          }

          const {error, paymentIntent} = await confirmPayment(clientSecret, {
            paymentMethodType: 'Card',
            paymentMethodData: {
              billingDetails: {
                name: selector?.residentUserData?.fullName ?? '',
                email: selector?.residentUserData?.email ?? '',
              },
            },
          });

          setLoading(false);

          if (error) {
            Alert.alert('Payment Failed', error.message);
          } else if (paymentIntent) {
            dispatch(
              setShowToast({
                type: AppStrings.ToastType.success,
                message: 'Payment Completed Successfully.',
              }),
            );
            if (id) {
              props?.navigation?.pop(2);
            } else {
              props?.navigation?.goBack();
            }
          }
        },
      );
    } catch (err) {
      setLoading(false);
      Alert.alert('Error', 'Something went wrong.');
    }
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
        text={'Payment'}
      />

      <View style={styles.cardContainer}>
        <Text style={styles.label}>Enter Card Information</Text>

        <CardForm
          cardStyle={{
            backgroundColor: '#000000',
            textColor: '#ffffff',
          }}
          onFormComplete={details => setCardDetails(details)}
          style={{
            height: normalized(275),

            marginTop: 10,
            borderEndColor: 'red',
            borderWidth: 4,
          }}
        />
      </View>

      <View style={{marginHorizontal: normalized(80)}}>
        <CustomButton
          text={'Pay Now'}
          onPress={handlePayPress}
          loading={loading}
          disabled={!cardDetails?.complete || loading}
        />
      </View>
    </View>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    title: {
      fontSize: normalized(26),
      fontWeight: '700',
      marginBottom: normalized(20),
    },
    cardContainer: {
      padding: normalized(18),
      borderRadius: normalized(12),
      marginBottom: normalized(30),
    },
    label: {
      fontSize: normalized(16),
      fontWeight: '600',
      marginBottom: normalized(8),
      color: colors.Heading_Txt,
    },
    payBtn: {
      paddingVertical: normalized(16),
      borderRadius: normalized(10),
      alignItems: 'center',
    },
    payBtnText: {
      fontSize: normalized(18),
      fontWeight: '700',
      color: 'white',
    },
  });
