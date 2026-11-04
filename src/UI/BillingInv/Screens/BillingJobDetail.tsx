import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import moment from 'moment';
import {AppRootStore} from '../../../Redux/AppStore';
import {AppStyles} from '../../../Utils/AppStyles';
import {AppFonts, normalized, ScreenProps} from '../../../Utils/AppConstants';
import CustomHeader from '../../Components/CustomHeader';
import RequestCommentsSection from '../../Components/RequestCommentsSection';
import {requestCommentsService} from '../../../Network/Services/RequestCommentsService';
import {ENDPOINTS} from '../../../Network/Urls';
import {setShowToast} from '../../../Redux/AppReducers';
import {AppStrings} from '../../../Utils/AppStrings';
import {
  capitalizeEachWord,
  formatStatus,
  getErrorMessage,
  getStatusColor,
} from '../../../Utils/Helper';
import {apiHandler} from '../../../Network/Services/ApiHandler';
import CustomSwitcher from '../../Components/CustomSwitcher';
import {useDeepLinkGuard} from '../../../Hooks/DeepLinkGuard';

const DetailItem = ({
  label,
  value,
  styles,
  isStatus,
  statusColor,
}: {
  label: string;
  value: any;
  styles: any;
  isStatus?: boolean;
  statusColor?: string;
}) => (
  <View style={styles.item}>
    <Text style={styles.keyTxt}>{label}:</Text>
    {isStatus ? (
      <View
        style={[
          styles.statusCont,
          {backgroundColor: statusColor, alignSelf: 'flex-start'},
        ]}>
        <Text style={styles.statusTxt}>{value}</Text>
      </View>
    ) : (
      <Text style={styles.valueTxt}>{value ?? 'N/A'}</Text>
    )}
  </View>
);

