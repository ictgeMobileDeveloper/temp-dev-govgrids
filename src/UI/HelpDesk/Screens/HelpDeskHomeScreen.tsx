import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Animated as RNAnimated,
  Easing,
} from 'react-native';
import {DeviceEventEmitter} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  AppFonts,
  AppHorizontalMargin,
  normalized,
  ScreenProps,
  ScreenSize,
} from '../../../Utils/AppConstants';
import {useIsFocused} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../../Redux/AppStore';
import {AppStyles} from '../../../Utils/AppStyles';
import {
  AppStrings,
  Help_Desk_Card_Type,
  AuthContext,
} from '../../../Utils/AppStrings';
import {
  hasValidAccessToken,
  resolveAccessToken,
} from '../../../Network/Services/ApiHandler';
import {Routes} from '../../../Utils/Routes';
import HelpDeskCard from '../Components/HelpDeskCard';
import ThemeModal from '../../Modal/ThemeModal';
import MainHeader from '../../Components/MainHeader';
import {useWebSocket} from '../../../Network/Services/WebSocketProvider';
import {apiHandler} from '../../../Network/Services/ApiHandler';
import {ENDPOINTS, SOCKET_ENDPOINTS, websocketUrl} from '../../../Network/Urls';
import {setShowToast, setHelpDeskUserData} from '../../../Redux/AppReducers';
import {sessionSocketRegistry} from '../../../Network/Services/SessionSocketRegistry';
import {getErrorMessage, resetToWelcomeAndHome} from '../../../Utils/Helper';
import {
  clearAuthContext,
  subscribeAuthTokenChange,
} from '../../../Network/Services/AuthTokenService';
import {useSessionExpirySocket} from '../../../Network/Services/useSessionExpirySocket';
import {forceLogout} from '../../../Network/Services/ForceLogout';
import CustomDrawer from '../../Components/CustomDrawer';
import {useDrawer} from '../../../Hooks/DrawerAnimation';
import ForwardArrowIcon from '../../Svg/ForwardArrowIcon';
import CustomButton from '../../Components/CustomButton';
import {useFocusRefresh} from '../../../Network/Services/FocusRefresh';

const HelpDeskHomeScreen = (props: ScreenProps) => {
  return <HelpDeskHomeScreenInner {...props} />;
};

