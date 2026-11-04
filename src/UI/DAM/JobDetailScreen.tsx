import {
  ActivityIndicator,
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {normalized, ScreenProps} from '../../Utils/AppConstants';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import CustomHeader from '../Components/CustomHeader';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../Network/Urls';
import {setShowToast} from '../../Redux/AppReducers';
import {AppStrings} from '../../Utils/AppStrings';
import {
  capitalizeEachWord,
  getErrorMessage,
  getStatusColor,
} from '../../Utils/Helper';
import moment from 'moment';
import {Routes} from '../../Utils/Routes';

const Comp = ({item, onPress, onVersionPress}: any) => {
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const status =
    item?.status?.toLowerCase() == 'pendingapproval'
      ? 'Pending Approval'
      : item?.status?.toLowerCase() == 'inReview'
      ? 'In Review'
      : item?.status?.toLowerCase() == 'changesrequested'
      ? 'Changes Requested'
      : item?.status;

  const version =
    item?.attachments?.find(
      (att: any) => att.status === 'pending' || att.status === 'approved',
    )?.version ?? '';

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      style={[styles.itemCont, {marginBottom: normalized(15)}]}>
      <View style={styles.rowCont}>
        <Text style={styles.nameTxt}>{item?.requestId}</Text>
        <View
          style={[
            styles.statusCont,
            {
              backgroundColor: getStatusColor(item?.status, colors),
            },
          ]}>
          <Text style={styles.statusTxt}>{capitalizeEachWord(status)}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Request Name</Text>
          <Text style={styles.valueTxt}>
            {`${item?.requester?.firstName} ${item?.requester?.lastName}`}
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Title</Text>
          <Text style={styles.valueTxt}>{item?.title}</Text>
        </View>
      </View>

      <View style={[styles.row, {gap: normalized(12)}]}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Assignee Type</Text>
          <Text style={styles.valueTxt}>{item?.assigneeType}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Vendor/Designer</Text>
          <Text style={styles.valueTxt}>
            {`${item?.vendor?.firstName} ${item?.vendor?.lastName}`}
          </Text>
        </View>
      </View>

      <View style={[styles.row, {gap: normalized(12)}]}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Approver</Text>
          <Text style={styles.valueTxt}>
            {`${item?.approver?.firstName} ${item?.approver?.lastName}`}
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Due Date</Text>
          <Text style={styles.valueTxt}>
            {moment(item?.dueDate)?.format('LL')}
          </Text>
        </View>
      </View>

      <View style={[styles.row, {gap: normalized(12)}]}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Priority Level</Text>
          <Text style={styles.valueTxt}>
            {capitalizeEachWord(item?.priorityLevel)}
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Event</Text>
          <Text style={styles.valueTxt}>{item?.event?.title}</Text>
        </View>
      </View>

      <View style={styles.item}>
        <Text style={styles.keyTxt}>Created At</Text>
        <Text style={styles.valueTxt}>
          {moment(item?.createdAt).format('LL')}
        </Text>
      </View>

      <View style={styles.btnRow}>
        {version && (
          <TouchableOpacity
            activeOpacity={1}
            style={styles.btn}
            onPress={() => onVersionPress(version)}>
            <Text style={styles.btnTxt}>{`View V${version}`}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          activeOpacity={1}
          style={styles.btn}
          onPress={onPress}>
          <Text style={styles.btnTxt}>View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const JobDetailScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector?.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const dispatch = useDispatch();
  const userData = selector?.damUserData;
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchReqDetail();
  }, []);

  const fetchReqDetail = () => {
    setIsLoading(true);
    apiHandler({
      endpoint: ENDPOINTS.jobDetail,
      method: 'GET',
      queryParams: {id: props?.route?.params?.item?.id},
      authContext: 'DAM',
      onComplete: (resp: any) => {
        if (resp?.status) {
          setData(resp?.data?.data);
          setIsLoading(false);
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

  if (isLoading) {
    return (
      <View style={styles.loaderCont}>
        <ActivityIndicator size={'large'} color={colors.Primary} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insects.top - normalized(Platform.OS == 'ios' ? 15 : 0),
          paddingBottom: Platform.OS === 'android' ? insects.bottom : 0,
        },
      ]}>
      <StatusBar
        barStyle={selector?.isDarkTheme ? 'light-content' : 'dark-content'}
      />

      <CustomHeader
        onBackPress={() => props?.navigation?.goBack()}
        text={'Job Detail'}
      />

      <FlatList
        data={[1, 2]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          gap: normalized(15),
          marginHorizontal: normalized(20),
          marginVertical: normalized(20),
        }}
        renderItem={({index}) => {
          return (
            <>
              {index == 0 ? (
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => {}}
                  style={styles.itemCont}>
                  <View style={styles.rowCont}>
                    <Text style={styles.nameTxt}>{data?.jobId}</Text>
                    <View
                      style={[
                        {
                          backgroundColor: getStatusColor(data?.status, colors),
                          borderRadius: normalized(70),
                          overflow: 'hidden',
                        },
                        styles.statusCont,
                      ]}>
                      <Text style={styles.statusTxt}>
                        {capitalizeEachWord(
                          data?.status == 'inProgress'
                            ? 'In progress'
                            : data?.status,
                        )}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.row}>
                    <View style={styles.item}>
                      <Text style={styles.keyTxt}>Request Name</Text>
                      <Text style={styles.valueTxt}>
                        {`${data?.requester?.firstName} ${data?.requester?.lastName}`}
                      </Text>
                    </View>
                    <View style={styles.item}>
                      <Text style={styles.keyTxt}>Title</Text>
                      <Text style={styles.valueTxt}>{data?.title}</Text>
                    </View>
                  </View>

                  <View style={[styles.row, {gap: normalized(12)}]}>
                    <View style={styles.item}>
                      <Text style={styles.keyTxt}>Assignee Type</Text>
                      <Text style={styles.valueTxt}>{data?.assigneeType}</Text>
                    </View>
                    <View style={styles.item}>
                      <Text style={styles.keyTxt}>Vendor/Designer</Text>
                      <Text style={styles.valueTxt}>
                        {`${data?.vendor?.firstName} ${data?.vendor?.lastName}`}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.item}>
                    <Text style={styles.keyTxt}>Created At</Text>
                    <Text style={styles.valueTxt}>
                      {moment(data?.createdAt).format('LL')}
                    </Text>
                  </View>
                </TouchableOpacity>
              ) : index == 1 ? (
                <FlatList
                  data={data?.tasks}
                  contentContainerStyle={{gap: normalized(15)}}
                  renderItem={({item}) => (
                    <Comp
                      item={item}
                      onPress={() =>
                        props?.navigation?.navigate(
                          Routes.DAM.TaskDetailScreen,
                          {
                            item: item,
                          },
                        )
                      }
                      onVersionPress={(version: any) => {
                        props?.navigation?.navigate(Routes.DAM.VersionsScreen, {
                          version: version,
                          id: item?.id,
                        });
                      }}
                    />
                  )}
                />
              ) : null}
            </>
          );
        }}
        ListFooterComponent={() => <View style={{height: normalized(40)}} />}
      />
    </View>
  );
};

export default JobDetailScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
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
    loaderCont: {
      flex: 1,
      backgroundColor: colors.Background,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
