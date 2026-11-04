import {
  Animated,
  Easing,
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../../Redux/AppStore';
import {AppStyles} from '../../../Utils/AppStyles';
import {
  AppFonts,
  AppHorizontalMargin,
  dateFormat,
  normalized,
  ScreenProps,
  ScreenSize,
} from '../../../Utils/AppConstants';
import CustomHeader from '../../Components/CustomHeader';
import CustomButton from '../../Components/CustomButton';
import {Routes} from '../../../Utils/Routes';
import ForwardArrowIcon from '../../Svg/ForwardArrowIcon';
import CustomDrawer from '../../Components/CustomDrawer';
import moment from 'moment';
import {
  capitalizeEachWord,
  getErrorMessage,
  getStatusColor,
} from '../../../Utils/Helper';
import {useIsFocused} from '@react-navigation/native';
import {apiHandler} from '../../../Network/Services/ApiHandler';
import {setShowToast} from '../../../Redux/AppReducers';
import {AppStrings, Empty_Screen_Type} from '../../../Utils/AppStrings';
import {HELP_DESK_LIST_ACTIONS} from '../Components/HelpDeskActions';
import EmptyComp from '../../Components/EmptyComp';
import {useDrawer} from '../../../Hooks/DrawerAnimation';

const ApprovalScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const selector: any = useSelector(
    (state: AppRootStore) => state.SliceReducer,
  );
  const [queryParams, setQueryparams] = useState({});
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [totalItems, setTotalItems] = useState<any>('');
  const [search, setSearch] = useState('');
  const [list, setList] = useState<any>([]);
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const {isDrawerOpen, drawerAnim, overlayAnim, openDrawer, closeDrawer} =
    useDrawer();

  const actionKey = props?.route?.params?.actionKey ?? 'pendingTicketApprovals';
  const actionConfig =
    HELP_DESK_LIST_ACTIONS[actionKey] ??
    HELP_DESK_LIST_ACTIONS.pendingTicketApprovals;

  useEffect(() => {
    fetchApprovals();
  }, [page, isFocused, search]);

  const fetchApprovals = () => {
    setIsLoading(true);

    apiHandler({
      endpoint: actionConfig.endpoint,
      method: 'GET',
      queryParams: {
        ...actionConfig.queryParams,
        page,
        pageSize: 10,
        query: search,
      },
      authContext: 'HELPDESK',
      onComplete: (resp: any) => {
        console.log('My Approvals Response --->', resp);
        setIsLoading(false);

        if (resp?.status) {
          const approvals = resp?.data?.data || [];

          setTotalItems(resp?.data?.pagination?.totalItems || 0);

          if (page === 1) {
            setList(approvals);
          } else {
            setList((prevList: any) => [
              ...prevList,
              ...approvals.filter(
                (item: any) =>
                  !prevList.some((prevItem: any) => prevItem.id === item.id),
              ),
            ]);
          }
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
        text={actionConfig?.title ?? 'My Approvals'}
        onSidePanel={openDrawer}
      />
      {list.length === 0 && isLoading ? (
        <View style={styles.loaderCont}>
          <ActivityIndicator color={colors.Primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={list}
          contentContainerStyle={styles.listCont}
          keyExtractor={(item: any, index: number) => String(item?.id ?? index)}
          renderItem={({item}: any) => {
            const approvalItem = item?.[actionConfig?.detailKey] ?? item;

            const categoryName = approvalItem?.ticketCategory?.name ?? 'N/A';
            const typeName =
              approvalItem?.type?.name ??
              approvalItem?.changeType ??
              approvalItem?.problemType ??
              'N/A';

            const statusName =
              approvalItem?.extendedStatus?.name ||
              approvalItem?.status ||
              item?.status ||
              'N/A';

            const statusColor =
              approvalItem?.extendedStatus?.bgColor ||
              getStatusColor(statusName, colors);

            const priorityName =
              approvalItem?.priority?.name ||
              approvalItem?.initialPriority ||
              'N/A';

            console.log('items in approval screen ', approvalItem);
            const priorityColor =
              approvalItem?.priority?.bgColor ||
              (priorityName !== 'N/A'
                ? getStatusColor(priorityName, colors)
                : 'transparent');

            const requesterName = approvalItem?.requester
              ? `${approvalItem?.requester?.firstName ?? ''} ${
                  approvalItem?.requester?.lastName ?? ''
                }`.trim()
              : 'N/A';

            const displayId =
              actionConfig?.detailKey === 'ticket'
                ? approvalItem?.ticketId || 'N/A'
                : actionConfig?.detailKey === 'change'
                ? approvalItem?.changeId ||
                  (approvalItem?.id ? `CH#${approvalItem.id}` : 'N/A')
                : approvalItem?.problemId ||
                  (approvalItem?.id ? `PR#${approvalItem.id}` : 'N/A');

            return (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  props?.navigation?.navigate(
                    Routes.HelpDesk.TicketDetailScreen,
                    {
                      item: approvalItem,
                      id: approvalItem?.id,
                      approvalItem: item,
                      actionKey,
                      type: actionConfig?.detailKey,
                      isApprovalFlow: true,
                    },
                  )
                }
                style={styles.itemCont}>
                <Text style={styles.idTxt}>{displayId}</Text>

                <View style={styles.rowCont}>
                  <View style={styles.item}>
                    <Text style={styles.keyTxt}>Title</Text>
                    <Text style={styles.valueTxt}>
                      {approvalItem?.title ?? 'N/A'}
                    </Text>
                  </View>

                  <View style={styles.item}>
                    <Text style={styles.keyTxt}>Requested By</Text>
                    <Text style={styles.valueTxt}>{requesterName}</Text>
                  </View>
                </View>

                <View style={styles.rowCont}>
                  <View style={styles.item}>
                    <Text style={styles.keyTxt}>Category</Text>
                    <Text style={styles.valueTxt}>{categoryName}</Text>
                  </View>

                  <View style={styles.item}>
                    <Text style={styles.keyTxt}>Type</Text>
                    <Text style={styles.valueTxt}>{typeName}</Text>
                  </View>
                </View>

                <View style={styles.rowCont}>
                  <View style={styles.item}>
                    <Text style={styles.keyTxt}>Submitted</Text>
                    <Text style={styles.valueTxt}>
                      {approvalItem?.createdAt
                        ? moment(approvalItem?.createdAt).format(dateFormat)
                        : 'N/A'}
                    </Text>
                  </View>

                  <View style={styles.item}>
                    <Text style={styles.keyTxt}>Due Date</Text>
                    <Text style={styles.valueTxt}>
                      {approvalItem?.dueDate
                        ? moment(approvalItem?.dueDate).format('LL')
                        : 'N/A'}
                    </Text>
                  </View>
                </View>

                <View style={styles.rowCont}>
                  <View style={styles.item}>
                    <Text style={styles.keyTxt}>Priority</Text>
                    <View style={{maxWidth: normalized(170)}}>
                      <View
                        style={[
                          styles.statusCont,
                          {
                            backgroundColor: priorityColor,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.statusTxt,
                            {
                              color:
                                priorityName !== 'N/A'
                                  ? colors.White
                                  : colors.Heading_Txt,
                            },
                          ]}>
                          {capitalizeEachWord(priorityName)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.item}>
                    <Text style={styles.keyTxt}>Approval Status</Text>
                    <View style={{maxWidth: normalized(170)}}>
                      <View
                        style={[
                          styles.statusCont,
                          {
                            backgroundColor: getStatusColor(
                              item?.status,
                              colors,
                            ),
                          },
                        ]}>
                        <Text style={styles.statusTxt}>
                          {capitalizeEachWord(item?.status ?? 'N/A')}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={() =>
            !isLoading ? (
              <View style={styles.emptyCont}>
                <EmptyComp
                  type={Empty_Screen_Type.List}
                  subText="No Approval Requests Found"
                />
              </View>
            ) : null
          }
          ListFooterComponent={() => <View style={{height: normalized(50)}} />}
        />
      )}
      <CustomDrawer
        isVisible={isDrawerOpen}
        drawerAnim={drawerAnim}
        overlayAnim={overlayAnim}
        onClose={closeDrawer}
        topOffset={insects.top + normalized(Platform.OS == 'ios' ? 36 : 52)}
        closeDrawer={closeDrawer}
        onApply={(queryString: any, params: any) => {
          setQueryparams(params);
          setPage(1);
        }}
      />
    </View>
  );
};

export default ApprovalScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.ScreenBackground,
    },
    idTxt: {
      fontSize: normalized(18),
      color: colors.Heading_Txt,
      fontFamily: AppFonts.UbuntuBold,
    },
    listCont: {
      marginTop: normalized(15),
      gap: normalized(12),
      paddingHorizontal: AppHorizontalMargin,
    },
    createTicketWrap: {
      marginBottom: normalized(4),
    },
    emptyCont: {
      paddingVertical: normalized(30),
      alignItems: 'center',
      justifyContent: 'center',
    },
    loaderCont: {
      minHeight: ScreenSize.height / 1.4,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
