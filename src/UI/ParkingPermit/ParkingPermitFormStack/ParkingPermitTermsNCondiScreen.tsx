import {
  ActivityIndicator,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ScrollView,
  useWindowDimensions,
  Alert,
} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {
  AppHorizontalMargin,
  normalized,
  PP_STEPPER_LIST,
  ScreenProps,
} from '../../../Utils/AppConstants';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../../Redux/AppStore';
import {AppStyles} from '../../../Utils/AppStyles';
import {apiHandler} from '../../../Network/Services/ApiHandler';
import {
  clearParkingPermitDraft,
  setofflineParkingPermitReq,
  setShowToast,
} from '../../../Redux/AppReducers';
import {
  AppStrings,
  AsyncKeyStrings,
  Empty_Screen_Type,
} from '../../../Utils/AppStrings';
import {ENDPOINTS} from '../../../Network/Urls';
import Stepper from '../../Components/Stepper';
import {
  base64ToPng,
  copyAttachmentToAppStorage,
  getErrorMessage,
  makeId,
} from '../../../Utils/Helper';
import CustomCheckBox from '../../Components/CustomCheckBox';
import {setDataInAsync} from '../../../Utils/AsyncStorage';
import SignatureScreen from '../SignatureScreen';
import RenderHTML from 'react-native-render-html';
import CustomButton from '../../Components/CustomButton';
import EmptyComp from '../../Components/EmptyComp';
import SimpleButton from '../../Components/SimpleButton';
import {paymentIntentReq} from '../../../Network/Services/StripeServices';
import {
  initPaymentSheet,
  presentPaymentSheet,
} from '@stripe/stripe-react-native';
import {appendGuestParkingSession} from '../../../Network/Services/ParkingSessionService';
import {Routes} from '../../../Utils/Routes';
import {PaymentAlert} from '../../Components/ConfirmationModal';

const ParkingPermitTermsNCondiScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const dispatch = useDispatch();
  const {width} = useWindowDimensions();

  const [signature, setSignature] = useState<any>(null);
  const [signatureError, setSignatureError] = useState(false);
  const [agree, setAgree] = useState(false);
  const [agreeError, setAgreeError] = useState(false);

  const [paymentLoading, setpaymentLoading] = useState(false);
  const [termsLoading, setTermsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [termsHtml, setTermsHtml] = useState('');

  const selector: any = useSelector(
    (state: AppRootStore) => state.SliceReducer,
  );
  const isOnline = selector?.isNetConnected;
  const colors = selector?.themeColors;
  const userData = selector?.residentUserData;

  const draftData = selector?.parkingPermitDraft;
  const association = draftData?.association;
  const isCompany = props?.route?.params?.isCompany;
  // console.log('is user data ?', draftData, association, isCompany);

  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  useEffect(() => {
    // console.log('draftData.termsHtml', draftData.termsHtml);
    if (draftData.termsHtml === undefined) {
      fetchTermsAndConditions();
    } else {
      setTermsHtml(draftData.termsHtml);
    }
  }, []);

  const onPayment = async (payload: any, amount?: any, item?: any) => {
    setpaymentLoading(true);
    console.log('payload ==0===. ', payload, amount);

    const isZero = String(amount) === '0.00';
    const isMinimum = Number(amount) > 0 && Number(amount) < 0.5;

    if (isMinimum) {
      PaymentAlert.show('Sorry', ' this amount cannot be processed');
      return;
    }

    try {
      await paymentIntentReq(
        payload,
        'RESIDENT',
        ENDPOINTS.parkingSessionPaymentIntent,
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
                if (!userData) {
                  appendGuestParkingSession(
                    dispatch,
                    selector?.guestParkingSessions ?? [],
                    item,
                  );
                }
                props?.navigation?.pop(5);
                dispatch(clearParkingPermitDraft());
                dispatch(
                  setShowToast({
                    type: AppStrings.ToastType.success,
                    message: 'Your session is created ',
                  }),
                );
                props?.navigation?.goBack();
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

  const onSubmit = () => {
    let isValid = true;

    if (!signature) {
      setSignatureError(true);
      isValid = false;
    } else {
      setSignatureError(false);
    }

    if (!agree) {
      setAgreeError(true);
      isValid = false;
    } else {
      setAgreeError(false);
    }

    if (!isValid) return;

    const saveOfflineRequest = async () => {
      const copiedSignature = signature
        ? await copyAttachmentToAppStorage(signature)
        : signature;

      const copiedVehicles = await Promise.all(
        (draftData?.vehicles ?? []).map(async (v: any) => {
          const copiedImage = v?.image
            ? await copyAttachmentToAppStorage(v.image)
            : v?.image;
          return {
            ...v,
            image: copiedImage,
          };
        }),
      );

      const offlinePayload = {
        id: Date.now(),
        // userData?.firstName,
        //         middleName,
        //         lastName,
        //         email,
        //         phoneNumber,
        address: userData?.address,
        // city,
        // state,
        addressCoords: userData?.addressCoords || {},
        termsAgreed: agree,
        // driverLicense: copiedDriverLicense,
        signature: copiedSignature,
        vehicles: copiedVehicles,
        source: 'mobile',
        platform: Platform.OS,
      };

      const parkingData = [
        offlinePayload,
        ...(selector?.offlineParkingPermitRequests ?? []),
      ];

      await setDataInAsync(AsyncKeyStrings.ParkingPermitRequests, parkingData);

      dispatch(setofflineParkingPermitReq(parkingData));

      dispatch(
        setShowToast({
          type: AppStrings.ToastType.success,
          message: 'Request Saved.',
        }),
      );

      props?.navigation?.goBack();
    };

    if (!isOnline) {
      saveOfflineRequest().catch(() => {
        dispatch(
          setShowToast({
            type: AppStrings.ToastType.error,
            message: 'Unable to save offline request.',
          }),
        );
      });
      return;
    }

    const {lat, lng} = userData?.addressCoords || {};

    const formData = new FormData();

    formData.append('firstName', draftData.firstName ?? userData?.firstName);
    formData.append('middleName', draftData.middleName ?? userData?.middleName);
    formData.append('lastName', draftData.lastName ?? userData?.lastName);
    formData.append('email', draftData.email ?? userData?.email);
    formData.append(
      'phoneNumber',
      draftData.phoneNumber ?? userData?.phoneNumber,
    );
    formData.append('address', userData?.address);
    formData.append('state', draftData?.vehicle?.state);
    formData.append('city', userData?.city);
    formData.append('zipCode', userData?.zipCode);
    formData.append('addressCoords', JSON.stringify({lat: lat, lng: lng}));
    if (!isCompany) {
      formData.append('duration', draftData.details.duration);
    }
    formData.append('termsAgreed', agree);

    formData.append('signature', signature);
    formData.append('parkingSite', String(draftData?.site?.id ?? ''));
    if (draftData?.zoneId != null) {
      formData.append('zone', String(draftData.zoneId));
    }
    formData.append(
      'permitType',
      String(draftData?.permitType?.id ?? association?.permitType?.id ?? ''),
    );
    formData.append('termsChecked', agree);
    if (isCompany) {
      formData.append('association', String(association?.id ?? ''));
    }

    if (userData?.id) {
      formData.append('resident', userData?.id);
    }
    if (draftData?.details?.startDate) {
      formData.append('startDate', draftData.details.startDate);
    }

    const permitTypeStr = draftData?.permitType?.type;

    if (permitTypeStr === 'worker') {
      formData.append('employerName', draftData?.details?.employerName ?? '');
      formData.append('workAddress', draftData?.details?.workAddress ?? '');
    }

    if (permitTypeStr === 'residential') {
      if (draftData?.details?.docType) {
        formData.append(
          'proofOfResidency[documentType]',
          draftData.details.docType,
        );
      }
      if (draftData?.details?.file) {
        formData.append('proofOfResidency[fileUrl]', draftData.details.file);
      }
    }

    if (draftData?.details?.hours) {
      formData.append('hours', String(draftData.details.hours));
    }
    if (draftData?.details?.minutes) {
      formData.append('minutes', String(draftData.details.minutes));
    }
    formData.append('source', 'mobile');
    formData.append('platform', Platform.OS);

    const keyMap = {
      model: 'vehicleModel',
      makeOf: 'makeOfVehicle',
      color: 'vehicleColor',
      license: 'licensePlate',
      state: 'vehicleState',
    } as const;
    const ownerKeyMap = {
      ownerName: 'ownerName',
      ownerPhoneNumber: 'ownerPhoneNumber',
      ownerEmail: 'ownerEmail',
    } as const;

    draftData?.vehicles.forEach(({errors, image, ...v}: any, i: any) => {
      Object.entries(keyMap).forEach(([k, api]) => {
        const val = v[k as keyof typeof v];

        if (val != null && String(val).length) {
          formData.append(`vehicles[${i}][${api}]`, String(val));
        }
      });
      const sameOwner = v.ownerSameAsApplicant !== false;
      formData.append(
        `vehicles[${i}][ownerSameAsApplicant]`,
        String(sameOwner),
      );
      if (!sameOwner) {
        Object.entries(ownerKeyMap).forEach(([k, api]) => {
          const val = v[k];
          if (val != null && String(val).trim().length) {
            formData.append(`vehicles[${i}][${api}]`, String(val).trim());
          }
        });
      }

      if (isCompany) {
        formData.append(
          `vehicles[${i}][parkingSite]`,
          String(v.parkingSite ?? ''),
        );
      }

      if (
        (draftData?.permitType?.category === 'contract' || isCompany) &&
        image
      ) {
        formData.append(`vehicles[${i}][carRegistration]`, {
          uri: image.uri,
          type: image.type || 'application/octet-stream',
          name: image.filename || 'attachment',
        } as any);
      }
    });
    console.log('formData', formData);
    setSubmitLoading(true);
    apiHandler({
      endpoint:
        draftData?.permitType?.category === 'PAYG'
          ? ENDPOINTS.ParkingSession
          : ENDPOINTS.parkingPermit,
      method: 'POST',
      isFormData: true,
      useRecaptcha: true,
      payload: formData,
      authContext: userData ? 'RESIDENT' : undefined,

      onComplete: (resp: any) => {
        setSubmitLoading(false);
        console.log(resp, 'parking permit response');
        if (resp?.status) {
          if (draftData?.permitType?.category === 'PAYG') {
            onPayment(
              {sessionId: resp?.data?.data?.sessionId},
              resp?.data?.data?.amount,
              resp?.data?.data,
            );
            return;
          }
          props?.navigation?.pop(5);
          dispatch(clearParkingPermitDraft());
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.success,
              message: resp?.message
                ? resp?.message
                : 'Request Submit Successfully',
            }),
          );

          props?.navigation?.goBack();
        } else {
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

  const fetchTermsAndConditions = () => {
    setTermsLoading(true);

    apiHandler({
      endpoint: ENDPOINTS.parkingPermitTerms,
      method: 'GET',
      authContext: 'RESIDENT',
      onComplete: (resp: any) => {
        setTermsLoading(false);

        console.log('terms and condition', resp);

        if (resp?.status) {
          setTermsHtml(resp?.data?.data?.submissionFormTerms ?? '');
        } else {
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.error,
              message: resp?.error ?? resp?.message ?? 'Something went wrong',
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
          paddingBottom: Platform.OS === 'android' ? insects.bottom : 0,
        },
      ]}>
      <StatusBar
        barStyle={selector?.isDarkTheme ? 'light-content' : 'dark-content'}
      />

      <Stepper
        list={PP_STEPPER_LIST}
        completedSteps={[2]}
        activeStep={userData ? PP_STEPPER_LIST[4] : PP_STEPPER_LIST[3]}
        skipPrev={!!userData}
        isLastItem={true}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {termsLoading ? (
          <View style={styles.loaderCont}>
            <ActivityIndicator size="large" color={colors.Primary} />
          </View>
        ) : (
          <View style={styles.contentCont}>
            <Text style={styles.descriptionTxt}>
              Review terms and conditions before submitting a request.
            </Text>

            <View style={styles.termsCont}>
              {termsHtml ? (
                <RenderHTML
                  contentWidth={width - AppHorizontalMargin * 2}
                  source={{html: termsHtml}}
                  baseStyle={{
                    color: colors.Heading_Txt,
                    fontSize: normalized(14),
                    lineHeight: normalized(21),
                  }}
                  tagsStyles={{
                    div: {
                      marginBottom: normalized(6),
                    },
                    span: {
                      color: colors.Heading_Txt,
                    },
                  }}
                />
              ) : (
                <View style={styles.loaderCont}>
                  <EmptyComp
                    type={Empty_Screen_Type.List}
                    subText="No Terms Found"
                  />
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.signatureCont}>
          <Text style={styles.Input_Heading}>Signature*</Text>

          <SignatureScreen
            onSignatureAdded={async (dataUrl: any) => {
              const fileUri = await base64ToPng(dataUrl);

              const filename =
                makeId(6) + fileUri.substring(fileUri.lastIndexOf('/') + 1);

              const fileType = filename?.split('.').pop();

              setSignature({
                uri: fileUri,
                type: `image/${fileType}`,
                name: filename || `photo.${fileType}`,
              });

              setSignatureError(false);
            }}
            isError={signatureError}
          />
        </View>

        <View style={styles.checkboxCont}>
          <CustomCheckBox
            checked={agree}
            onChange={(val: any) => {
              setAgree(val);
              setAgreeError(false);
            }}
            isError={agreeError}
          />

          <Text style={styles.Desc_Txt_N}>{'  I agree to the '}</Text>

          <Text style={[styles.Desc_Txt_N, {color: colors.Primary}]}>
            Terms & Conditions
          </Text>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.nextBtnCont}>
            <SimpleButton
              text={'Back'}
              onPress={() => props?.navigation?.goBack()}
              loading={false}
            />
          </View>
          <View style={styles.nextBtnCont}>
            <CustomButton
              text={userData ? 'Next' : 'Submit'}
              onPress={onSubmit}
              loading={submitLoading}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ParkingPermitTermsNCondiScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },

    scrollContent: {
      paddingHorizontal: AppHorizontalMargin,
      paddingBottom: normalized(30),
    },

    loaderCont: {
      minHeight: normalized(200),
      alignItems: 'center',
      justifyContent: 'center',
    },

    contentCont: {
      flex: 1,
    },

    descriptionTxt: {
      color: colors.Desc_Txt,
      fontSize: normalized(14),
      marginTop: normalized(12),
      marginBottom: normalized(10),
    },

    termsCont: {
      borderWidth: 1,
      borderColor: colors.BorderColor,
      borderRadius: normalized(12),
      padding: normalized(12),
      backgroundColor: colors.Background,
      marginBottom: normalized(20),
    },

    noTermsTxt: {
      color: colors.Desc_Txt,
      fontSize: normalized(14),
    },

    signatureCont: {
      marginTop: normalized(4),
    },

    checkboxCont: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: normalized(12),
    },
  });
