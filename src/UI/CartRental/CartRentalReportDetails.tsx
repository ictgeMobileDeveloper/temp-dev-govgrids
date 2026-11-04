import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  AppColors,
  AppFonts,
  normalized,
  ScreenProps,
} from '../../Utils/AppConstants';
import {useDispatch, useSelector} from 'react-redux';
import {AppStyles} from '../../Utils/AppStyles';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppRootStore} from '../../Redux/AppStore';
import CustomHeader from '../Components/CustomHeader';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../Network/Urls';
import {setShowToast, setIsLoader} from '../../Redux/AppReducers';
import {AppStrings} from '../../Utils/AppStrings';
import {
  capitalizeEachWord,
  formatAmountToUSD,
  getErrorMessage,
  getStatusColor,
  groupCommentsByDate,
} from '../../Utils/Helper';
import moment from 'moment';

import CustomButton from '../Components/CustomButton';
import FileViewer from '../Components/MediaPreviewModal';
import PdfIcon from '../Svg/PdfIcon';
import ImageIcon from '../Svg/ImageIcon';
import PlayIcon from '../Svg/VideoSVG';
import AudioIcon from '../Svg/AudioIcon';
import WordIcon from '../Svg/WordIcon';
import ExcelIcon from '../Svg/ExcelIcon';
import DocumentIcon from '../Svg/DocumentIcon';
import MailVector from '../Svg/MailVector';
import {
  IMAGE_EXTENSIONS,
  AUDIO_EXTENSIONS,
  VIDEO_EXTENSIONS,
} from '../ResidentIssuePortal/Components/FileListing';
import RequestCommentsSection from '../Components/RequestCommentsSection';
import {requestCommentsService} from '../../Network/Services/RequestCommentsService';
import {Routes} from '../../Utils/Routes';
import PdfModal from '../Components/PdfModal';
import {
  initPaymentSheet,
  presentPaymentSheet,
} from '@stripe/stripe-react-native';
import {paymentIntentReq} from '../../Network/Services/StripeServices';
import AnimatedChevron from '../Svg/CollapseExpandAnimated';
import CartItemAccordion from '../Components/CartDamageCard';
import {useSignedDocResolver} from '../../Hooks/getSignedUrl';
import CustomSwitcher from '../Components/CustomSwitcher';
import {useDeepLinkGuard} from '../../Hooks/DeepLinkGuard';
import SimpleButton from '../Components/SimpleButton';
import {PaymentAlert} from '../Components/ConfirmationModal';

