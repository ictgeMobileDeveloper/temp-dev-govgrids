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
  VENDER_MODULES_LIST,
} from '../../Utils/AppConstants';
import VectorWave from '../Svg/VectorWave';
import ModuleComp from '../Components/ModuleComp';
import Logo from '../Svg/Logo';
import LoginBottomWave from '../Svg/LoginBottomWave';
import {Routes} from '../../Utils/Routes';
import CityLogo from '../Svg/CityLogo';

const VenderHomeScreen = (props: ScreenProps) => {
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
    if (item?.code == 'SDAM1') {
      if (selector?.damUserData?.isDAMVendor) {
        props?.navigation?.navigate(Routes.DAM.HomeScreen);
      } else
        props?.navigation?.navigate(Routes.DAM.LoginScreen, {isDAMLogin: true});
    } else if (item?.code == 'PIB1') {
      if (selector?.damUserData?.isBillingVendor) {
        props?.navigation?.navigate(Routes.Billing.HomeScreen);
      } else props?.navigation?.navigate(Routes.DAM.LoginScreen);
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
                    Vendor Services
                  </Text>
                  <View style={{height: normalized(9)}} />
                  <Text style={styles.Desc_Txt_N1} allowFontScaling>
                    Access vendor portals including integrated billing accounts
                    and digital asset management.
                  </Text>
                </View>
              ) : (
                <>
                  <View style={{width: '100%', flex: 1}}>
                    <FlatList
                      data={selector?.venderModuleList}
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
                            lastOddItem={
                              VENDER_MODULES_LIST?.length % 2 !== 0 &&
                              VENDER_MODULES_LIST?.length === index + 1
                            }
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

export default VenderHomeScreen;

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
