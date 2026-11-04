import React, {useMemo, useState, useEffect, useRef} from 'react';
import {
  FlatList,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import {DeviceEventEmitter} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {
  AppFonts,
  normalized,
  ScreenProps,
  ScreenSize,
} from '../../Utils/AppConstants';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import CustomHeader from '../Components/CustomHeader';
import {formatTimeAgo} from '../../Utils/Helper';
import {
  WebSocketProvider,
  useWebSocket,
} from '../../Network/Services/WebSocketProvider';
import {Routes} from '../../Utils/Routes';
import EmptyComp from '../Components/EmptyComp';
import {AuthContext, Empty_Screen_Type} from '../../Utils/AppStrings';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../Network/Urls';

/** ---------------- Item component ---------------- */

const Comp = ({item, isLastItem, onPress}: any) => {
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  const isUnread = !item?.isRead;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.card, isLastItem && styles.cardLast]}>
      <View
        style={[
          styles.sideBar,
          {backgroundColor: isUnread ? colors.Primary : colors.Grey_2},
        ]}
      />
      <View style={styles.cardBody}>
        <Text
          style={[
            styles.txt,
            {color: isUnread ? colors.Heading_Txt : colors.Desc_Txt},
          ]}
          numberOfLines={2}>
          {item?.message}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.dateTxt}>{formatTimeAgo(item?.createdAt)}</Text>
          {isUnread && <View style={styles.unreadDot} />}
        </View>
      </View>
    </TouchableOpacity>
  );
};

/** -------------- Wrapper puts Provider around this screen -------------- */
const NotificationScreen = (props: ScreenProps) => {
  return <NotificationInner {...props} />;
};
export default NotificationScreen;

/** ---------------- Inner screen (safe to use useWebSocket) ---------------- */

