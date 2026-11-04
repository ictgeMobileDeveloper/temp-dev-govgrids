import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Linking,
  TouchableOpacity,
  RefreshControl,
  ScrollViewInstance,
} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {
  COMMENT_SWITCH_LIST,
  normalized,
  Restrictions,
  ScreenProps,
} from '../../Utils/AppConstants';
import CustomHeader from '../Components/CustomHeader';
import moment from 'moment';
import CustomSwitcher from '../Components/CustomSwitcher';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS, SECRET_KEYS} from '../../Network/Urls';
import {setShowToast} from '../../Redux/AppReducers';
import {AppStrings} from '../../Utils/AppStrings';
import CustomRichToolbar from '../Components/CustomRickToolbar';
import {RichEditor} from 'react-native-pell-rich-editor';
import CustomButton from '../Components/CustomButton';
import {
  capitalizeEachWord,
  getErrorMessage,
  groupCommentsByDate,
  removeHtmlTags,
} from '../../Utils/Helper';
import AppImageViewer from '../Components/AppImageView';
import ReportModal from '../Components/ReportModal';
import RequestCommentsSection from '../Components/RequestCommentsSection';
import {requestCommentsService} from '../../Network/Services/RequestCommentsService';

import DynamicFormView, {
  DynamicFormViewRef,
} from '../dynamic_form_shared/DynamicFormView';
import {buildRipAnswers} from '../dynamic_form_shared/DynamicFormCore';

import RequestAttachmentsGallery, {
  AttachmentItem,
} from './Components/FileListing';
import {useIsFocused} from '@react-navigation/native';
import {useDeepLinkGuard} from '../../Hooks/DeepLinkGuard';

const RIPReqDetailScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useDispatch();
  const reqRichTextRef = useRef<any>(null);
  const data = props?.route?.params?.item;
  const userData = selector?.residentUserData;
  const [switchIndex, setSwitchIndex] = useState(0);
  const [reqDetail, setReqDetail] = useState<any>({});
  const [comments, setComments] = useState<any>();
  const [isSubscriber, setIsSubscriber] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [, setAllRequest] = useState([
    {value: 'Reopen this request', status: 'reopen'},
  ]);
  const [requestStatus, setRequestStatus] = useState('');
  const [, setSelectedReq] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [reqCommentLoading, setReqCommentLoading] = useState(false);
  const [requestComment, setRequestComment] = useState('');
  const [followLoading, setFollowLoading] = useState(false);
  const scrollRef = useRef<ScrollViewInstance | null>(null);
  const [origin, setOrigin] = useState<any>({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [isShowReportModal, setIsShowReportModal] = useState({
    value: false,
    id: '',
  });
  const flatComments = useMemo(
    () =>
      Array.isArray(comments)
        ? comments.flatMap((item: any) =>
            Array.isArray(item?.[1]) ? item[1] : item,
          )
        : [],
    [comments],
  );

  const closeReopenFormRef = useRef<DynamicFormViewRef>(null);
  const targetPhase = requestStatus === 'open' ? 'close' : 'reopen';
  const closeReopenQuestions = reqDetail?.requestCategory?.questions ?? [];
  const baseData = selector?.baseData ?? {};
  const isFocused = useIsFocused();

  const {isBlocked} = useDeepLinkGuard(userData);

  if (isBlocked) {
    return (
      <View style={[styles.container, styles.loaderCont]}>
        <ActivityIndicator color={colors.Primary} size="large" />
      </View>
    );
  }

  const onRefresh = () => {
    // NEW
    setRefreshing(true);
    fetchRequestDetail(false);
  };
  useEffect(() => {
    fetchRequestDetail(true);
  }, [isFocused, props?.route?.params?.refreshedAt]);

  const fetchRequestDetail = (showLoader = true) => {
    if (showLoader) {
      setIsLoading(true);
    }

    apiHandler({
      endpoint: ENDPOINTS.resReqDetail,
      method: 'GET',
      queryParams: {requestId: data?.requestId},
      authContext: 'RESIDENT',
      useRecaptcha: true,
      onComplete: (resp: any) => {
        setRefreshing(false);
        console.log('Resident Issue Portal Request Detail ', resp);
        if (resp?.status) {
          setReqDetail(resp?.data?.data);

          setIsSubscriber(resp?.data?.data?.isSubscriber);

          const groupedData = groupCommentsByDate(resp?.data?.data?.comments);
          setComments(groupedData);

          setOrigin({
            latitude: resp?.data?.data?.addressCoords?.lat,
            longitude: resp?.data?.data?.addressCoords?.lng,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });

          setRequestStatus(resp?.data?.data?.status);

          if (resp?.data?.data?.status == 'open') {
            setAllRequest([{value: 'Close this request', status: 'closed'}]);
            setSelectedReq({value: 'Close this request', status: 'closed'});
          } else {
            setAllRequest([{value: 'Reopen this request', status: 'open'}]);
            setSelectedReq({value: 'Reopen this request', status: 'open'});
          }
        } else {
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.error,
              message: resp?.message,
            }),
          );
        }

        setIsLoading(false);
        setCommentLoading(false);
      },
    });
  };

  const getCommentAvatarPath = (item: any) => {
    if (item?.commentBy === 'cusadmin') {
      return item?.createdBy?.profilePicture || selector?.baseData?.logo;
    }

    return item?.resident?.profilePicture || undefined;
  };

  const getCommentInitial = (item: any) => {
    if (item?.commentBy === 'cusadmin') {
      return (
        item?.createdBy?.firstName?.charAt(0) ??
        selector?.baseData?.cityName?.charAt(0) ??
        'C'
      );
    }

    return (
      item?.resident?.firstName?.charAt(0) ??
      item?.resident?.lastName?.charAt(0) ??
      'U'
    );
  };

  const getCommentAuthorName = (item: any) => {
    if (item?.commentBy === 'cusadmin') {
      return item?.createdBy
        ? `${item?.createdBy?.firstName || ''} ${
            item?.createdBy?.lastName || ''
          }`.trim()
        : `${selector?.baseData?.cityName || ''}`.trim() || 'City';
    }

    return `${item?.resident?.firstName || ''} ${
      item?.resident?.lastName || ''
    }`.trim();
  };
  const shouldShowRequestActions = () => {
    if (!userData?.id) {
      return false;
    }

    return true;
  };

  const shouldShowFollowBtn = () => {
    const isOwner = userData?.id === data?.resident?.id;
    const restriction = isOwner
      ? data?.requestCategory?.requesterRequestRestriction
      : data?.requestCategory?.publicRequestRestriction;

    if (
      restriction === Restrictions.disableAllActionsOnClosedRequests &&
      data?.status === 'closed'
    ) {
      return false;
    }

    if (restriction === Restrictions.disableAllActionsOnAllRequests) {
      return false;
    }
    return true;
  };

  const openLocationInGoogleMaps = async () => {
    const latitude = Number(origin?.latitude);
    const longitude = Number(origin?.longitude);

    if (!latitude || !longitude) return;

    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    await Linking.openURL(url);
  };

  const onReportComment = (obj: any) => {
    // dispatch(setIsLoader(true));

    apiHandler({
      endpoint: ENDPOINTS.flagged,
      method: 'POST',
      authContext: 'RESIDENT',
      queryParams: {id: obj?.id},
      payload: obj,
      onComplete: (resp: any) => {
        console.log('RIP comment', resp);
        if (resp?.status) {
          //   dispatch(setIsLoader(false));
          fetchRequestDetail();
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.success,
              message: 'Comment Reported Successfully.',
            }),
          );
        } else {
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.error,
              message: resp?.message,
            }),
          );
          //   dispatch(setIsLoader(false));
        }
      },
    });
  };

  const onChangeRequest = () => {
    const isFormValid = closeReopenFormRef.current?.validate() ?? true;
    if (!isFormValid) return;

    const formValues = closeReopenFormRef.current?.getValues() ?? {};
    const activeFields = closeReopenFormRef.current?.getActiveFields() ?? [];
    const answers = buildRipAnswers(activeFields, formValues);

    const payload: Record<string, any> = {
      comment: requestComment,
      requestId: data?.requestId,
      status: requestStatus == 'open' ? 'closed' : 'open',
    };

    answers.forEach((item: any, index: number) => {
      payload[`answers[${index}][question]`] = item.question;
      payload[`answers[${index}][answer]`] = item.answer;
    });

    setReqCommentLoading(true);
    apiHandler({
      endpoint:
        payload?.status == 'open'
          ? ENDPOINTS.reopenRequest
          : ENDPOINTS.closeRequest,
      method: 'POST',
      authContext: 'RESIDENT',
      useRecaptcha: true,
      queryParams: {requestId: data?.requestId},
      payload: payload,
      onComplete: (resp: any) => {
        if (resp?.status) {
          setReqCommentLoading(false);
          if (requestStatus == 'open') setRequestStatus('closed');
          else setRequestStatus('open');

          dispatch(
            setShowToast({
              type: AppStrings.ToastType.success,
              message: 'Request Status Updated.',
            }),
          );
          reqRichTextRef.current?.setContentHTML('');
          setRequestComment('');
          fetchRequestDetail();
        } else {
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.error,
              message: getErrorMessage(resp),
            }),
          );
          setReqCommentLoading(false);
        }
      },
    });
  };

  const onToggleSubscriber = () => {
    setFollowLoading(true);
    apiHandler({
      endpoint: ENDPOINTS.toggleReqSub,
      method: 'POST',
      authContext: 'RESIDENT',
      useRecaptcha: true,
      queryParams: {requestId: data?.requestId},
      onComplete: (resp: any) => {
        if (resp?.status) {
          console.log('Toggle Subscribe in Resident Issue Portal', resp);
          setIsSubscriber((prev: any) => !prev);
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.success,
              message: resp?.data?.message,
            }),
          );
          setFollowLoading(false);
          fetchRequestDetail();
        } else {
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.error,
              message:
                resp?.message ??
                resp?.error ??
                AppStrings.Network.someThingError,
            }),
          );
          setFollowLoading(false);
        }
      },
    });
  };

  const allAnswerFiles = useMemo(
    () =>
      (reqDetail?.answers ?? [])
        .filter(
          (a: any) =>
            a?.type === 'file' && Array.isArray(a?.files) && a.files.length,
        )
        .flatMap((a: any) => a.files),
    [reqDetail?.answers],
  );

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
        text={data?.requestId}
      />

      {isLoading ? (
        <View style={styles.loaderCont}>
          <ActivityIndicator size={'large'} color={colors.Primary} />
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.Primary]}
              tintColor={colors.Primary}
            />
          }
          contentContainerStyle={{marginHorizontal: normalized(20)}}
          showsVerticalScrollIndicator={false}>
          <View style={{height: normalized(12)}} />
          <View style={styles.itemCont}>
            <Text
              style={
                styles.nameTxt
              }>{`Request ${reqDetail?.requestId} - ${reqDetail?.requestCategory?.title}`}</Text>
            {data?.answers?.map((item: any, index: any) => {
              const ans = item?.answer;

              if (item?.label === 'signature') {
                if (!ans?.trim()) {
                  return null;
                }

                return (
                  <View style={styles.item} key={index}>
                    <Text style={styles.keyTxt}>{item?.label}</Text>

                    <AppImageViewer
                      source={{uri: ans}}
                      style={{
                        width: '100%',
                        height: normalized(150),
                      }}
                      resizeMode="contain"
                    />
                  </View>
                );
              }

              if (
                item?.type === 'file' &&
                Array.isArray(item?.files) &&
                item.files.length
              ) {
                return (
                  <View style={styles.item} key={index}>
                    <Text style={styles.keyTxt}>{item?.label}</Text>

                    <RequestAttachmentsGallery
                      attachments={item.files.map((file: any) => ({
                        ...file,
                        kind: 'file',
                      }))}
                      compact
                    />
                  </View>
                );
              }
              const isDateLike =
                typeof ans === 'string' &&
                moment(ans, moment.ISO_8601, true).isValid();

              const display = isDateLike
                ? moment(ans).format('LLL')
                : String(ans ?? '');
              return (
                <View style={styles.item} key={index}>
                  <Text style={styles.keyTxt}>{item?.label}</Text>
                  <Text style={styles.valueTxt}>{display}</Text>
                </View>
              );
            })}
          </View>

          <View style={{height: normalized(12)}} />

          <View style={styles.itemCont}>
            <View style={styles.rowCont}>
              <Text style={styles.nameTxt}>{'Request Details'}</Text>
              {userData && shouldShowFollowBtn() && (
                <View style={{width: normalized(120)}}>
                  <CustomButton
                    text={!isSubscriber ? 'Subscribe' : 'Unsubscribe'}
                    onPress={() => {
                      onToggleSubscriber();
                    }}
                    loading={followLoading}
                    style={{height: normalized(30), marginTop: 0}}
                  />
                </View>
              )}
            </View>
            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Request Status</Text>
                <View
                  style={[
                    styles.statusCont,
                    {
                      backgroundColor: colors.Primary,
                      alignSelf: 'flex-start',
                    },
                  ]}>
                  <Text style={styles.statusTxt}>
                    {capitalizeEachWord(reqDetail?.status)}
                  </Text>
                </View>
              </View>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Created At</Text>
                <Text style={styles.valueTxt}>
                  {moment(reqDetail?.createdAt).format('LLL')}
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Address</Text>
                <Text style={styles.valueTxt}>{reqDetail?.address}</Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Reporter</Text>
                <Text style={styles.valueTxt}>
                  {reqDetail?.resident
                    ? reqDetail.resident.firstName ||
                      reqDetail.resident.lastName
                      ? `${reqDetail.resident.firstName ?? ''} ${
                          reqDetail.resident.lastName ?? ''
                        }`
                      : reqDetail?.resident
                    : 'Anonymous'}
                </Text>
              </View>
            </View>

            <View style={styles.item}>
              <Text style={styles.keyTxt}>Description</Text>
              <Text style={styles.valueTxt}>{reqDetail?.description}</Text>
            </View>
          </View>
          <View style={{height: normalized(12)}} />

          <RequestAttachmentsGallery
            title="Request Images"
            attachments={(reqDetail?.photos ?? []).map((photo: any) => ({
              ...photo,
              fileName: photo?.fileName ?? photo?.filename,
              kind: 'image',
            }))}
          />

          <View style={{height: normalized(12)}} />
          {!!origin?.longitude && !!origin?.latitude && (
            <View style={styles.itemCont}>
              <Text style={styles.nameTxt}>{'Location'}</Text>
              {origin?.longitude && origin?.latitude != 0 ? (
                <View style={styles.mapImgCont}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.mapImgCont}
                    onPress={openLocationInGoogleMaps}>
                    <AppImageViewer
                      style={styles.mapImg}
                      source={{
                        uri: `https://maps.googleapis.com/maps/api/staticmap?center=${
                          origin?.latitude
                        },${origin?.longitude}&zoom=15&size=420x500
      &key=${SECRET_KEYS.GOOGLE_MAP_KEY}
      &maptype=roadmap
      &markers=color:red%7C${origin?.latitude},${origin?.longitude}
      ${
        selector?.isDarkTheme
          ? `&style=element:geometry%7Ccolor:0x212121
             &style=element:labels.icon%7Cvisibility:off
             &style=element:labels.text.fill%7Ccolor:0x757575
             &style=element:labels.text.stroke%7Ccolor:0x212121
             &style=feature:administrative%7Celement:geometry%7Ccolor:0x757575
             &style=feature:poi%7Celement:geometry%7Ccolor:0x212121
             &style=feature:poi.park%7Celement:geometry%7Ccolor:0x181818
             &style=feature:road%7Celement:geometry.fill%7Ccolor:0x2c2c2c
             &style=feature:road%7Celement:geometry.stroke%7Ccolor:0x212121
             &style=feature:transit%7Celement:geometry%7Ccolor:0x2f3948
             &style=feature:water%7Celement:geometry%7Ccolor:0x000000
             &style=feature:water%7Celement:labels.text.fill%7Ccolor:0x3d3d3d`
          : ''
      }`.replace(/\s+/g, ''),
                      }}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{marginVertical: normalized(30)}}>
                  <ActivityIndicator size={'large'} color={colors.Primary} />
                </View>
              )}
            </View>
          )}

          <CustomSwitcher
            list={COMMENT_SWITCH_LIST}
            selectedIndex={switchIndex}
            onChange={i => {
              setSwitchIndex(i);
            }}
          />

          {switchIndex == 0 ? (
            <RequestCommentsSection
              comments={flatComments}
              loading={commentLoading}
              showComposer={Boolean(userData)}
              getIsOwner={item => item?.commentBy !== 'cusadmin'}
              getAuthorName={getCommentAuthorName}
              getAvatarPath={getCommentAvatarPath}
              getInitial={getCommentInitial}
              getCommentHtml={item => item?.comment}
              getCommentDate={item => item?.createdAt}
              canShowEdit={item =>
                userData?.id === item?.resident?.id &&
                !item?.isEdited &&
                item?.commentBy !== 'cusadmin'
              }
              canReportComment={item =>
                (item?.commentBy === 'cusadmin' && item?.createdBy) ||
                (item?.commentBy !== 'cusadmin' &&
                  Boolean(userData) &&
                  shouldShowFollowBtn())
              }
              onReportComment={item => {
                setIsShowReportModal({
                  value: true,
                  id: item?.id,
                });
              }}
              onCreateComment={async comment => {
                if (!comment?.trim()) return false;

                setCommentLoading(true);

                const resp = await requestCommentsService.createComment({
                  endpoint: ENDPOINTS.residentComment,
                  authContext: 'RESIDENT',
                  queryParams: {id: data?.requestId},
                  payload: {
                    comment,
                    requestId: data?.requestId,
                  },
                });

                if (resp?.status) {
                  fetchRequestDetail(false);
                  dispatch(
                    setShowToast({
                      type: AppStrings.ToastType.success,
                      message: 'Comment Posted Successfully.',
                    }),
                  );
                  return true;
                }

                setCommentLoading(false);
                dispatch(
                  setShowToast({
                    type: AppStrings.ToastType.error,
                    message:
                      resp?.message ??
                      resp?.error ??
                      AppStrings.Network.someThingError,
                  }),
                );
                return false;
              }}
              onUpdateComment={async (comment, item) => {
                setCommentLoading(true);

                const resp = await requestCommentsService.updateComment({
                  endpoint: ENDPOINTS.updateComment,
                  authContext: 'RESIDENT',
                  queryParams: {id: item?.id},
                  payload: {
                    comment,
                    id: item?.id,
                  },
                });

                if (resp?.status) {
                  fetchRequestDetail(false);
                  dispatch(
                    setShowToast({
                      type: AppStrings.ToastType.success,
                      message:
                        resp?.message ||
                        'Comment has been updated successfully',
                    }),
                  );
                  return true;
                }

                setCommentLoading(false);
                dispatch(
                  setShowToast({
                    type: AppStrings.ToastType.error,
                    message:
                      resp?.message ??
                      resp?.error ??
                      AppStrings.Network.someThingError,
                  }),
                );
                return false;
              }}
            />
          ) : userData &&
            shouldShowRequestActions() &&
            selector?.residentUserData?.id ? (
            <>
              <View style={{height: normalized(16)}} />

              <DynamicFormView
                ref={closeReopenFormRef}
                fields={closeReopenQuestions}
                timeOfQuestions={targetPhase}
                showButtons={false}
                context={{
                  baseData,
                  countryRestriction: baseData?.countryCode?.toLowerCase(),
                  country: baseData?.country,
                }}
                onSubmit={() => {}}
              />

              <CustomRichToolbar editor={reqRichTextRef} />
              <View style={{height: normalized(12)}} />
              <View style={styles.commentCont}>
                <RichEditor
                  ref={reqRichTextRef}
                  onChange={descriptionText => {
                    setRequestComment(descriptionText);
                  }}
                  placeholder="Enter your Comment"
                  initialHeight={normalized(280)}
                  editorStyle={{
                    backgroundColor: colors.Background,
                    color: colors.Heading_Txt,
                  }}
                />
              </View>
              <View style={styles.btnCont}>
                <View style={{width: normalized(130)}}>
                  <CustomButton
                    text={
                      requestStatus == 'open'
                        ? 'Close Request'
                        : 'Reopen Request'
                    }
                    onPress={onChangeRequest}
                    loading={reqCommentLoading}
                    style={{
                      backgroundColor:
                        requestStatus == 'open'
                          ? colors.ToastColors.Error
                          : colors.Primary,
                    }}
                  />
                </View>
              </View>
            </>
          ) : (
            <Text style={styles.Desc_Txt_N}>
              Please Login to Perform any Action on this request
            </Text>
          )}

          <View style={{height: normalized(30)}} />
        </ScrollView>
      )}
      <ReportModal
        isShow={isShowReportModal?.value}
        onClose={() =>
          setIsShowReportModal({
            value: false,
            id: '',
          })
        }
        id={isShowReportModal?.id}
        onReport={(obj: any) => {
          onReportComment(obj);
          setIsShowReportModal({
            value: false,
            id: '',
          });
        }}
      />
    </View>
  );
};

export default RIPReqDetailScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    commentCont: {
      height: normalized(280),
      borderWidth: 1,
      borderRadius: normalized(8),
      overflow: 'hidden',
      borderColor: colors.BorderColor,
      backgroundColor: colors.Background,
    },
    btnCont: {
      flexDirection: 'row',
      gap: normalized(12),
      justifyContent: 'flex-end',
    },
    mapImg: {
      width: '100%',
      height: normalized(400),
    },
    mapImgCont: {
      borderRadius: normalized(12),
      overflow: 'hidden',
    },
    loaderCont: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