const BillingJobDetails = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const dispatch = useDispatch();
  const selector: any = useSelector(
    (state: AppRootStore) => state.SliceReducer,
  );
  const colors = selector?.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  const passedItem = props?.route?.params?.item;

  const userData = selector?.damUserData;

  const isOffline = !selector?.isNetConnected;

  const [jobDetails, setJobDetails] = useState<any>(passedItem);
  const [refreshing, setRefreshing] = useState(false);

  const [flatComments, setFlatComments] = useState<any[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);

  const [loading, setIsLoading] = useState(false);

  const {isBlocked} = useDeepLinkGuard(userData);
  if (isBlocked) {
    return (
      <View style={[styles.container, styles.loaderCont]}>
        <ActivityIndicator color={colors.Primary} size="large" />
      </View>
    );
  }

  useEffect(() => {
    fetchJobDetails();
  }, []);

  const fetchJobDetails = () => {
    setIsLoading(true);
    apiHandler({
      endpoint: ENDPOINTS.jobListingDetails,
      method: 'GET',
      authContext: 'DAM',
      requiresAuth: true,
      useRecaptcha: true,
      queryParams: {id: passedItem?.id},
      onComplete: (resp: any) => {
        console.log('Job listing details', resp);
        if (resp?.status) {
          setIsLoading(false);
          const details = resp?.data?.data ?? passedItem;
          setJobDetails(details);
          setFlatComments(details?.comments ?? []);
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

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchJobDetails()]);
    setRefreshing(false);
  };

  const formatDateTime = (val: any) =>
    val ? moment(val).format('MMM D, YYYY, h:mm:ss A') : 'N/A';

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
        text={'Job Details'}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: normalized(20),
          paddingBottom: normalized(30),
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.Primary}
            colors={[colors.Primary]}
          />
        }>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Job Details</Text>

          <View style={styles.row}>
            <DetailItem
              label="Job ID"
              value={jobDetails?.jobId}
              styles={styles}
            />
            <DetailItem
              label="Status"
              value={formatStatus(jobDetails?.status)}
              isStatus
              statusColor={getStatusColor(jobDetails?.status, colors)}
              styles={styles}
            />
          </View>

          <View style={styles.row}>
            <DetailItem
              label="Category"
              value={jobDetails?.category?.name}
              styles={styles}
            />
            <DetailItem
              label="Job Type"
              value={jobDetails?.jobType?.name}
              styles={styles}
            />
          </View>

          {!!jobDetails?.projectName && (
            <View style={styles.row}>
              <DetailItem
                label="Project Name"
                value={jobDetails?.projectName}
                styles={styles}
              />
              <DetailItem
                label="Hiring Company"
                value={jobDetails?.hiringCompany}
                styles={styles}
              />
            </View>
          )}

          {!jobDetails?.projectName && (
            <View style={styles.row}>
              <DetailItem
                label="Hiring Company"
                value={jobDetails?.hiringCompany}
                styles={styles}
              />
              <DetailItem
                label="Job Site Supervisor"
                value={jobDetails?.jobSiteSupervisor}
                styles={styles}
              />
            </View>
          )}

          {!!jobDetails?.projectName && (
            <View style={styles.row}>
              <DetailItem
                label="Hiring Date"
                value={formatDateTime(jobDetails?.hiringDate)}
                styles={styles}
              />
              <DetailItem
                label="Job Site Supervisor"
                value={jobDetails?.jobSiteSupervisor}
                styles={styles}
              />
            </View>
          )}

          {!jobDetails?.projectName && (
            <View style={styles.row}>
              <DetailItem
                label="Hiring Date"
                value={formatDateTime(jobDetails?.hiringDate)}
                styles={styles}
              />
              <View style={styles.item} />
            </View>
          )}

          <View style={styles.row}>
            <DetailItem
              label="Time Officer Arrived"
              value={jobDetails?.timeOfficerArrived}
              styles={styles}
            />
            <DetailItem
              label="Time Officer Quit"
              value={jobDetails?.timeOfficerQuit}
              styles={styles}
            />
          </View>

          <View style={styles.row}>
            <DetailItem
              label="Total Hours Requested"
              value={jobDetails?.totalHoursRequested}
              styles={styles}
            />
            <DetailItem
              label="Cruiser Requested"
              value={jobDetails?.cruiserRequested ? 'Yes' : 'No'}
              styles={styles}
            />
          </View>

          <View style={styles.row}>
            <DetailItem
              label="Job Site Location"
              value={jobDetails?.jobSiteLocation}
              styles={styles}
            />
          </View>

          <View style={styles.row}>
            <DetailItem
              label="Created At"
              value={formatDateTime(jobDetails?.createdAt)}
              styles={styles}
            />
            <DetailItem
              label="Last Updated"
              value={formatDateTime(jobDetails?.updatedAt)}
              styles={styles}
            />
          </View>
        </View>

        <View style={{height: normalized(16)}} />
        <CustomSwitcher
          list={[{name: 'Comments'}]}
          selectedIndex={0}
          onChange={() => {}}
        />
        <RequestCommentsSection
          comments={flatComments}
          loading={commentLoading}
          disabled={false}
          getIsOwner={item => item?.createdBy?.id === userData?.id}
          getAuthorName={item => item?.createdBy?.vendorName ?? 'Vendor'}
          getAvatarPath={item => item?.createdBy?.profilePicture}
          getInitial={item => item?.createdBy?.vendorName?.charAt(0)}
          getCommentHtml={item => item?.comment}
          getCommentDate={item => item?.createdAt}
          canEditComment={item => !item?.isEdited}
          canShowEdit={item =>
            item?.createdBy?.id === userData?.id && !item?.isEdited
          }
          showComposer
          onCreateComment={async comment => {
            if (isOffline || !comment) return false;
            setCommentLoading(true);
            console.log('job details', jobDetails);
            const resp = await requestCommentsService.createComment({
              endpoint: `${ENDPOINTS.jobDetailComment}comment/`,
              authContext: 'DAM',
              payload: {jobId: jobDetails?.id, comment, isInternal: false},
            });

            setCommentLoading(false);
            if (resp?.status) {
              fetchJobDetails();
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
          }}
          onUpdateComment={async (comment, item) => {
            if (isOffline) return false;
            setCommentLoading(true);

            const resp = await requestCommentsService.updateComment({
              endpoint: `${ENDPOINTS.jobDetailComment}updateComment/`,
              authContext: 'DAM',
              payload: {commentId: item?.id, comment},
            });

            setCommentLoading(false);
            if (resp?.status) {
              fetchJobDetails();
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
          }}
        />
      </ScrollView>
    </View>
  );
};

export default BillingJobDetails;

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
    card: {
      width: '100%',
      borderWidth: 1,
      borderRadius: normalized(8),
      borderColor: colors.BorderColor,
      padding: normalized(14),
      gap: normalized(12),
      marginTop: normalized(15),
      marginBottom: normalized(20),
    },
    cardTitle: {
      fontSize: normalized(16),
      fontFamily: AppFonts.UbuntuBold,
      color: colors.Heading_Txt,
      marginBottom: normalized(4),
    },
    row: {
      flexDirection: 'row',
      gap: normalized(12),
    },
    item: {
      flex: 1,
      gap: normalized(4),
    },
    keyTxt: {
      fontSize: normalized(12),
      color: colors.Desc_Txt,
      fontFamily: AppFonts.UbuntuRegular,
    },
    valueTxt: {
      fontSize: normalized(14),
      color: colors.Heading_Txt,
      fontFamily: AppFonts.UbuntuMedium,
    },
    statusCont: {
      borderRadius: normalized(100),
      paddingHorizontal: normalized(10),
      paddingVertical: normalized(4),
    },
    statusTxt: {
      fontSize: normalized(12),
      fontFamily: AppFonts.UbuntuMedium,
      color: colors.White,
    },
  });
