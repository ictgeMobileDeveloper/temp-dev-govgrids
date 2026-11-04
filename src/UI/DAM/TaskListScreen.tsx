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
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {
  useWebSocket,
  WebSocketProvider,
} from '../../Network/Services/WebSocketProvider';
import {
  AppFonts,
  jobStatusList,
  normalized,
  ScreenProps,
  ScreenSize,
  sortingList,
  taskStatusList,
} from '../../Utils/AppConstants';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppStyles} from '../../Utils/AppStyles';
import {useIsFocused} from '@react-navigation/native';
import MainHeader from '../Components/MainHeader';
import {Routes} from '../../Utils/Routes';
import CustomButton from '../Components/CustomButton';
import ForwardArrowIcon from '../Svg/ForwardArrowIcon';
import CustomInput from '../Components/CustomInput';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../Network/Urls';
import {setShowToast} from '../../Redux/AppReducers';
import {AppStrings, Empty_Screen_Type} from '../../Utils/AppStrings';
import {
  capitalizeEachWord,
  getErrorMessage,
  getStatusColor,
} from '../../Utils/Helper';
import CustomDropDownList from '../Components/CustomDropDownList';
import moment from 'moment';
import CustomHeader from '../Components/CustomHeader';
import EmptyComp from '../Components/EmptyComp';

