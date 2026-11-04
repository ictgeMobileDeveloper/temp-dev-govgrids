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
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  AppFonts,
  AppHorizontalMargin,
  dateFormat,
  normalized,
  ScreenProps,
  ScreenSize,
  HelpDesk_Status_List,
} from '../../../Utils/AppConstants';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../../Redux/AppStore';
import {AppStyles} from '../../../Utils/AppStyles';
import CustomHeader from '../../Components/CustomHeader';
import CustomDrawer from '../../Components/CustomDrawer';
import {Routes} from '../../../Utils/Routes';
import {
  capitalizeEachWord,
  getErrorMessage,
  getStatusColor,
  normalizeValue,
} from '../../../Utils/Helper';
import moment from 'moment';
import {apiHandler} from '../../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../../Network/Urls';
import {AppStrings, Empty_Screen_Type} from '../../../Utils/AppStrings';
import {setShowToast} from '../../../Redux/AppReducers';
import {useIsFocused} from '@react-navigation/native';
import {HELP_DESK_LIST_ACTIONS} from '../Components/HelpDeskActions';
import EmptyComp from '../../Components/EmptyComp';
import CustomInput from '../../Components/CustomInput';
import LinearGradient from 'react-native-linear-gradient';
import SideFilterIcon from '../../Svg/SideFilterIcon';
import {useDrawer} from '../../../Hooks/DrawerAnimation';

const TicketsScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const dispatch = useDispatch();
  const isWatchScreen: any = props?.route?.params?.isWatchScreen ?? false;
  const authContext = props?.route?.params?.authContext ?? 'RESIDENT';
  const selector: any = useSelector(
    (state: AppRootStore) => state.SliceReducer,
  );

  const [queryParams, setQueryParams] = useState<Record<string, any>>({});
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const isManualRefreshRef = useRef(false);
  const [totalItems, setTotalItems] = useState<any>('');
  const [search, setSearch] = useState('');
  const [list, setList] = useState<any>([]);
  const isFocused = useIsFocused();

  const actionKey = props?.route?.params?.actionKey ?? 'myTickets';
  const actionConfig = HELP_DESK_LIST_ACTIONS[actionKey];
  const {isDrawerOpen, drawerAnim, overlayAnim, openDrawer, closeDrawer} =
    useDrawer();

  const getDisplayItem = (item: any) => {
    if (actionConfig?.itemKey === 'approval') {
      return item?.[actionConfig?.detailKey] ?? item;
    }

    return item;
  };

  const getDisplayId = (item: any) => {
    const displayItem = getDisplayItem(item);

    if (actionConfig?.detailKey === 'ticket') {
      return displayItem?.ticketId || 'N/A';
    }

    if (actionConfig?.detailKey === 'change') {
      return (
        displayItem?.changeId ||
        (displayItem?.id ? `CH#${displayItem.id}` : 'N/A')
      );
    }

    if (actionConfig?.detailKey === 'problem') {
      return (
        displayItem?.problemId ||
        (displayItem?.id ? `PR#${displayItem.id}` : 'N/A')
      );
    }

    return 'N/A';
  };

  useEffect(() => {
    if (isFocused) {
      fetchTickets();
    }
  }, [page, isFocused, search, queryParams]);

  const onRefresh = () => {
    isManualRefreshRef.current = true;
    setRefreshing(true);

    if (page !== 1) {
      setPage(1);
      return;
    }

    fetchTickets();
  };

  const fetchTickets = async () => {
    const isManualRefresh = isManualRefreshRef.current;

    if (!isManualRefresh) {
      setIsLoading(true);
    }

    apiHandler({
      endpoint: actionConfig.endpoint,
      method: 'GET',
      authContext: 'HELPDESK',
      queryParams: {
        ...actionConfig.queryParams,
        ...queryParams,

        page,
        pageSize: 10,
      },
      onComplete: (resp: any) => {
        isManualRefreshRef.current = false;
        setRefreshing(false);
        setIsLoading(false);

        if (resp?.status) {
          const items = resp?.data?.data || [];

          setTotalItems(resp?.data?.pagination?.totalItems || 0);

          if (page === 1) {
            setList(items);
          } else {
            setList((prevList: any) => [
              ...prevList,
              ...items.filter(
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
        text={actionConfig?.title ?? 'Tickets'}
      />
      <View
        style={[
          styles.row,
          {
            marginTop: normalized(12),
            gap: normalized(10),
            paddingHorizontal: normalized(20),
          },
        ]}>
        <View style={{flex: 1}}>
          <CustomInput
            value={search}
            setValue={setSearch}
            placeholder={'Search'}
            placeholderColor={colors.Heading_Txt}
            style={{height: normalized(45)}}
          />
        </View>
        <LinearGradient
          colors={[colors.Primary, colors.Secondary]}
          style={styles.sidePanelCont}>
          <TouchableOpacity activeOpacity={1} onPress={openDrawer}>
            <SideFilterIcon />
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {list.length === 0 && isLoading ? (
        <View style={styles.loaderCont}>
          <ActivityIndicator color={colors.Primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={list}
          contentContainerStyle={styles.listCont}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.Primary}
              colors={[colors.Primary]}
            />
          }
          renderItem={({item}) => {
            const displayItem = getDisplayItem(item);

            const categoryName = displayItem?.ticketCategory?.name ?? '--';

            const typeName =
              displayItem?.type?.name ??
              displayItem?.changeType ??
              displayItem?.problemType ??
              '--';

            const statusName = displayItem?.status || '--';

            const statusColor = getStatusColor(statusName, colors);

            const priorityName =
              displayItem?.priority?.name ||
              displayItem?.initialPriority ||
              '--';

            const priorityColor =
              displayItem?.priority?.bgColor ||
              (priorityName !== '--'
                ? getStatusColor(priorityName, colors)
                : 'transparent');

            return (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  props?.navigation?.navigate(
                    Routes.HelpDesk.TicketDetailScreen,
                    {
                      item: displayItem,
                      id: displayItem?.id,
                      actionKey,
                      type: actionConfig?.detailKey,
                    },
                  )
                }
                style={styles.itemCont}>
                <Text style={styles.idTxt}>{getDisplayId(item)}</Text>

                <View style={styles.rowCont}>
                  <View style={styles.item}>
                    <Text style={styles.keyTxt}>Title</Text>
                    <Text style={styles.valueTxt}>
                      {normalizeValue(displayItem?.title)}
                    </Text>
                  </View>

                  <View style={styles.item}>
                    <Text style={styles.keyTxt}>Category</Text>
                    <Text style={styles.valueTxt}>{categoryName}</Text>
                  </View>
                </View>

                <View style={styles.rowCont}>
                  <View style={styles.item}>
                    <Text style={styles.keyTxt}>Type</Text>
                    <Text style={styles.valueTxt}>{typeName}</Text>
                  </View>

                  <View style={styles.item}>
                    <Text style={styles.keyTxt}>Status</Text>
                    <View style={{maxWidth: normalized(170)}}>
                      <View
                        style={[
                          styles.statusCont,
                          {
                            backgroundColor: statusColor,
                          },
                        ]}>
                        <Text style={styles.statusTxt}>
                          {capitalizeEachWord(statusName)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.rowCont}>
                  <View style={styles.item}>
                    <Text style={styles.keyTxt}>Due Date</Text>
                    <Text style={styles.valueTxt}>
                      {displayItem?.dueDate
                        ? moment(displayItem?.dueDate).format('LL')
                        : 'N/A'}
                    </Text>
                  </View>

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
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={() =>
            !isLoading ? (
              <View style={styles.emptyCont}>
                <EmptyComp
                  type={Empty_Screen_Type.List}
                  subText={`No ${actionConfig?.detailKey} Found`}
                />
              </View>
            ) : null
          }
          // ListFooterComponent={() => <View style={{height: normalized(50)}} />}
          ListFooterComponent={() =>
            list.length < totalItems && !refreshing ? (
              <View style={{height: normalized(40), marginTop: normalized(12)}}>
                <ActivityIndicator size="large" color={colors.Primary} />
              </View>
            ) : (
              <View style={{height: normalized(30)}} />
            )
          }
          onEndReachedThreshold={0.2}
          onEndReached={() => {
            if (!isLoading && !refreshing && list.length < totalItems) {
              setPage(prev => prev + 1);
            }
          }}
        />
      )}

      <CustomDrawer
        isVisible={isDrawerOpen}
        drawerAnim={drawerAnim}
        overlayAnim={overlayAnim}
        onClose={closeDrawer}
        topOffset={insects.top + normalized(Platform.OS == 'ios' ? 36 : 52)}
        closeDrawer={closeDrawer}
        statusList={HelpDesk_Status_List}
        hidePaymentStatus={true}
        hideSortBy={false}
        onApply={(queryString: any, params: any) => {
          setQueryParams(params);
          setPage(1);
        }}
      />
    </View>
  );
};

export default TicketsScreen;

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
      minHeight: ScreenSize.height / 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loaderCont: {
      minHeight: ScreenSize.height / 1.4,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