const NotificationInner = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const type = props?.route?.params?.type as AuthContext;

  const initialNotifications = props?.route?.params?.initialNotifications ?? [];
  // console.log('initial notification', initialNotifications);

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const [stableNotifications, setStableNotifications] =
    useState(initialNotifications);
  const pendingSyncRef = useRef(false); // true during ANY reconnect-driven resync
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialSyncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const hasReceivedFirstOpenRef = useRef(false);

  const {
    notifications,
    markNotificationAsRead,
    markAllAsRead: markAllNotificationsAsRead,
    status,
    reconnect,
  } = useWebSocket(type);
  const [hasInitialized, setHasInitialized] = useState(false);
  const displayNotifications = hasInitialized
    ? stableNotifications
    : initialNotifications;
  useEffect(() => {
    if (status === 'open' && notifications !== undefined) {
      const isTransientEmpty =
        pendingSyncRef.current &&
        notifications.length === 0 &&
        stableNotifications.length > 0;

      const isInitialEmptySettle =
        !hasInitialized &&
        notifications.length === 0 &&
        !hasReceivedFirstOpenRef.current;

      if (isInitialEmptySettle) {
        hasReceivedFirstOpenRef.current = true;
        if (initialSyncTimeoutRef.current)
          clearTimeout(initialSyncTimeoutRef.current);
        initialSyncTimeoutRef.current = setTimeout(() => {
          setStableNotifications(notifications);
          setHasInitialized(true);
        }, 1200);
        return;
      }

      if (!isTransientEmpty) {
        if (initialSyncTimeoutRef.current) {
          clearTimeout(initialSyncTimeoutRef.current);
          initialSyncTimeoutRef.current = null;
        }
        setStableNotifications(notifications);
        setHasInitialized(true);
        setRefreshing(false);
        pendingSyncRef.current = false;
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current);
          refreshTimeoutRef.current = null;
        }
      }
    }
  }, [status, notifications]);
  const unreadCount = useMemo(
    () => displayNotifications.filter((n: any) => !n?.isRead).length,
    [displayNotifications],
  );

  const filteredNotifications = useMemo(
    () =>
      activeTab === 'unread'
        ? displayNotifications.filter((n: any) => !n?.isRead)
        : displayNotifications,
    [displayNotifications, activeTab],
  );
  const onNotiClick = (item: any) => {
    markNotificationAsRead(item?.id);
    console.log('onNotiClick', item);

    if (item?.walkinQuery) {
    } else if (item?.citizenRequest) {
      props?.navigation?.navigate(Routes.FOIA.ReqDetailScreen, {
        data: {id: item.citizenRequest},
      });
    } else if (item?.parkingFormId) {
      props?.navigation?.navigate(Routes.ParkingPermit.ReqDetail, {
        formId: item?.parkingForm,
      });
    } else if (item?.invoiceNumber) {
      props?.navigation?.navigate(Routes.PoliceDuty.InvoiceDetailScreen, {
        item: {invoiceNumber: item?.invoiceNumber},
      });
    } else if (item?.RIPRequestId) {
      props?.navigation?.navigate(Routes.RIP.ReqDetail, {
        item: {requestId: item?.RIPRequestId},
      });
    } else if (item?.flagRaisingRequestId) {
      props?.navigation?.navigate(Routes.FlagRaising.ReqDetailScreen, {
        requestId: item?.flagRaisingRequestId,
      });
    } else if (item?.cdrRequest) {
      props?.navigation?.navigate(Routes.CDR.ReqDetailScreen, {
        item: {id: item.cdrRequest},
      });
    } else if (item?.damJobId) {
      props?.navigation?.navigate(Routes.DAM.jobDetail, {
        item: {id: item?.damJobId},
      });
    } else if (item.damTaskId) {
      props?.navigation?.navigate(Routes.DAM.TaskDetailScreen, {
        item: {id: item?.damTaskId},
      });
    } else if (item?.cartRentalRequestId) {
      props?.navigation?.navigate(Routes.CartRental.DetailScreen, {
        item: {id: item?.cartRentalRequestId},
      });
    } else if (
      item?.helpDeskTicketId ||
      item?.helpDeskChangeId ||
      item?.helpDeskProblemId
    ) {
      const helpDeskTarget = item?.helpDeskChangeId
        ? {
            id: String(item.helpDeskChangeId),
            type: 'change',
            actionKey: 'myChanges',
          }
        : item?.helpDeskProblemId
        ? {
            id: String(item.helpDeskProblemId),
            type: 'problem',
            actionKey: 'myProblems',
          }
        : {
            id: String(item.helpDeskTicketId),
            type: 'ticket',
            actionKey: 'myTickets',
          };

      props?.navigation?.navigate(
        Routes.HelpDesk.TicketDetailScreen,
        helpDeskTarget,
      );
    }
    if (item?.leaveRequest) {
      props?.navigation?.navigate(Routes.TimeKeeping.HoursScreen);
    }
  };

  const beginSync = () => {
    pendingSyncRef.current = true;
    if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    refreshTimeoutRef.current = setTimeout(() => {
      pendingSyncRef.current = false;
      setStableNotifications(notifications ?? []);
      setHasInitialized(true);
      setRefreshing(false);
    }, 5000);
  };

  const onRefresh = () => {
    setRefreshing(true);
    beginSync();
    reconnect();
  };

  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
      if (initialSyncTimeoutRef.current)
        clearTimeout(initialSyncTimeoutRef.current);
    };
  }, []);
  const markAllAsRead = async () => {
    const previousNotifications = stableNotifications;

    setStableNotifications((prev: any[]) =>
      prev.map(n => ({...n, isRead: true})),
    );

    try {
      apiHandler({
        endpoint: ENDPOINTS.markAllNotificationRead,
        method: 'PATCH',
        queryParams: {},
        authContext: type,
        onComplete: (resp: any) => {
          if (resp?.status) {
            markAllNotificationsAsRead();
            DeviceEventEmitter.emit('NOTIFICATIONS_MARKED_READ', {type});
            beginSync();
            reconnect();
          } else {
            setStableNotifications(previousNotifications);
          }
        },
      });
    } catch (e) {
      console.warn('markAllAsRead failed:', e);
      setStableNotifications(previousNotifications);
    }
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
        text="Notifications"
      />

      <View style={styles.tabRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setActiveTab('all')}
          style={[styles.tabBtn, activeTab === 'all' && styles.tabBtnActive]}>
          <Text
            style={[styles.tabTxt, activeTab === 'all' && styles.tabTxtActive]}>
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setActiveTab('unread')}
          style={[
            styles.tabBtn,
            activeTab === 'unread' && styles.tabBtnActive,
          ]}>
          <Text
            style={[
              styles.tabTxt,
              activeTab === 'unread' && styles.tabTxtActive,
            ]}>
            Unread
          </Text>
          {unreadCount > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeTxt}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead} activeOpacity={0.7}>
            <Text style={styles.markAllTxt}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={{flex: 1, paddingHorizontal: normalized(20)}}>
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item, index) =>
            item?.id?.toString() ?? index.toString()
          }
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.Primary}
              colors={[colors.Primary]}
            />
          }
          renderItem={({item, index}) => (
            <Comp
              item={item}
              isLastItem={index === filteredNotifications.length - 1}
              onPress={() => {
                onNotiClick(item);
              }}
            />
          )}
          contentContainerStyle={{
            paddingVertical: normalized(10),
          }}
          ListEmptyComponent={() => {
            if (!hasInitialized) {
              return (
                <View style={styles.emptyCont}>
                  <ActivityIndicator size="large" color={colors.Primary} />
                </View>
              );
            }

            if (!refreshing) {
              return (
                <View style={styles.emptyCont}>
                  <EmptyComp
                    type={Empty_Screen_Type.Notification}
                    subText="No Notifications Found"
                  />
                </View>
              );
            }

            return null;
          }}
        />
      </View>
    </View>
  );
};
/** ---------------- Styles ---------------- */
const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.ScreenBackground,
    },

    tabRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: normalized(20),
      paddingVertical: normalized(12),
      backgroundColor: colors.ScreenBackground,
    },
    tabBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: normalized(14),
      paddingVertical: normalized(6),
      borderRadius: normalized(20),
      marginRight: normalized(10),
    },
    tabBtnActive: {
      backgroundColor: colors.Primary,
    },
    tabTxt: {
      fontSize: normalized(14),
      fontFamily: AppFonts.UbuntuMedium,
      color: colors.Desc_Txt,
    },
    tabTxtActive: {
      color: colors.White,
    },
    tabBadge: {
      marginLeft: normalized(6),
      minWidth: normalized(18),
      height: normalized(18),
      borderRadius: normalized(9),
      backgroundColor: colors.White,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: normalized(4),
    },
    tabBadgeTxt: {
      fontSize: normalized(11),
      fontFamily: AppFonts.UbuntuMedium,
      color: colors.Primary,
    },
    markAllTxt: {
      fontSize: normalized(13),
      fontFamily: AppFonts.UbuntuMedium,
      color: colors.Primary,
      marginLeft: 'auto',
    },

    card: {
      flexDirection: 'row',
      backgroundColor: colors.background,
      borderRadius: normalized(12),
      marginBottom: normalized(12),
      overflow: 'hidden',
      borderWidth: normalized(1),
      borderColor: colors.Grey_2,
    },
    cardLast: {
      marginBottom: 0,
    },
    sideBar: {
      width: normalized(4),
    },
    cardBody: {
      flex: 1,
      paddingVertical: normalized(12),
      paddingHorizontal: normalized(14),
    },
    txt: {
      fontSize: normalized(15),
      lineHeight: normalized(21),
      fontFamily: AppFonts.UbuntuRegular,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginTop: normalized(6),
    },
    dateTxt: {
      fontSize: normalized(12),
      fontFamily: AppFonts.UbuntuRegular,
      color: colors.Desc_Txt,
    },
    unreadDot: {
      width: normalized(7),
      height: normalized(7),
      borderRadius: normalized(3.5),
      backgroundColor: colors.Primary,
      marginLeft: normalized(6),
    },

    emptyCont: {
      minHeight: ScreenSize.height / 1.5,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
