import React, {useEffect, useMemo, useState} from 'react';
// import CardScanner from 'rn-card-scanner';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {FormProvider, useForm} from 'react-hook-form';
import CreditCardForm, {FormModel} from 'rn-credit-card';
import {useDispatch, useSelector} from 'react-redux';
import {
  AppColors,
  AppFonts,
  AppHorizontalMargin,
  hv,
  normalized,
  ScreenProps,
} from '../../Utils/AppConstants';
import useStripeManager from '../../Hooks/useStripeManager';
import {setIsLoader, setShowToast} from '../../Redux/AppReducers';
import CommonDataManager from '../../Utils/CommonManager';
import {AppStrings} from '../../Utils/AppStrings';
import CustomHeader from '../Components/CustomHeader';
import {AppStyles} from '../../Utils/AppStyles';
import CustomButton from '../Components/CustomButton';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppRootStore} from '../../Redux/AppStore';
import LottieView from 'lottie-react-native';

const PaymentScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector?.themeColors;
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const appStyles = useMemo(() => AppStyles(colors), [colors]);
  const dispatch = useDispatch();
  const [zipCode, setZipCode] = useState('');
  const [scan, setScan] = useState(false);
  const {completeTransaction} = useStripeManager();
  const releaseId = 30;

  const formMethods = useForm<FormModel>({
    mode: 'onBlur',
    defaultValues: {
      holderName: '',
      cardNumber: '',
      expiration: '',
      cvv: '',
    },
  });

  const orderCardValues = (selectedCard: any) => {
    const splitDate = selectedCard?.expiration.split('/');
    return {
      'card[number]': selectedCard?.cardNumber,
      'card[exp_month]': splitDate[0],
      'card[exp_year]': splitDate[1],
      'card[cvc]': selectedCard.cvv,
    };
  };

  const {handleSubmit, formState, setValue, reset} = formMethods;

  const submitPayment = async (model: FormModel) => {
    dispatch(setIsLoader(true));
    let updatedCard: any = {
      ...model,
      cardId: CommonDataManager.getSharedInstance().makeid(4),
    };

    dispatch(setIsLoader(true));

    completeTransaction(orderCardValues(model), releaseId, (resp: any) => {
      console.log('Payment Resp --->>>   ', resp);

      if (resp?.status) {
        dispatch(
          setShowToast({
            type: AppStrings.ToastType.success,
            message: 'Payment Successful',
          }),
        );
        props?.navigation?.goBack();
      }
      dispatch(setIsLoader(false));
    });
  };

  ///////

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insects.top - normalized(Platform.OS == 'ios' ? 15 : 0),
          paddingBottom: Platform.OS == 'android' ? insects.bottom : 0,
        },
      ]}>
      <SafeAreaView />
      <View
        style={{
          marginHorizontal: AppHorizontalMargin,
          marginBottom: normalized(20),
        }}>
        <CustomHeader
          text={'Payment'}
          onBackPress={() => {
            props?.navigation?.goBack();
          }}
        />
      </View>

      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? hv(35) : hv(30)}>
        <ScrollView
          style={styles.mainCont}
          showsVerticalScrollIndicator={false}>
          <KeyboardAvoidingView
            style={{flex: 1}}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? hv(35) : hv(30)}>
            <FormProvider {...formMethods}>
              {/* {scan ? (
                <View style={styles.scanCont}>
                  <CardScanner
                    style={{height: '100%', width: '100%'}}
                    didCardScan={response => {
                      setValue(
                        'cardNumber',
                        cardNumberConverter(String(response?.cardNumber)),
                      );
                      setValue('holderName', response?.holderName || '');
                      setValue(
                        'expiration',
                        response?.expiryMonth && response?.expiryYear
                          ? `${response?.expiryMonth}/${response?.expiryYear}`
                          : '',
                      );
                      setScan(false);
                    }}
                  />
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    setScan(true);
                  }}
                  activeOpacity={1}
                  style={styles.cameraIconCont}>
                  <Image source={AppImages.Products.scan} />
                </TouchableOpacity>
              )} */}
              <CreditCardForm
                LottieView={LottieView}
                formOnly={scan}
                overrides={{
                  labelText: {
                    color: colors.Heading_Txt,
                  },
                  labelContainer: {
                    backgroundColor: colors.Background,
                  },
                  inputLabel: {
                    color: 'white',
                  },
                }}
                inputColors={{
                  focused: colors.Heading_Txt,
                  errored: AppColors.ToastColors.Error,
                  regular: colors.Grey_2,
                }}
              />

              {formState.isValid && (
                <CustomButton
                  text={'Pay Now'}
                  onPress={handleSubmit(submitPayment)}
                />
              )}
            </FormProvider>
          </KeyboardAvoidingView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    containerStyle: {
      flex: 1,
      paddingHorizontal: AppHorizontalMargin,
    },
    paymentBtn: {
      marginBottom: normalized(20),
      width: normalized(300),
      height: normalized(50),
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      borderRadius: normalized(11),
    },
    paymentBtnTxt: {
      fontSize: normalized(14),
      fontWeight: '500',
    },
    cardMainStyle: {
      width: '80%',
      height: 50,
      marginVertical: 20,
      alignSelf: 'center',
    },
    cardStyle: {
      backgroundColor: AppColors.White,
      borderColor: AppColors.Grey_2,
      borderRadius: normalized(5),
      color: colors.Background,
      // placeholderColor: AppColors.Grey_2,
    },
    singleBtn: {
      height: normalized(20),
      width: normalized(20),
      tintColor: AppColors.Grey_2,
    },
    bottomCont: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: hv(7),
    },
    sideTxt: {
      fontSize: normalized(15),
      color: AppColors.Grey_2,
      fontWeight: '500',
    },
    childCont: {
      flexDirection: 'row',
      marginVertical: normalized(5),
    },

    mainCont: {
      flex: 1,
      marginHorizontal: normalized(25),
    },
    submitCont: {
      flexDirection: 'row',
      gap: normalized(10),
      // marginTop: normalized(-25),
    },
    scanCont: {
      height: normalized(200),
      width: normalized(300),
      alignSelf: 'center',
      marginBottom: normalized(20),
    },
    cameraIconCont: {
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: normalized(20),
      tintColor: AppColors.ToastColors.Error,
    },

    deliveryCont: {
      backgroundColor: AppColors.Grey_2,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      maxHeight: hv(80),
      padding: normalized(10),
      borderRadius: normalized(8),
      marginTop: 10,
      borderWidth: 1,
      borderColor: AppColors.Grey_2,
    },
    addressTxt: {
      fontSize: normalized(12),
      fontWeight: '400',
      color: AppColors.Black,
      marginVertical: 4,
    },
    addPaymentBtn: {
      textDecorationLine: 'underline',
      color: AppColors.ToastColors.Alarm,
      fontSize: normalized(15),
      fontWeight: '500',
      marginVertical: 5,
    },
    emptyListCont: {
      height: Dimensions.get('screen').height - 200,
      justifyContent: 'center',
      alignItems: 'center',
    },
    ///////
    title: {
      fontSize: 18,
      color: AppColors.Black,
    },
    detailContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: hv(8),
    },
    locationTxt: {
      fontSize: 14,
      color: 'grey',
      paddingRight: normalized(50),
    },
    textInputCont: {
      flex: 1,
      flexDirection: 'row',
      alignSelf: 'center',
      borderWidth: 1,
      borderRadius: normalized(7),
      height: normalized(50),
      alignItems: 'center',
      borderColor: AppColors.Grey_2,
      paddingLeft: normalized(5),
      marginTop: normalized(5),
    },
    error: {
      color: AppColors.ToastColors.Error,
      fontSize: normalized(13),
    },
    emptyTxt: {
      textAlign: 'center',
      fontFamily: AppFonts.UbuntuMedium,
      fontSize: normalized(14),
      fontWeight: '400',
      color: AppColors.Black,
      marginVertical: hv(16),
    },
  });

export default PaymentScreen;
