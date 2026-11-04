import React, {useMemo} from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  FlatList,
  Linking,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {
  AppFonts,
  normalized,
  ScreenProps,
  ScreenSize,
  STAFF_MODULES_LIST,
} from '../../Utils/AppConstants';
import VectorWave from '../Svg/VectorWave';
import ModuleComp from '../Components/ModuleComp';
import Logo from '../Svg/Logo';
import LoginBottomWave from '../Svg/LoginBottomWave';
import {Routes} from '../../Utils/Routes';
import CityLogo from '../Svg/CityLogo';

const StaffHomeScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector?.themeColors;
  const isOnline = selector?.isNetConnected;
  console.log('is Online?? : ', isOnline);

  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  const onClick = async (item: any) => {
    if (item?.isExternal === true && item?.externalSiteLink) {
      const canOpen = await Linking.canOpenURL(item.externalSiteLink);

      if (canOpen) {
        await Linking.openURL(item.externalSiteLink);
      }

      return;
    }
    if (item?.code == 'STK1') {
      if (selector?.TimeKeepingUserData?.id)
        props?.navigation?.navigate(item?.route);
      else
        props?.navigation?.navigate(Routes.Auth.TimeKeepingLoginScreen, {
          nav: item?.route,
        });
    } else if (item?.code == 'SSI1') {
      if (selector?.SIRUserData?.id) {
        if (isOnline) {
          props?.navigation?.navigate(item?.route);
        } else {
          props?.navigation?.navigate(Routes.SIR.NewReqScreen, {
            nav: item?.route,
          });
        }
      } else {
        props?.navigation?.navigate(
          isOnline ? Routes.Auth.SIRLoginScreen : Routes.SIR.NewReqScreen,
          {nav: item?.route},
        );
      }
    } else if (item?.code == 'SCD1') {
      if (selector?.CDRUserData?.id) {
        if (isOnline) {
          props?.navigation?.navigate(item?.route);
        } else {
          props?.navigation?.navigate(Routes.CDR.NewReqScreen, {
            nav: item?.route,
          });
        }
      } else {
        props?.navigation?.navigate(
          isOnline ? Routes.Auth.CDRLoginScreen : Routes.CDR.NewReqScreen,
          {nav: item?.route},
        );
      }
    } else if (item?.code == 'SHD1') {
      if (selector?.helpDeskUserData?.id) {
        props?.navigation?.navigate(item?.route, {authContext: 'HELPDESK'});
      } else {
        props?.navigation?.navigate(Routes.Auth.HelpDeskLoginScreen, {
          nav: item?.route,
        });
      }
    } else {
      props?.navigation?.navigate(item?.route);
    }
  };

  return (
    <View style={[styles.container, {paddingBottom: insects.bottom}]}>
      <StatusBar
        barStyle={selector?.isDarkTheme ? 'light-content' : 'dark-content'}
      />

      <View
        style={styles.topWave}
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants">
        <VectorWave
          primary={colors.Primary}
          secondary={colors.Secondary}
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
      </View>

      <View
        style={styles.bottomWave}
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants">
        <LoginBottomWave
          primary={colors.Primary}
          secondary={colors.Secondary}
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
      </View>

      {/* <View style={{height: normalized(70)}} /> */}

      <FlatList
        data={[1, 2]}
        contentContainerStyle={{marginTop: normalized(70)}}
        showsVerticalScrollIndicator={false}
        renderItem={({index}) => {
          return (
            <>
              {index == 0 ? (
                <View style={{alignItems: 'center'}}>
                  {/* <Logo
                    width={60}
                    height={60}
                    accessible={false}
                    accessibilityElementsHidden
                    importantForAccessibility="no-hide-descendants"
                    primary={colors.Primary}
                    secondary={colors.Secondary}
                  /> */}
                  <CityLogo size={70} showCityName />

                  <View style={{height: normalized(13)}} />

                  <Text
                    style={[styles.Heading, {fontFamily: AppFonts.InterBold}]}
                    accessibilityRole="header"
                    allowFontScaling>
                    Staff Services
                  </Text>
                  <View style={{height: normalized(9)}} />
                  <Text style={styles.Desc_Txt_N1} allowFontScaling>
                    Submit reports, manage timekeeping, and access
                    staff-specific tools and portals.
                  </Text>
                </View>
              ) : (
                <>
                  <View style={{width: '100%', flex: 1}}>
                    <FlatList
                      data={selector?.staffModuleList}
                      keyExtractor={(_, i) => `module-${i}`}
                      showsVerticalScrollIndicator={false}
                      numColumns={2}
                      columnWrapperStyle={{
                        gap: normalized(12),
                        marginTop: normalized(12),
                      }}
                      renderItem={({item}) => (
                        <View style={{flex: 1}}>
                          <ModuleComp
                            item={item}
                            onPress={() => onClick(item)}
                          />
                        </View>
                      )}
                      ListFooterComponent={() => (
                        <View style={{height: normalized(100)}} />
                      )}
                    />
                  </View>
                </>
              )}
            </>
          );
        }}
      />
    </View>
  );
};

export default StaffHomeScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
      paddingHorizontal: normalized(20),
      alignItems: 'center',
    },
    topWave: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: ScreenSize.width,
      alignItems: 'flex-start',
      zIndex: 0,
    },
    bottomWave: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      zIndex: 0,
    },
    Main_Heading: {
      fontSize: normalized(28),
      color: 'white',
      fontFamily: AppFonts.InterExtraBold,
    },
    Heading: {
      fontSize: normalized(20),
      color: 'white',
      textAlign: 'center',
    },
    Desc_Txt_N1: {
      fontSize: normalized(14),
      color: 'rgba(255,255,255,0.85)',
      textAlign: 'center',
      marginTop: normalized(10),
    },
  });
