import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';

import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {normalized, ScreenProps} from '../../Utils/AppConstants';
import CustomHeader from '../Components/CustomHeader';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../Network/Urls';
import {setShowToast} from '../../Redux/AppReducers';
import {AppStrings} from '../../Utils/AppStrings';
import {
  capitalizeEachWord,
  getErrorMessage,
  removeHtmlTags,
} from '../../Utils/Helper';
import moment from 'moment';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import RequestCommentsSection from '../Components/RequestCommentsSection';
import {requestCommentsService} from '../../Network/Services/RequestCommentsService';
import {useIsFocused} from '@react-navigation/native';
import CustomSwitcher from '../Components/CustomSwitcher';
import {useDeepLinkGuard} from '../../Hooks/DeepLinkGuard';

const FlagRaisingReqDetailScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const dispatch = useDispatch();
  const [details, setDetails] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const scrollRef = useRef<any>(null);
  const isFocused = useIsFocused();

  const {isBlocked} = useDeepLinkGuard(selector?.residentUserData);

  if (isBlocked) {
    return (
      <View style={[styles.container, styles.loaderCont]}>
        <ActivityIndicator color={colors.Primary} size="large" />
      </View>
    );
  }
  const [commentLoading, setCommentLoading] = useState(false);
  const userData = selector?.residentUserData;

  const getCommentUser = (item: any) => {
    return item?.commentedBy ?? item?.resident ?? null;
  };

  const getCommentUserName = (item: any) => {
    const user = getCommentUser(item);

    const name = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();

    return name || 'User';
  };
  const requestId = props?.route?.params?.requestId ?? props?.route?.params?.id;
  //?? props?.route?.params?.item?.requestId
  console.log('flagraising', requestId);

  const requestStatus = details?.status?.toLowerCase();
  console.log('requestStatus', requestStatus);
  const onRefresh = () => {
    setRefreshing(true);
    fetchDetails(false);
  };
  useEffect(() => {
    fetchDetails(true);
  }, [props?.route?.params?.refreshedAt]);

  const fetchDetails = (showLoader = true) => {
    if (showLoader) {
      setIsLoading(true);
    }

    apiHandler({
      endpoint: ENDPOINTS.flagRaisingReqDetail,
      method: 'GET',
      queryParams: {requestId},
      authContext: 'RESIDENT',
      onComplete: (resp: any) => {
        setIsLoading(false);
        setRefreshing(false);
        if (resp?.status) {
          setDetails(resp?.data);
          console.log('flag detail response data ', resp.data);
        } else {
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.error,
              message: getErrorMessage(resp || 'yooo'),
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
        text={'Flag Raising Requests'}
      />

      {isLoading ? (
        <View style={styles.loaderCont}>
          <ActivityIndicator color={colors.Primary} size={'large'} />
        </View>
      ) : (
        <KeyboardAwareScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.Primary]}
              tintColor={colors.Primary}
            />
          }
          contentContainerStyle={{
            paddingHorizontal: normalized(20),
            paddingBottom: normalized(30),
          }}>
          <View style={{height: normalized(12)}} />
          <View style={styles.itemCont}>
            <Text style={styles.nameTxt}>Requester Details</Text>

            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>{'Name'}</Text>
                <Text
                  style={
                    styles.valueTxt
                  }>{`${details?.firstName} ${details?.lastName}`}</Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>{'Status'}</Text>
                <View
                  style={[
                    styles.statusCont,
                    {
                      backgroundColor:
                        details?.status == 'pending'
                          ? colors.ToastColors.Alarm
                          : details?.status == 'declined'
                          ? colors.ToastColors.Error
                          : colors.Primary,
                      alignSelf: 'flex-start',
                    },
                  ]}>
                  <Text style={styles.statusTxt}>
                    {capitalizeEachWord(details?.status)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>{'Email'}</Text>
                <Text style={[styles.valueTxt, {fontSize: normalized(12)}]}>
                  {details?.email}
                </Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>{'Phone Number'}</Text>
                <Text style={styles.valueTxt}>{details?.phoneNumber}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>{'Organization'}</Text>
                <Text style={styles.valueTxt}>
                  {details?.organizationName ?? 'N/A'}
                </Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>{'Flag Being Raised'}</Text>
                <Text style={styles.valueTxt}>{details?.flagBeingRaised}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>{'Desired Date Raising'}</Text>
                <Text style={styles.valueTxt}>
                  {moment(details?.desiredDateOfRaising).format('LL')}
                </Text>
              </View>

              <View style={styles.item}>
                <Text style={styles.keyTxt}>{'Submission Date'}</Text>
                <Text style={styles.valueTxt}>
                  {moment(details?.createdAt).format('LL')}
                </Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>{'Expected Attendees'}</Text>
                <Text style={styles.valueTxt}>
                  {details?.numberOfAttendeesExpected}
                </Text>
              </View>

              {requestStatus === 'approved' ? (
                <View style={styles.item}>
                  <Text style={styles.keyTxt}>{'Approval Date'}</Text>
                  <Text style={styles.valueTxt}>
                    {details?.approvedAt
                      ? moment(details?.approvedAt).format('LL')
                      : 'N/A'}
                  </Text>
                </View>
              ) : requestStatus === 'declined' ? (
                <View style={styles.item}>
                  <Text style={styles.keyTxt}>{'Reject Info'}</Text>
                  <Text style={styles.valueTxt}>
                    {details?.declinedInfo?.reason}
                  </Text>
                </View>
              ) : null}
            </View>

            <View style={styles.item}>
              <Text style={styles.keyTxt}>{'Event Description'}</Text>
              <Text style={styles.valueTxt}>{details?.descriptionOfEvent}</Text>
            </View>
          </View>

          <View style={{height: normalized(16)}} />
          <CustomSwitcher
            list={[{name: 'Comments'}]}
            selectedIndex={0}
            onChange={() => {}}
          />
          <RequestCommentsSection
            comments={details?.comments || []}
            loading={commentLoading}
            getIsOwner={item => Boolean(item?.resident?.id === userData?.id)}
            getAuthorName={getCommentUserName}
            getInitial={item => getCommentUserName(item)?.charAt(0)}
            getCommentHtml={item => item?.comment}
            getCommentDate={item => item?.createdAt}
            disabled={
              requestStatus === 'declined' || requestStatus === 'approved'
            }
            canShowEdit={item =>
              requestStatus !== 'declined' &&
              !item?.isEdited &&
              Boolean(item?.resident?.id === userData?.id)
            }
            showComposer={
              requestStatus !== 'declined' && requestStatus !== 'approved'
            }
            onCreateComment={async comment => {
              if (commentLoading) return false;

              const htmlComment = String(comment || '').trim();
              const plainComment = removeHtmlTags(htmlComment);

              if (!plainComment) {
                dispatch(
                  setShowToast({
                    type: AppStrings.ToastType.error,
                    message: 'Please enter a comment.',
                  }),
                );
                return false;
              }

              setCommentLoading(true);

              try {
                const resp = await requestCommentsService.createComment({
                  endpoint: ENDPOINTS.flagRaisingComments,
                  authContext: 'RESIDENT',
                  payload: {requestId, comment: htmlComment},
                });

                if (resp?.status) {
                  fetchDetails(false);
                  dispatch(
                    setShowToast({
                      type: AppStrings.ToastType.success,
                      message: 'Comment Successfully Posted',
                    }),
                  );
                  return true;
                }

                dispatch(
                  setShowToast({
                    type: AppStrings.ToastType.error,
                    message: getErrorMessage(resp),
                  }),
                );
                return false;
              } finally {
                setCommentLoading(false);
              }
            }}
            onUpdateComment={async (comment, item) => {
              if (commentLoading) return false;

              const htmlComment = String(comment || '').trim();
              const plainComment = removeHtmlTags(htmlComment);

              if (!plainComment) {
                dispatch(
                  setShowToast({
                    type: AppStrings.ToastType.error,
                    message: 'Please enter a comment.',
                  }),
                );
                return false;
              }

              setCommentLoading(true);

              try {
                const resp = await requestCommentsService.updateComment({
                  endpoint: ENDPOINTS.flagRaisingComments,
                  authContext: 'RESIDENT',
                  queryParams: {commentId: item?.id},
                  payload: {
                    requestId,
                    comment: htmlComment,
                  },
                });

                if (resp?.status) {
                  fetchDetails(false);
                  dispatch(
                    setShowToast({
                      type: AppStrings.ToastType.success,
                      message: 'Comment Updated',
                    }),
                  );
                  return true;
                }

                dispatch(
                  setShowToast({
                    type: AppStrings.ToastType.error,
                    message: getErrorMessage(resp),
                  }),
                );
                return false;
              } finally {
                setCommentLoading(false); // runs on success AND failure
              }
            }}
          />
        </KeyboardAwareScrollView>
      )}
    </View>
  );
};

export default FlagRaisingReqDetailScreen;

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
  });