const Comp = ({item, onPress}: any) => {
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
      style={styles.itemCont}>
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
            onPress={() => {}}>
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

const TaskListScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector?.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  const isFocused = useIsFocused();
  const dispatch = useDispatch();

  const [isShowThemeModal, setIsShowThemeModal] = useState(false);
  const [search, setSearch] = useState('');
  const [requestIdError, setRequestIdError] = useState('');
  const [searchLoader, setSearchLoader] = useState(false);
  const [requestList, setRequestList] = useState<any[]>([]);
  const [requestLoader, setRequestLoader] = useState(false);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [sortIndex, setSortIndex] = useState<any>(null);
  const [statusIndex, setStatusIndex] = useState<any>(null);
  // const {getUnreadCount} = useWebSocket();

  useEffect(() => {
    getTaskList();
  }, []);

  useEffect(() => {
    getTaskList();
  }, [page, isFocused, sortIndex, statusIndex]);

  const getTaskList = () => {
    page === 1 && setRequestLoader(true);

    apiHandler({
      endpoint: ENDPOINTS.tasksList,
      method: 'GET',
      queryParams: {
        page: page,
        pageSize: 10,
        query: search,
        sort: sortIndex ? sortingList[sortIndex]?.key : '',
      },
      authContext: 'DAM',
      onComplete: (resp: any) => {
        if (resp?.status) {
          setRequestLoader(false);
          setSearchLoader(false);
          setTotalItems(resp?.data?.pagination?.totalItems ?? 0);

          const payload = resp?.data?.data;
          const data = Array.isArray(payload?.data) ? payload.data : [];
          if (page === 1) {
            setRequestList(payload);
          } else {
            setRequestList(prev => [
              ...prev,
              ...data.filter(
                (it: any) =>
                  !prev.some(
                    (p: any) => (p?.id ?? p?.NO) === (it?.id ?? it?.NO),
                  ),
              ),
            ]);
          }
        } else {
          setRequestLoader(false);
          setSearchLoader(false);
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

  const onSearch = () => {
    if (search.trim() === '') {
      setRequestIdError('...');
      return;
    }
    setRequestIdError('');
    setSearchLoader(true);
    setPage(1);
    getTaskList();
  };

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
        text={'Tasks'}
      />

      <FlatList
        data={[1, 2, 3, 4]}
        contentContainerStyle={{paddingHorizontal: normalized(20)}}
        keyExtractor={(_, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        renderItem={({index}) => (
          <>
            {index === 1 ? (
              <>
                <Text style={styles.trackTxt}>Search Request</Text>
                <View style={{height: normalized(5)}} />
                <View style={styles.reqCont}>
                  <View style={{flex: 1}}>
                    <CustomInput
                      placeholder="Query"
                      placeholderColor={colors.Heading_Txt}
                      value={search}
                      setValue={(v: string) => {
                        setRequestIdError('');
                        setSearch(v);
                        if (v === '') {
                          setPage(1);
                          getTaskList();
                        }
                      }}
                      errorMsg={requestIdError}
                    />
                  </View>
                  <View
                    style={{
                      width: normalized(75),
                      marginBottom: normalized(3),
                    }}>
                    <CustomButton
                      text="Search"
                      onPress={onSearch}
                      loading={searchLoader}
                      style={{marginTop: 0}}
                    />
                  </View>
                </View>
              </>
            ) : index == 2 ? (
              <>
                <View
                  style={[
                    styles.row,
                    {marginTop: normalized(12), gap: normalized(10)},
                  ]}>
                  <View style={{flex: 1}}>
                    <CustomDropDownList
                      list={sortingList.map(o => o.label)}
                      selectedIndex={sortIndex}
                      onChange={i => setSortIndex(i)}
                      placeholder="Sort By"
                      listStyle={styles.dropdownList}
                    />
                  </View>
                  <View style={{flex: 1}}>
                    <CustomDropDownList
                      list={taskStatusList.map(o => o.label)}
                      selectedIndex={statusIndex}
                      onChange={i => setStatusIndex(i)}
                      placeholder="Status"
                      listStyle={styles.dropdownList}
                    />
                  </View>
                </View>
              </>
            ) : index === 3 ? (
              <>
                {/* <Text style={styles.headTxt}>Jobs</Text> */}

                {requestList?.length === 0 && requestLoader ? (
                  <View style={styles.loaderCont}>
                    <ActivityIndicator color={colors.Primary} size="large" />
                  </View>
                ) : (
                  <FlatList
                    data={requestList}
                    keyExtractor={(item, index) =>
                      String(item?.id ?? item?.NO ?? index)
                    }
                    style={{
                      marginTop: normalized(10),
                      marginBottom: normalized(30),
                      gap: normalized(12),
                    }}
                    showsVerticalScrollIndicator={false}
                    renderItem={({item}: any) => (
                      // <View />
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
                      />
                    )}
                    ListFooterComponent={() =>
                      requestList.length != totalItems &&
                      requestList.length < totalItems ? (
                        <View
                          style={{
                            height: normalized(20),
                            marginTop: normalized(12),
                          }}>
                          <ActivityIndicator
                            size="large"
                            color={colors.Primary}
                          />
                        </View>
                      ) : (
                        <View style={{height: normalized(10)}} />
                      )
                    }
                    onEndReachedThreshold={0.2}
                    onEndReached={() => {
                      if (!requestLoader && requestList.length < totalItems) {
                        setPage(prev => prev + 1);
                      }
                    }}
                    ListEmptyComponent={() =>
                      !requestLoader ? (
                        <View style={styles.emptyCont}>
                          <EmptyComp
                            type={Empty_Screen_Type.List}
                            subText="No Request Found"
                          />
                        </View>
                      ) : null
                    }
                  />
                )}
              </>
            ) : null}
          </>
        )}
      />
    </View>
  );
};

export default TaskListScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    btnCont: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: normalized(10),
      marginTop: normalized(12),
    },
    trackTxt: {
      fontSize: normalized(14),
      color: colors.Heading_Txt,
      fontFamily: AppFonts.UbuntuRegular,
      marginTop: normalized(12),
      marginBottom: normalized(3),
    },
    reqCont: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(12),
      width: '100%',
      justifyContent: 'center',
    },
    headTxt: {
      fontSize: normalized(18),
      color: colors.Heading_Txt,
      fontFamily: AppFonts.UbuntuBold,
      marginTop: normalized(5),
    },
    loaderCont: {
      flex: 1,
      minHeight: ScreenSize.height / 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dropdownList: {
      position: 'absolute',
      zIndex: 99,
      top: normalized(45),
      width: '100%',
    },
    emptyCont: {
      height: ScreenSize.height / 2,
      alignItems: 'center',
      justifyContent: 'center',
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
  });
