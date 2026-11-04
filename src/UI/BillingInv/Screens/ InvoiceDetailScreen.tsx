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
import {
  AppColors,
  AppFonts,
  AppHorizontalMargin,
  normalized,
  ScreenProps,
  ScreenSize,
} from '../../../Utils/AppConstants';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../../Redux/AppStore';
import {AppStyles} from '../../../Utils/AppStyles';
import CustomHeader from '../../Components/CustomHeader';
import {apiHandler} from '../../../Network/Services/ApiHandler';
import {Base_Url, ENDPOINTS} from '../../../Network/Urls';
import {setShowToast} from '../../../Redux/AppReducers';
import {AppStrings} from '../../../Utils/AppStrings';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {
  capitalizeEachWord,
  formatAmountToUSD,
  formatStatus,
  getErrorMessage,
  getStatusColor,
} from '../../../Utils/Helper';
import CustomButton from '../../Components/CustomButton';
import {handleFileDownload} from '../../../Utils/DownloadHelper';
import moment from 'moment';
import {paymentIntentReq} from '../../../Network/Services/StripeServices';
import {
  initPaymentSheet,
  presentPaymentSheet,
} from '@stripe/stripe-react-native';
import {Routes} from '../../../Utils/Routes';
import {useIsFocused} from '@react-navigation/native';
import PdfModal from '../../Components/PdfModal';
import {getAccessToken} from '../../../Network/Services/AuthTokenService';
import {useDeepLinkGuard} from '../../../Hooks/DeepLinkGuard';
import {PaymentAlert} from '../../Components/ConfirmationModal';
import PayInvoiceModal from '../Component/BillingPayModal';