const HelpDeskHomeScreenInner = (props: ScreenProps) => {
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
  const dispatch = useDispatch();
  const userData = selector?.helpDeskUserData;
  const {getUnreadCount, notifications, markAllAsRead, reconnect} =
    useWebSocket('HELPDESK');
  const unreadCount = getUnreadCount();
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const isManualRefreshRef = useRef(false);
  const [details, setDetails] = useState<any>(null);
  const {isDrawerOpen, drawerAnim, overlayAnim, openDrawer, closeDrawer} =
    useDrawer();

  const handleForceLogout = () => {
    forceLogout({
      dispatch,
      navigation: props.navigation,
      authContext: 'HELPDESK',
      homeRoute: Routes.Staff.HomeScreen, // optional — omit for direct-to-Main reset
    });
  };

  useSessionExpirySocket({
    authContext: 'HELPDESK',
    endpoint: SOCKET_ENDPOINTS.SIRSession,
    label: 'HelpDesk',
    dependencyKey: selector?.helpDeskUserData?.id,
    enabled: Boolean(selector?.helpDeskUserData?.id),
    onExpired: handleForceLogout,
  });

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(
      'NOTIFICATIONS_MARKED_READ',
      payload => {
        if (payload?.type === 'HELPDESK') {
          markAllAsRead();
        }
      },
    );

    return () => sub.remove();
  }, [markAllAsRead]);

  // useEffect(() => {
  //   if (isFocused) {
  //     reconnect();
  //   }
  // }, [isFocused]);

  // useEffect(() => {
  //   fetchDetails();
  // }, []);

  const onRefresh = () => {
    isManualRefreshRef.current = true;
    setRefreshing(true);
    fetchDetails();
  };
  const fetchDetails = ({silent = false} = {}) => {
    const isManualRefresh = isManualRefreshRef.current;

    if (!isManualRefresh && !silent) {
      setIsLoading(true);
    }

    apiHandler({
      endpoint: ENDPOINTS.helpDeskDashboard,
      method: 'GET',
      authContext: 'HELPDESK',
      onComplete: (resp: any) => {
        isManualRefreshRef.current = false;
        setRefreshing(false);
        if (resp?.status) {
          setIsLoading(false);
          setDetails(resp?.data?.data);
        } else {
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.error,
              message: getErrorMessage(resp),
            }),
          );
          setIsLoading(false);
        }
      },
    });
  };

  useFocusRefresh(fetchDetails, []);

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
      <MainHeader
        onNotiPress={() =>
          props?.navigation?.navigate(Routes.NotificationScreen, {
            type: 'HELPDESK',
            initialNotifications: notifications,
          })
        }
        onProfilePress={() =>
          props?.navigation?.navigate(Routes.SIR.ProfileScreen, {
            isHelpDesk: true,
          })
        }
        name={`${userData?.firstName ?? ''} ${userData?.lastName ?? ''}`.trim()}
        unreadNoti={unreadCount}
        img={userData?.profilePicture ? userData?.profilePicture : null}
      />

      {isLoading ? (
        <View style={styles.loaderCont}>
          <ActivityIndicator color={colors.Primary} size={'large'} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.Primary}
              colors={[colors.Primary]}
            />
          }
          contentContainerStyle={{
            paddingHorizontal: AppHorizontalMargin,
            paddingBottom: normalized(30),
          }}>
          <CustomButton
            text={'Create Ticket'}
            onPress={() => {
              props?.navigation?.navigate(Routes.HelpDesk.ServiceScreen);
            }}
            RightIcon={ForwardArrowIcon}
            loading={false}
          />
          <HelpDeskCard
            type={Help_Desk_Card_Type.My_Tickets}
            firstValue={details?.myTickets}
            secondValue={details?.watchedTickets}
            thirdValue={details?.ticketsWithMyPendingApprovals}
            onFirstPress={() =>
              props?.navigation?.navigate(Routes.HelpDesk.TicketScreen, {
                actionKey: 'myTickets',
              })
            }
            onSecondPress={() =>
              props?.navigation?.navigate(Routes.HelpDesk.TicketScreen, {
                actionKey: 'watchedTickets',
              })
            }
            onThirdPress={() =>
              props?.navigation?.navigate(Routes.HelpDesk.ApprovalScreen, {
                actionKey: 'pendingTicketApprovals',
              })
            }
            onPress={() =>
              props?.navigation?.navigate(Routes.HelpDesk.TicketScreen, {
                actionKey: 'viewTickets',
              })
            }
          />

          <HelpDeskCard
            type={Help_Desk_Card_Type.Changes}
            firstValue={details?.watchedChanges}
            secondValue={details?.changesWithMyPendingApprovals}
            onFirstPress={() =>
              props?.navigation?.navigate(Routes.HelpDesk.TicketScreen, {
                actionKey: 'watchedChanges',
              })
            }
            onSecondPress={() =>
              props?.navigation?.navigate(Routes.HelpDesk.ApprovalScreen, {
                actionKey: 'pendingChangeApprovals',
              })
            }
            onPress={() =>
              props?.navigation?.navigate(Routes.HelpDesk.TicketScreen, {
                actionKey: 'viewChanges',
              })
            }
          />

          <HelpDeskCard
            type={Help_Desk_Card_Type.Problems}
            firstValue={details?.watchedProblems}
            secondValue={details?.problemsWithMyPendingApprovals}
            onFirstPress={() =>
              props?.navigation?.navigate(Routes.HelpDesk.TicketScreen, {
                actionKey: 'watchedProblems',
              })
            }
            onSecondPress={() =>
              props?.navigation?.navigate(Routes.HelpDesk.ApprovalScreen, {
                actionKey: 'pendingProblemApprovals',
              })
            }
            onPress={() =>
              props?.navigation?.navigate(Routes.HelpDesk.TicketScreen, {
                actionKey: 'viewProblems',
              })
            }
          />

          <HelpDeskCard
            type={Help_Desk_Card_Type.Service_Catalog}
            firstValue={details?.totalServiesCatalogs}
            onPress={() =>
              props?.navigation?.navigate(Routes.HelpDesk.ServiceScreen)
            }
          />

          <HelpDeskCard
            type={Help_Desk_Card_Type.Knowledge_Base}
            firstValue={details?.publishedArticles}
            secondValue={0}
            onPress={() =>
              props?.navigation?.navigate(Routes.HelpDesk.KnowledgeScreen)
            }
          />
        </ScrollView>
      )}

      <CustomDrawer
        isVisible={isDrawerOpen}
        drawerAnim={drawerAnim}
        overlayAnim={overlayAnim}
        onClose={closeDrawer}
        topOffset={insects.top + normalized(Platform.OS == 'ios' ? -10 : 0)}
        closeDrawer={closeDrawer}
      />
    </View>
  );
};

export default HelpDeskHomeScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.ScreenBackground,
    },
    loaderCont: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