const CartRentalReportDetail = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector?.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const dispatch = useDispatch();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [paymentLoading, setpaymentLoading] = useState(false);

  const routeName = props?.route?.name;

  const reference =
    props?.route?.params?.navigation ??
    (routeName === Routes.CartRental.DamageReportDetails
      ? 'CartDamage'
      : routeName === Routes.CartRental.ReturnReportDetails
      ? 'CartReturn'
      : undefined);

  const isCartDamage = reference === 'CartDamage';

  const urls = data?.files;

  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const viewerItem = viewerIndex !== null ? urls?.[viewerIndex] : null;

  const [showPdfModal, setShowPdfModal] = useState({
    isVisible: false,
    url: '',
  });

  // ---- comments (also come back on the same `data` object, no separate GET) ----
  const [commentLoading, setCommentLoading] = useState(false);
  const groupedComments = useMemo(
    () => groupCommentsByDate(data?.comments ?? []),
    [data?.comments],
  );
  const flatComments = useMemo(
    () =>
      Array.isArray(groupedComments)
        ? groupedComments.flatMap((item: any) =>
            Array.isArray(item?.[1]) ? item[1] : item,
          )
        : [],
    [groupedComments],
  );

  const requestId = props?.route?.params?.item?.id ?? props?.route?.params?.id;

  const {isBlocked} = useDeepLinkGuard(selector?.residentUserData);

  if (isBlocked) {
    return (
      <View style={[styles.container, styles.loaderCont]}>
        <ActivityIndicator color={colors.Primary} size="large" />
      </View>
    );
  }

  useEffect(() => {
    fetchReqDetail();
  }, [props?.route?.params?.refreshedAt]);

  const fetchReqDetail = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }

    apiHandler({
      endpoint: isCartDamage
        ? ENDPOINTS.cityCartDamageDetails
        : ENDPOINTS.cityCartReportDetails,
      method: 'GET',
      queryParams: {id: requestId},
      authContext: 'RESIDENT',
      onComplete: (resp: any) => {
        if (resp?.status) {
          setData(resp?.data?.data);
          setIsLoading(false);
          setRefreshing(false);
        } else {
          setIsLoading(false);
          setRefreshing(false);
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

  const onPayment = async (payload: any, amount?: any) => {
    console.log('payload ==0===. ', payload, amount);

    const isZero = String(amount) === '0.00';
    const isMinimum = Number(amount) > 0 && Number(amount) < 0.5;

    if (isMinimum) {
      PaymentAlert.show('Sorry', 'this amount cannot be processed');
      return;
    }
    setpaymentLoading(true);
    try {
      await paymentIntentReq(
        payload,
        'RESIDENT',
        ENDPOINTS.cityCartReportPaymentIntent,
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
                fetchReqDetail();
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

  const {resolveDocUrl} = useSignedDocResolver(
    {},
    'RESIDENT',
    ENDPOINTS.cityCartSignedUrl,
    '',
  );

  const onViewInvoice = (item: any) => {
    setInvoiceLoading(true);

    apiHandler({
      endpoint: ENDPOINTS.cityCartInvoice,
      method: 'GET',
      queryParams: {id: item?.invoice?.id},
      authContext: 'RESIDENT',
      onComplete: (resp: any) => {
        console.log('Invoice Response: ', resp);
        setInvoiceLoading(false);

        if (resp?.status && resp?.data?.signedURL) {
          setShowPdfModal({
            isVisible: true,
            url: resp.data.signedURL,
          });
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

  const onViewDocument = (index: number) => {
    setViewerIndex(index);
  };

  const paymentStatus = data?.payment?.paymentStatus ?? 'Unpaid';

  // ---- cart items list ----
  const cartItems = isCartDamage
    ? data?.items?.map((item: any) => ({
        ...item.cart,
        ...item,
      })) ?? []
    : data?.carts ?? [];

  // comments are hidden (not shown as locked/disabled) once the claim reaches a terminal status
  const requestStatus = data?.status?.toLowerCase();
  const isCommentBlocked = ['closed'].includes(requestStatus);

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
        text={isCartDamage ? 'Damage Claim Details' : 'Return Claim Details'}
      />
      {isLoading ? (
        <View style={styles.loaderCont}>
          <ActivityIndicator color={colors.Primary} size={'large'} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchReqDetail(true)}
              colors={[colors.Primary]}
              tintColor={colors.Primary}
            />
          }
          contentContainerStyle={{
            paddingHorizontal: normalized(20),
            paddingBottom: normalized(30),
          }}>
          <View style={{height: normalized(20)}} />

          <View style={styles.itemCont}>
            <Text style={styles.txt}>
              {isCartDamage ? 'Damage Claim Details' : 'Return Request Details'}
            </Text>
            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>
                  {isCartDamage ? 'Claim ID' : 'Return ID'}
                </Text>
                <Text style={styles.valueTxt}>{data?.requestId}</Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Cart Request:</Text>
                <TouchableOpacity
                  onPress={() => {
                    props?.navigation?.navigate(
                      Routes.CartRental.DetailScreen,
                      {
                        id: data?.cartRequest,
                      },
                    );
                  }}>
                  <Text
                    style={[
                      styles.valueTxt,
                      {
                        textDecorationLine: 'underline',
                        color: colors.randomColor.navy,
                      },
                    ]}>
                    {data?.cartRequestId}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Status</Text>
                <View
                  style={[
                    styles.statusCont,
                    {
                      backgroundColor: getStatusColor(data?.status, colors),
                      alignSelf: 'flex-start',
                    },
                  ]}>
                  <Text style={styles.statusTxt}>
                    {capitalizeEachWord(data?.status)}
                  </Text>
                </View>
              </View>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Submission Date</Text>
                <Text style={styles.valueTxt}>
                  {moment(data?.createdAt).format('LL')}
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Reason</Text>
                <Text style={styles.valueTxt}>{data?.reason}</Text>
              </View>
            </View>
          </View>

          <View style={{height: normalized(12)}} />
          {isCartDamage && (
            <View style={styles.itemCont}>
              <Text style={styles.txt}>Payment Information</Text>

              <View style={styles.row}>
                <View style={styles.item}>
                  <Text style={styles.keyTxt}>Payment Method</Text>
                  <Text style={styles.valueTxt}>
                    {data?.payment
                      ? capitalizeEachWord(data?.payment?.paymentMethod)
                      : 'N/A'}
                  </Text>
                </View>

                <View style={styles.item}>
                  <Text style={styles.keyTxt}>Payment Status</Text>
                  <View
                    style={[
                      styles.statusCont,
                      {
                        backgroundColor: getStatusColor(paymentStatus, colors),
                        alignSelf: 'flex-start',
                      },
                    ]}>
                    <Text style={styles.statusTxt}>
                      {capitalizeEachWord(paymentStatus)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.item}>
                  <Text style={styles.keyTxt}>Total Amount</Text>

                  <Text style={styles.valueTxt}>
                    {formatAmountToUSD(data?.payment?.totalAmount) ?? 'N/A'}
                  </Text>
                </View>
                <View style={styles.item}>
                  <Text style={styles.keyTxt}>Paid At</Text>
                  <Text style={styles.valueTxt}>
                    {data?.payment?.paidAt
                      ? moment(data.payment.paidAt).format('LLL')
                      : 'N/A'}
                  </Text>
                </View>
              </View>

              <View style={styles.row}>
                {data?.payment?.invoice && (
                  <View style={styles.item}>
                    <Text style={styles.keyTxt}>Invoice:</Text>
                    <TouchableOpacity
                      style={styles.docTapArea}
                      onPress={() => onViewInvoice(data?.payment)}>
                      <PdfIcon />

                      <Text style={styles.valueTxt}>
                        {data?.payment?.invoice?.invoiceNumber}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              {data?.payment?.paymentStatus?.toLowerCase() !== 'paid' &&
                data?.payment?.paymentMethod?.toLowerCase() === 'online' && (
                  <TouchableOpacity
                    activeOpacity={0.6}
                    style={styles.btn}
                    disabled={paymentLoading}
                    onPress={() =>
                      onPayment({id: data?.id}, data?.payment?.totalAmount)
                    }>
                    <Text style={styles.btnTxt}>Pay Now</Text>
                  </TouchableOpacity>
                )}
            </View>
          )}
          <View style={{height: normalized(12)}} />
          {/* ----------------------- Cart Items ----------------------- */}

          {cartItems?.length > 0 && (
            <>
              <View style={{height: normalized(12)}} />
              <Text style={styles.txt}>Cart Items</Text>
              <View style={{height: normalized(12)}} />

              {cartItems.map((cartItem: any, index: number) => (
                <View
                  key={cartItem?.id ?? index}
                  style={[
                    styles.cartItemBlock,
                    index > 0 && {marginTop: normalized(12)},
                  ]}>
                  <CartItemAccordion
                    cartItem={cartItem}
                    isCartDamage={isCartDamage}
                    colors={colors}
                    styles={styles}
                  />
                </View>
              ))}
            </>
          )}

          {/* ----------------------- Documents (signed URL view/download, FOIA pattern) ----------------------- */}
          {data && isCartDamage && (
            <>
              <View style={{height: normalized(12)}} />
              <View style={styles.itemCont}>
                <Text style={styles.nameTxt}>Uploaded Documents</Text>

                {urls?.length > 0 ? (
                  <>
                    {urls.map((item: any, index: number) => {
                      const type = item?.fileName?.split('.').pop();
                      return (
                        <View
                          key={index}
                          style={[styles.docBlock, {marginTop: normalized(8)}]}>
                          <TouchableOpacity
                            style={styles.docTapArea}
                            onPress={() => onViewDocument(index)}>
                            {type == 'pdf' ? (
                              <PdfIcon />
                            ) : IMAGE_EXTENSIONS.includes(type) ? (
                              <ImageIcon size={30} />
                            ) : VIDEO_EXTENSIONS.includes(type) ? (
                              <PlayIcon />
                            ) : AUDIO_EXTENSIONS.includes(type) ? (
                              <AudioIcon />
                            ) : type == 'doc' || type == 'docx' ? (
                              <WordIcon />
                            ) : type == 'eml' ? (
                              <MailVector />
                            ) : ['xls', 'xlsx', 'csv'].includes(type) ? (
                              <ExcelIcon />
                            ) : (
                              <DocumentIcon
                                width={30}
                                height={30}
                                primary={colors.Desc_Txt}
                              />
                            )}
                            <View style={styles.filenameCont}>
                              <Text style={styles.nameTxt}>
                                {item?.fileName}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </>
                ) : (
                  <View style={styles.emptyDocCont}>
                    <DocumentIcon
                      width={32}
                      height={32}
                      primary={colors.Desc_Txt}
                    />
                    <Text style={styles.emptyTxt}>
                      No documents have been added to this claim.
                    </Text>
                  </View>
                )}
              </View>
            </>
          )}
          <CustomSwitcher
            list={[{name: 'Comments'}]}
            selectedIndex={0}
            onChange={() => {}}
          />
          <View style={{height: normalized(12)}} />
          {data && (
            <RequestCommentsSection
              comments={flatComments}
              loading={commentLoading}
              getIsOwner={item =>
                item?.commentBy?.id === selector?.residentUserData?.id
              }
              getAuthorName={item =>
                `${item?.commentBy?.firstName ?? ''} ${
                  item?.commentBy?.lastName ?? ''
                }`.trim()
              }
              getAvatarPath={item => item?.commentBy?.profilePicture}
              getInitial={item => item?.commentBy?.firstName?.charAt(0)}
              getCommentHtml={item => item?.comment}
              getCommentDate={item => item?.commentAt}
              canEditComment={item => !item?.isEdited}
              canShowEdit={item =>
                Boolean(
                  item?.commentBy?.id === selector?.residentUserData?.id,
                ) && !item?.isEdited
              }
              showComposer={!isCommentBlocked}
              onCreateComment={async comment => {
                if (!comment) return false;
                setCommentLoading(true);

                const resp = await requestCommentsService.createComment({
                  endpoint: isCartDamage
                    ? `${ENDPOINTS.cityCartDamageComment}${'commentCreate'}/`
                    : `${ENDPOINTS?.cityCartReturnComment}${'commentCreate'}/`,
                  authContext: 'RESIDENT',
                  payload: {comment: comment, requestId: data?.id},
                  queryParams: {id: data?.id},
                });

                if (resp?.status) {
                  await fetchReqDetail();
                  setCommentLoading(false);
                  dispatch(
                    setShowToast({
                      type: AppStrings.ToastType.success,
                      message: 'Comment Successfully Posted',
                    }),
                  );
                  return true;
                }
                setCommentLoading(false);
                dispatch(
                  setShowToast({
                    type: AppStrings.ToastType.error,
                    message: getErrorMessage(resp),
                  }),
                );
                return false;
              }}
              onUpdateComment={async (comment, item) => {
                setCommentLoading(true);

                const resp = await requestCommentsService.updateComment({
                  endpoint: isCartDamage
                    ? `${ENDPOINTS.cityCartDamageComment}${'commentUpdate'}/`
                    : `${ENDPOINTS?.cityCartReturnComment}${'commentUpdate'}/`,
                  authContext: 'RESIDENT',
                  queryParams: {id: item?.id},
                  payload: {comment: comment, id: data?.comments?.id},
                });

                if (resp?.status) {
                  await fetchReqDetail();
                  setCommentLoading(false);
                  dispatch(
                    setShowToast({
                      type: AppStrings.ToastType.success,
                      message: 'Comment Updated',
                    }),
                  );
                  return true;
                }
                setCommentLoading(false);
                dispatch(
                  setShowToast({
                    type: AppStrings.ToastType.error,
                    message: getErrorMessage(resp),
                  }),
                );
                return false;
              }}
            />
          )}
        </ScrollView>
      )}
      <PdfModal
        isVisible={showPdfModal?.isVisible}
        url={showPdfModal?.url}
        isCartRental={true}
        onClose={() => setShowPdfModal({isVisible: false, url: ''})}
      />
      {viewerItem && (
        <FileViewer
          visible={viewerIndex !== null}
          onClose={() => setViewerIndex(null)}
          filename={viewerItem?.fileName ?? ''}
          resolveUrl={() => resolveDocUrl(viewerItem)}
          onPrevious={
            viewerIndex! > 0
              ? () => setViewerIndex(viewerIndex! - 1)
              : undefined
          }
          onNext={
            viewerIndex! < (urls?.length ?? 0) - 1
              ? () => setViewerIndex(viewerIndex! + 1)
              : undefined
          }
        />
      )}
    </View>
  );
};

export default CartRentalReportDetail;

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
    txt: {
      fontFamily: AppFonts.UbuntuSemiBold,
      fontSize: normalized(16),
      color: colors.Heading_Txt,
      flex: 1,
    },
    cartItemBlock: {
      padding: normalized(12),
      borderRadius: normalized(10),
      borderColor: colors.BorderColor,
      borderWidth: 1,
    },
    filenameCont: {
      flex: 1,
      alignItems: 'flex-start',
      gap: normalized(4),
    },
    btn: {
      backgroundColor: colors.Primary,
      flex: 1,
      height: normalized(40),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: normalized(8),
    },
    docBlock: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(12),
      padding: normalized(12),
      borderRadius: normalized(10),
      borderColor: colors.BorderColor,
      borderWidth: 1,
    },
    docTapArea: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(10),
    },
    emptyDocCont: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: normalized(24),
      gap: normalized(8),
    },
    emptyTxt: {
      fontFamily: AppFonts.UbuntuRegular,
      fontSize: normalized(13),
      color: colors.Desc_Txt,
      textAlign: 'center',
    },
  });
