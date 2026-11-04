import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {
  AppColors,
  AppFonts,
  normalized,
  ScreenProps,
  ScreenSize,
} from '../../Utils/AppConstants';
import {useDispatch, useSelector} from 'react-redux';
import {AppStyles} from '../../Utils/AppStyles';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppRootStore} from '../../Redux/AppStore';
import CustomHeader from '../Components/CustomHeader';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {Base_Url, ENDPOINTS} from '../../Network/Urls';
import {setShowToast} from '../../Redux/AppReducers';
import {AppStrings} from '../../Utils/AppStrings';
import {
  capitalizeEachWord,
  formatAmountToUSD,
  formatStatus,
  getErrorMessage,
  getStatusColor,
} from '../../Utils/Helper';
import moment from 'moment';
import {useIsFocused} from '@react-navigation/native';
import CustomSwitcher from '../Components/CustomSwitcher';
import {paymentIntentReq} from '../../Network/Services/StripeServices';
import {
  initPaymentSheet,
  presentPaymentSheet,
} from '@stripe/stripe-react-native';
import {Routes} from '../../Utils/Routes';
import PdfModal from '../Components/PdfModal';
import RequestCommentsSection from '../Components/RequestCommentsSection';
import {requestCommentsService} from '../../Network/Services/RequestCommentsService';
import {useDeepLinkGuard} from '../../Hooks/DeepLinkGuard';
import CustomButton from '../Components/CustomButton';
import SimpleButton from '../Components/SimpleButton';
import {PaymentAlert} from '../Components/ConfirmationModal';