const InvoiceDetailScreen = (props: ScreenProps) => {
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
  const [isLoader, setIsLoader] = useState(false);
  const [data, setData] = useState<any>({});
  const invoiceNo = props?.route?.params?.item?.id;
  const isFocused = useIsFocused();
  const [pdfLocalPath, setPdfLocalPath] = useState<string | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showPayModal, setshowPayModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState({
    isVisible: false,
    url: '',
  });

  const {isBlocked} = useDeepLinkGuard(userData);
  if (isBlocked) {
    return (
      <View style={[styles.container, styles.loaderCont]}>
        <ActivityIndicator color={colors.Primary} size="large" />
      </View>
    );
  }

  useEffect(() => {
    if (isFocused) {
      fetchInvoiceDetail();
    }
  }, [isFocused, invoiceNo]);
  const fetchInvoicePdf = async () => {
    if (!invoiceNo) return;
    const token = await getAccessToken('DAM');
    if (!token) console.log('No DAM token found');
    setIsPdfLoading(true);
    try {
      const downloadUrl = `${Base_Url}${ENDPOINTS.invoicePDF}?invoiceId=${invoiceNo}`;

      const res = await ReactNativeBlobUtil.config({
        fileCache: true,
        appendExt: 'pdf',
      }).fetch('GET', downloadUrl, {
        Authorization: `Bearer ${token}`,
      });
      setPdfLocalPath(res.path());
      setPdfLocalPath(res.path());

      setShowPdfModal({
        isVisible: true,
        url: res.path(),
      });
    } catch (err) {
      console.log('Failed to fetch invoice PDF:', err);
    } finally {
      setIsPdfLoading(false);
    }
  };

  const fetchInvoiceDetail = () => {
    setIsLoader(true);

    apiHandler({
      endpoint: ENDPOINTS.getInvoiceDetail,
      method: 'GET',
      queryParams: {id: invoiceNo},
      authContext: 'DAM',
      onComplete: (resp: any) => {
        if (resp?.status) {
          console.log(' Invoice detail list ', resp);
          setIsLoader(false);
          setData(resp?.data?.data);
        } else {
          setIsLoader(false);
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

  const onDownload = async (attachments: any) => {
    const token = await getAccessToken('DAM');
    await handleFileDownload(attachments, {token}, dispatch);
  };
  const onPayment = async (invoiceId: any, amount: number) => {
    try {
      const isZero = String(amount) === '0.00';
      const isMinimum = Number(amount) > 0 && Number(amount) < 0.5;

      if (isMinimum) {
        PaymentAlert.show('Sorry', 'this amount cannot be processed');
        return;
      }
      setshowPayModal(false);
      setPaymentLoading(true);
      await paymentIntentReq(
        {invoiceId: invoiceId, amount: amount},
        'DAM',
        ENDPOINTS.policeDutyPaymentIntent,
        async (response: any) => {
          console.log('paymentIntent API Response:', response);
          const {error} = await initPaymentSheet({
            merchantDisplayName: 'Police Duty Payment',
            paymentIntentClientSecret: response?.clientSecret,
            allowsDelayedPaymentMethods: false,
          });

          if (!error) {
            openPaymentSheet();
          } else {
            PaymentAlert.show('Error', error.message);
          }
        },
      );
    } catch (err) {
      console.log('PaymentSheet Init Error:', err);

      PaymentAlert.show(
        'Error',
        'Something went wrong initializing payment sheet.',
      );
    } finally {
      setPaymentLoading(false);
    }
    // } else {
    //   props?.navigation?.navigate(Routes.Payment.paymentScreen, {
    //     invoiceNo: invoiceNo,
    //   });
    // }
  };

  const openPaymentSheet = async () => {
    const {error} = await presentPaymentSheet();

    if (error) {
      PaymentAlert.show('Payment Failed', error.message);
    } else {
      // Alert.alert('Success', 'Payment completed!');
      PaymentAlert.show('Success', 'Payment completed!.');
      fetchInvoiceDetail();
      fetchInvoicePdf();
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
        text={props?.route?.params?.item?.invoiceNumber}
      />

      {isLoader ? (
        <View style={styles.loaderCont}>
          <ActivityIndicator size={'large'} color={colors.Primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{flex: 1}}
          contentContainerStyle={{
            paddingHorizontal: AppHorizontalMargin,
            paddingTop: normalized(20),
          }}>
          {/* <View style={styles.itemCont}>
            <Text style={styles.item_Heading}>Bill To</Text>
            <Text style={styles.valueTxt}>{data?.clientName}</Text>
            <Text style={styles.valueTxt}>{data?.client?.email}</Text>
          </View> */}

          {/* <View style={{height: normalized(12)}} /> */}

          <View style={styles.itemCont}>
            <View style={styles.rowCont}>
              <Text style={styles.item_Heading}>Invoice Details</Text>
              <View
                style={[
                  styles.statusCont,
                  {
                    backgroundColor: getStatusColor(data?.status, colors),
                  },
                ]}>
                <Text style={styles.statusTxt}>
                  {formatStatus(data?.status)}
                </Text>
              </View>
            </View>
            <View style={styles.rowCont}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Invoice No:</Text>
                <Text style={styles.valueTxt}>{data?.invoiceNumber}</Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Created At:</Text>
                <Text style={styles.valueTxt}>
                  {moment(data?.createdAt).format('LL')}
                </Text>
              </View>
            </View>
            <View style={styles.rowCont}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Due Date:</Text>
                <Text style={styles.valueTxt}>
                  {moment(data?.duedate).format('LL')}
                </Text>
              </View>

              <View style={styles.item}>
                <Text style={styles.keyTxt}>Category</Text>
                <Text style={styles.valueTxt}>{data?.category?.name}</Text>
              </View>
            </View>
            <View style={styles.rowCont}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Payment Method</Text>

                <Text style={styles.valueTxt}>
                  {capitalizeEachWord(data?.paymentMethod ?? 'N/A')}
                </Text>
              </View>
              {/* <Text style={styles.valueTxt}>Discount:</Text>
              <Text style={styles.valueTxt}>
                {formatAmountToUSD(data?.discountAmount)}
              </Text> */}
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Issue Date:</Text>
                <Text style={styles.valueTxt}>
                  {moment(data?.issueDate).format('LL')}
                </Text>
              </View>
            </View>
            <View style={styles.rowCont}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Sent At:</Text>
                <Text style={styles.valueTxt}>
                  {moment(data?.sentAt ?? 'N/A').format('LL')}
                </Text>
              </View>
              {data?.paidAt && (
                <View style={styles.item}>
                  <Text style={styles.keyTxt}>Paid At:</Text>
                  <Text style={styles.valueTxt}>
                    {moment(data?.paidAt).format('LL')}
                  </Text>
                </View>
              )}
            </View>
            {/* <View style={styles.rowCont}>
              <Text style={styles.valueTxt}>Discount:</Text>
              <Text style={styles.valueTxt}>
                {formatAmountToUSD(data?.discountAmount)}
              </Text>
            </View> */}

            {/* <View style={styles.rowCont}>
              <Text style={styles.valueTxt}>Finance Charge:</Text>
              <Text style={styles.valueTxt}>
                {formatAmountToUSD(data?.financeCharge)}
              </Text>
            </View> */}
          </View>

          {/* <View style={{height: normalized(12)}} />

          <View style={styles.itemCont}>
            <Text style={styles.item_Heading}>Slip Entries</Text>
            {data?.slips?.map((item: any, index: any) => (
              <>
                <View style={styles.rowCont}>
                  <Text style={styles.valueTxt}>Qty</Text>
                  <Text style={styles.valueTxt}>{item?.quantity}</Text>
                </View>
                <View style={styles.rowCont}>
                  <Text style={styles.valueTxt}>Unit Price</Text>
                  <Text style={styles.valueTxt}>
                    {formatAmountToUSD(item?.unit_price)}
                  </Text>
                </View>
                <View style={styles.rowCont}>
                  <Text style={styles.valueTxt}>Adjustment</Text>
                  <Text style={styles.valueTxt}>
                    {formatAmountToUSD(item?.adjustment)}
                  </Text>
                </View>
                <View style={styles.rowCont}>
                  <Text style={styles.valueTxt}>Markup %</Text>
                  <Text style={styles.valueTxt}>
                    {`${item?.markup_percent} %`}
                  </Text>
                </View>
                <View style={styles.rowCont}>
                  <Text style={styles.valueTxt}>Tax %</Text>
                  <Text style={styles.valueTxt}>{`${item?.tax_rate} %`}</Text>
                </View>
                <View style={styles.rowCont}>
                  <Text style={styles.valueTxt}>Billing Status</Text>
                  <Text style={styles.valueTxt}>
                    {capitalizeEachWord(item?.billingStatus)}
                  </Text>
                </View>
                <View style={styles.rowCont}>
                  <Text style={styles.valueTxt}>Total With Tax</Text>
                  <Text style={styles.valueTxt}>
                    {formatAmountToUSD(item?.total_with_tax)}
                  </Text>
                </View>

                {data?.slips?.length != index + 1 && (
                  <View style={styles.divider} />
                )}
              </>
            ))}
          </View> */}

          <View style={{height: normalized(12)}} />

          <View style={styles.itemCont}>
            <Text style={styles.item_Heading}>Summary</Text>
            <View style={styles.rowCont}>
              <Text style={styles.valueTxt}>Subtotal:</Text>
              <Text style={styles.valueTxt}>
                {formatAmountToUSD(data?.subtotal)}
              </Text>
            </View>
            <View style={styles.rowCont}>
              <Text style={styles.valueTxt}>
                {`Interest (${data?.category?.interestRate ?? 0}%) :`}
              </Text>
              <Text style={styles.valueTxt}>
                {formatAmountToUSD(`${data?.interestAmount}`)}
              </Text>
            </View>
            {/* <View style={styles.rowCont}>
              <Text style={styles.valueTxt}>Finance Charge:</Text>
              <Text style={styles.valueTxt}>
                {formatAmountToUSD(data?.financeCharge)}
              </Text>
            </View> */}

            <View style={styles.divider} />

            <View style={styles.rowCont}>
              <Text style={[styles.nameTxt, {fontFamily: AppFonts.UbuntuBold}]}>
                Total:
              </Text>
              <Text style={styles.valueTxt}>
                {formatAmountToUSD(data?.total)}
              </Text>
            </View>
            <View style={styles.rowCont}>
              <Text style={[styles.keyTxt, {fontFamily: AppFonts.UbuntuBold}]}>
                Amount Paid:
              </Text>
              <Text style={styles.valueTxt}>
                {formatAmountToUSD(data?.amountPaid)}
              </Text>
            </View>
            <View style={styles.rowCont}>
              <Text
                style={[
                  styles.nameTxt,
                  {fontFamily: AppFonts.UbuntuBold, color: AppColors.Error},
                ]}>
                Balance Due:
              </Text>
              <Text
                style={[
                  styles.nameTxt,
                  {fontFamily: AppFonts.UbuntuBold, color: AppColors.Error},
                ]}>
                {formatAmountToUSD(data?.balanceDue)}
              </Text>
            </View>
          </View>

          <View style={styles.btnRow}>
            <CustomButton
              style={styles.btn}
              text={'Download'}
              onPress={() => {
                onDownload({
                  url: `${ENDPOINTS.invoicePDF}?invoiceId=${invoiceNo}`,
                  name: data?.invoiceNumber,
                  isCompleteUrl: false,
                  requiresAuth: true,
                });
              }}
            />

            <CustomButton
              style={styles.btn}
              text="View Invoice"
              loading={isPdfLoading}
              disabled={isPdfLoading}
              onPress={async () => {
                await fetchInvoicePdf();
              }}
            />
          </View>

          {data?.status !== 'paid' && (
            <CustomButton
              onPress={() => setshowPayModal(true)}
              style={styles.paynowBtn}
              text="Pay Now"
              loading={paymentLoading}
              disabled={paymentLoading}
            />
          )}

          <View style={{height: normalized(25)}} />
        </ScrollView>
      )}
      <PdfModal
        isBilling
        isVisible={showPdfModal?.isVisible}
        url={showPdfModal?.url}
        onClose={() => setShowPdfModal({isVisible: false, url: ''})}
      />
      <PayInvoiceModal
        visible={showPayModal}
        balanceDue={data?.balanceDue}
        loading={paymentLoading}
        onClose={() => setshowPayModal(false)}
        onPay={amount => onPayment(data?.id, amount)}
      />
    </View>
  );
};

export default InvoiceDetailScreen;

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
      flex: 1,
      height: normalized(1),
      backgroundColor: colors.Grey_2,
      marginVertical: normalized(8),
    },
    btnRow: {
      // width: '95%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(12),
      marginTop: normalized(12),
      justifyContent: 'center',
    },
    btn: {
      width: ScreenSize.width * 0.43,
      marginTop: 0,
    },
    paynowBtn: {
      width: '98%',
      height: normalized(45),
      backgroundColor: colors.Background,
      borderWidth: 2,
      borderRadius: normalized(12),
      borderColor: colors.BorderColor,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      marginTop: normalized(12),
    },
    paynowBtnTxt: {
      color: colors.Primary,
      fontFamily: AppFonts.UbuntuBold,
      fontSize: normalized(18),
    },
  });