const CartRentalDetailScreen = (props: ScreenProps) => {
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
  const isFocused = useIsFocused();
  const [listIndex, setListIndex] = useState(0);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [flatComments, setFlatComments] = useState<any[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const userData = selector?.residentUserData;
  const {isBlocked} = useDeepLinkGuard(userData);

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
    console.log(props?.route?.params?.id);
    apiHandler({
      endpoint: ENDPOINTS.cityCartReqDetail,
      method: 'GET',
      queryParams: {
        id: props?.route?.params?.id ?? props?.route?.params?.item?.id,
      },
      authContext: 'RESIDENT',
      onComplete: (resp: any) => {
        if (resp?.status) {
          setData(resp?.data?.data);
          setFlatComments(resp?.data?.data.comments ?? []);
          setIsLoading(false);
          setRefreshing(false);
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
  const paymentStatus = data?.paidForCurrentBillingCycle ? 'Paid' : 'Unpaid';
  const trashDaysArray: string[] = data?.trashDay
    ? JSON.parse(data.trashDay.replace(/'/g, '"'))
    : [];

  const LIST = [
    {
      id: 1,
      name: 'Billing Cycles',
    },
    {
      id: 2,
      name: 'Invoices',
    },
    {
      id: 3,
      name: 'Comments',
    },
  ];

  const requestStatus = data?.status?.toLowerCase();

  const BlockComment =
    requestStatus === 'declined' ||
    requestStatus === 'closed' ||
    requestStatus === 'withdrawn';

  const [showPdfModal, setShowPdfModal] = useState({
    isVisible: false,
    url: '',
  });

  const onPayment = async (payload: any, amount?: any) => {
    console.log('payload ==0===. ', payload, amount);

    const isZero = String(amount) === '0.00';
    const isMinimum = Number(amount) > 0 && Number(amount) < 0.5;

    if (isMinimum) {
      Alert.alert('Sorry, this amount cannot be processed');
      return;
    }

    try {
      setPaymentLoading(true);

      await paymentIntentReq(
        payload,
        'RESIDENT',
        ENDPOINTS.cityCartPaymentIntent,
        async (response: any) => {
          const clientSecret = response?.clientSecret;

          if (!isZero) {
            if (!clientSecret) {
              Alert.alert('Error', 'Payment client secret is missing.');
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
              console.log(paymentError);
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
      Alert.alert('Error', 'Something went wrong initializing payment sheet.');
    } finally {
      setPaymentLoading(false);
    }
  };

  // const openPaymentSheet = async () => {
  //   const {error} = await presentPaymentSheet();

  //   if (error) {
  //     Alert.alert('Payment Failed', error.message);
  //   } else {
  //     Alert.alert('Success', 'Payment completed!');
  //   }
  // };

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
        text={'Request Detail'}
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
          <View style={[styles.rowCont, {gap: normalized(5)}]}>
            <View style={{flex: 1, minWidth: 0}}>
              <CustomButton
                text="Request Return "
                loading={false}
                onPress={() =>
                  props?.navigation?.navigate(
                    Routes.CartRental.ReportSubmission,
                    {navigation: 'CartReturn', requestId: data?.requestId},
                  )
                }
              />
            </View>

            <View style={{flex: 1, minWidth: 0}}>
              <SimpleButton
                text=" Report Damage "
                loading={false}
                onPress={() =>
                  props?.navigation?.navigate(
                    Routes.CartRental.ReportSubmission,
                    {navigation: 'CartDamage', requestId: data?.requestId},
                  )
                }
              />
            </View>
          </View>
          <View style={{height: normalized(10)}} />
          <View style={styles.itemCont}>
            <Text style={styles.txt}>Request Details</Text>
            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Request ID</Text>
                <Text style={styles.valueTxt}>{data?.requestId}</Text>
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
          </View>

          <View style={{height: normalized(12)}} />

          <View style={styles.itemCont}>
            <Text style={styles.txt}>Request Details</Text>
            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Requested Carts</Text>
                <Text style={styles.valueTxt}>
                  {data?.requestedCarts?.quantity}
                </Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Category</Text>
                <Text
                  style={
                    styles.valueTxt
                  }>{`Category ${data?.category?.id}: ${data?.category?.propertyType}`}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Yearly Rent Per Cart</Text>
                <Text style={styles.valueTxt}>
                  {formatAmountToUSD(data?.requestedCarts?.yearlyRent)}
                </Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Estimated Charges</Text>
                <Text style={[styles.valueTxt, {color: AppColors.Error}]}>
                  {formatAmountToUSD(data?.requestedCarts?.totalCharge)}
                </Text>
              </View>
            </View>

            <Text style={styles.txt}>Property Address</Text>

            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Address</Text>
                <Text style={styles.valueTxt}>
                  {data?.propertyAddress?.address}
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>City</Text>
                <Text style={styles.valueTxt}>
                  {data?.propertyAddress?.city ?? 'N/A'}
                </Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>State</Text>
                <Text style={styles.valueTxt}>
                  {data?.propertyAddress?.state ?? 'N/A'}
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>ZipCode</Text>
                <Text style={styles.valueTxt}>
                  {data?.propertyAddress?.zipCode ?? 'N/A'}
                </Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Country</Text>
                <Text style={styles.valueTxt}>
                  {data?.propertyAddress?.country ?? 'N/A'}
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Trash Days</Text>
                <View style={styles.trashDayCont}>
                  {trashDaysArray?.length > 0 ? (
                    trashDaysArray.map(item => (
                      <Text style={styles.trashTxt}>
                        {capitalizeEachWord(item)}
                      </Text>
                    ))
                  ) : (
                    <Text style={styles.valueTxt}>N/A</Text>
                  )}
                </View>
              </View>
            </View>
          </View>

          <View style={{height: normalized(12)}} />

          <View style={styles.itemCont}>
            <Text style={[styles.txt]}>User Details</Text>

            <Text style={styles.txt}>Property Owner Information</Text>

            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Name</Text>
                {(data?.propertyOwner?.firstName ||
                  data?.propertyOwner?.lastName) && (
                  <Text style={styles.valueTxt}>
                    {[
                      data?.propertyOwner?.firstName,
                      data?.propertyOwner?.lastName,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  </Text>
                )}
              </View>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Phone Number</Text>
                <Text style={styles.valueTxt}>
                  {data?.propertyOwner?.phoneNumber}
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Email</Text>
                <Text style={styles.valueTxt}>
                  {data?.propertyOwner?.email}
                </Text>
              </View>
            </View>

            <Text style={styles.txt}>Billing Information</Text>

            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Address</Text>
                <Text style={styles.valueTxt}>
                  {data?.billingAddress?.address ?? 'N/A'}
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>City</Text>
                <Text style={styles.valueTxt}>
                  {data?.billingAddress?.city ?? 'N/A'}
                </Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>State</Text>
                <Text style={styles.valueTxt}>
                  {data?.billingAddress?.state
                    ? data?.billingAddress?.state
                    : 'N/A'}
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>ZipCode</Text>
                <Text style={styles.valueTxt}>
                  {data?.billingAddress?.zipCode
                    ? data?.billingAddress?.zipCode
                    : 'N/A'}
                </Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Country</Text>
                <Text style={styles.valueTxt}>
                  {data?.billingAddress?.country ?? 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          <CustomSwitcher
            list={LIST}
            selectedIndex={listIndex}
            onChange={i => setListIndex(i)}
          />

          {listIndex == 0 ? (
            <View style={{flex: 1, backgroundColor: colors.Background}}>
              <FlatList
                data={data?.allBillingCyclesSummary}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
                renderItem={({item}) => (
                  <View style={styles.itemCont}>
                    <View style={styles.row}>
                      <View style={styles.item}>
                        <Text style={styles.keyTxt}>Billing Cycle</Text>
                        <Text style={styles.valueTxt}>
                          {item?.billingCycle?.name}
                        </Text>
                      </View>
                      <View style={styles.item}>
                        <Text style={styles.keyTxt}>Cart</Text>
                        <Text style={styles.valueTxt}>
                          {item?.totalAssignedCarts}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.row}>
                      <View style={styles.item}>
                        <Text style={styles.keyTxt}>Invoices</Text>
                        <Text style={styles.valueTxt}>
                          {item.invoiceDetails?.length}
                        </Text>
                      </View>
                      <View style={styles.item}>
                        <Text style={styles.keyTxt}>Amount Paid</Text>
                        <Text style={styles.valueTxt}>
                          {formatAmountToUSD(item?.totalPayments)}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              />
            </View>
          ) : listIndex == 1 ? (
            <View style={{flex: 1, backgroundColor: colors.Background}}>
              <FlatList
                data={data?.payments}
                contentContainerStyle={styles.list}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={false}
                persistentScrollbar
                renderItem={({item}) => (
                  <View style={styles.itemCont}>
                    <View style={styles.row}>
                      <View style={styles.item}>
                        <Text style={styles.keyTxt}>Billing Cycle</Text>
                        <Text style={styles.valueTxt}>
                          {item?.billingCycle?.name}
                        </Text>
                      </View>
                      <View style={styles.item}>
                        <Text style={styles.keyTxt}>Status</Text>
                        <View
                          style={[
                            styles.statusCont,
                            {
                              backgroundColor: getStatusColor(
                                item?.paymentStatus,
                                colors,
                              ),
                              alignSelf: 'flex-start',
                            },
                          ]}>
                          <Text style={styles.statusTxt}>
                            {formatStatus(item?.paymentStatus)}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.row}>
                      <View style={styles.item}>
                        <Text style={styles.keyTxt}>Amount</Text>
                        <Text style={styles.valueTxt}>
                          {formatAmountToUSD(item.totalAmount)}
                        </Text>
                      </View>
                      <View style={styles.item}>
                        <Text style={styles.keyTxt}>Payment Method</Text>
                        <Text style={styles.valueTxt}>
                          {item?.paymentMethod}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.row}>
                      <View style={styles.item}>
                        <Text style={styles.keyTxt}>Check Number</Text>
                        <Text style={styles.valueTxt}>
                          {item?.checkNumber ?? 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.item}>
                        <Text style={styles.keyTxt}>Paid At</Text>
                        <Text style={styles.valueTxt}>
                          {item?.paidAt
                            ? moment(item?.paidAt)?.format('LL')
                            : 'N/A'}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.rowCont, {gap: normalized(5)}]}>
                      <View style={{flex: 1, minWidth: 0}}>
                        <CustomButton
                          style={styles.btn}
                          disabled={invoiceLoading}
                          onPress={() => onViewInvoice(item)}
                          text="View Invoice"
                        />
                      </View>
                      {/* {invoiceLoading ? (
                          <ActivityIndicator
                            color={colors.White}
                            size="small"
                          />
                        ) : (
                          <Text style={styles.btnTxt}>View Invoice</Text>
                        )}/> */}

                      {item?.paymentStatus?.toLowerCase() !== 'paid' &&
                        item?.paymentMethod?.toLowerCase() === 'online' && (
                          <View style={{flex: 1, minWidth: 0}}>
                            <CustomButton
                              text="Pay Now"
                              style={styles.btn}
                              loading={paymentLoading}
                              disabled={paymentLoading}
                              onPress={() =>
                                onPayment(
                                  {paymentId: item?.id, id: data?.id},
                                  item?.totalAmount,
                                )
                              }
                            />
                          </View>
                        )}
                    </View>
                  </View>
                )}
                // ListFooterComponent={() => }
              />
            </View>
          ) : (
            <View style={{flex: 1, backgroundColor: colors.Background}}>
              <RequestCommentsSection
                comments={flatComments}
                loading={commentLoading}
                getIsOwner={item =>
                  Boolean(item?.commentBy?.id === userData?.id)
                }
                getAuthorName={item =>
                  `${item?.commentBy?.firstName ?? ''} ${
                    item?.commentBy?.lastName ?? ''
                  }`.trim()
                }
                getAvatarPath={item => item?.commentBy?.profilePicture}
                getInitial={item => item?.commentBy?.firstName.charAt(0)}
                getCommentHtml={item => item?.comment}
                getCommentDate={item => item?.commentAt}
                canEditComment={item => !item?.isEdited}
                canShowEdit={item =>
                  Boolean(item?.commentBy?.id === userData?.id) &&
                  !item?.isEdited &&
                  !BlockComment
                }
                showComposer={!BlockComment}
                onCreateComment={async comment => {
                  if (!comment) return false;
                  setCommentLoading(true);
                  console.log(userData?.id);
                  const resp = await requestCommentsService.createComment({
                    endpoint: `${ENDPOINTS.cityCartReqComment}commentCreate/`,
                    authContext: 'RESIDENT',
                    queryParams: {id: data?.id},
                    payload: {comment: comment, id: data?.id},
                  });
                  setCommentLoading(false);
                  if (resp?.status) {
                    await fetchReqDetail();
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
                  console.log('EDIT comment:', comment);
                  const resp = await requestCommentsService.updateComment({
                    endpoint: `${ENDPOINTS.cityCartReqComment}commentUpdate/`,
                    authContext: 'RESIDENT',
                    queryParams: {id: item?.id},
                    payload: {comment: comment, id: item?.id},
                  });

                  if (resp?.status) {
                    setCommentLoading(false);
                    await fetchReqDetail();
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
              {/* <FlatList
                data={data?.assignedCarts}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
                renderItem={({item}) => (
                  <View style={styles.itemCont}>
                    <View style={styles.row}>
                      <View style={styles.item}>
                        <Text style={styles.keyTxt}>Serial Number</Text>
                        <Text style={styles.valueTxt}>
                          {item?.serialNumber}
                        </Text>
                      </View>
                      <View style={styles.item}>
                        <Text style={styles.keyTxt}>Status</Text>
                        <View
                          style={[
                            styles.statusCont,
                            {
                              backgroundColor: getStatusColor(
                                item?.status,
                                colors,
                              ),
                              alignSelf: 'flex-start',
                            },
                          ]}>
                          <Text style={styles.statusTxt}>
                            {formatStatus(item?.status)}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.row}>
                      <View style={styles.item}>
                        <Text style={styles.keyTxt}>Cart Size</Text>
                        <Text style={styles.valueTxt}>{item.size}</Text>
                      </View>
                      <View style={styles.item}>
                        <Text style={styles.keyTxt}>Yearly Rent</Text>
                        <Text style={styles.valueTxt}>
                          {formatAmountToUSD(item?.yearlyRent)}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              /> */}
            </View>
          )}
        </ScrollView>
      )}

      <PdfModal
        isVisible={showPdfModal?.isVisible}
        url={showPdfModal?.url}
        isCartRental={true}
        onClose={() => setShowPdfModal({isVisible: false, url: ''})}
      />
    </View>
  );
};

export default CartRentalDetailScreen;

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
      // alignSelf: 'center',
    },
    trashDayCont: {
      flexDirection: 'row',
      gap: normalized(8),
      flexWrap: 'wrap',
    },
    trashTxt: {
      fontFamily: AppFonts.UbuntuRegular,
      color: colors.Heading_Txt,
      borderRadius: normalized(100),
      paddingHorizontal: normalized(10),
      paddingVertical: normalized(4),
      borderColor: colors.Heading_Txt,
      borderWidth: 1,
    },
    list: {
      gap: normalized(20),
    },
    btnRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: normalized(12),
    },
    btn: {
      backgroundColor: colors.Primary,
      flex: 1,
      height: normalized(40),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: normalized(8),
    },
    btnTxt: {
      color: colors.White,
      fontSize: normalized(13),
      fontFamily: AppFonts.UbuntuSemiBold,
    },
  });
