// screens/MainScreen.tsx
import React, {useMemo, useRef, useState, useCallback} from 'react';
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AppColors,
  AppFonts,
  normalized,
  ScreenProps,
} from '../../Utils/AppConstants';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import VectorWave from '../Svg/VectorWave';
import MainCard from '../Components/MainCard';
import ResidentIcon from '../Svg/ResidentIcon';
import StaffIcon from '../Svg/StaffIcon';
import {Routes} from '../../Utils/Routes';
import Logo from '../Svg/Logo';
import LoginBottomWave from '../Svg/LoginBottomWave';
import HelpIcon from '../Svg/HelpIcon';
import {Base_Url, ENDPOINTS} from '../../Network/Urls';
import AppImageViewer from '../Components/AppImageView';
import CityLogo from '../Svg/CityLogo';
import VendorVector from '../Svg/VendorVector';
import {ScrollView} from 'react-native-gesture-handler';
import HeroBanner from '../Components/HeroBanner';

const makeStyles = (colors: any) => ({
  container: {
    flex: 1,
    backgroundColor: colors.Background,
    alignItems: 'center',
  },
  topWave: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  bottomWave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },

  Main_Heading: {
    fontSize: normalized(28),
    color: 'white',
    fontFamily: AppFonts.InterExtraBold,
  },
  Heading: {
    fontSize: normalized(20),
    color: 'white',
    textAlign: 'center' as const,
  },
  Desc_Txt_N1: {
    fontSize: normalized(14),
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center' as const,
    marginTop: normalized(10),
  },
  helpIconCont: {
    width: normalized(50),
    height: normalized(50),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: normalized(100),
    padding: normalized(15),
    backgroundColor: colors.Background,
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
});

type LoginTarget = 'resident' | 'staff' | 'vendor';

const MainScreen = (props: ScreenProps) => {
  const insets = useSafeAreaInsets();
  const selector: any = useSelector(
    (state: AppRootStore) => state.SliceReducer,
  );
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const baseData = selector?.baseData;

  const styles: any = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  const goToNext = (target: LoginTarget) => {
    if (target === 'resident') {
      props.navigation?.navigate(
        selector?.residentUserData
          ? Routes?.Resident.HomeScreen
          : Routes.Auth.Login,
      );
    } else if (target === 'staff') {
      props.navigation?.navigate(Routes.Staff.HomeScreen);
    } else {
      props.navigation?.navigate(Routes?.Vender.HomeScreen);
    }
  };

  return (
    <View
      style={[
        styles.container,
        // {paddingTop: Platform.OS === 'android' ? insets.top : 0},
      ]}>
      <StatusBar barStyle="light-content" />
      <HeroBanner
        primary={colors.Primary}
        secondary={colors.Accent}
        title={baseData?.cityName}
      />

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
      {/* <View style={{height: normalized(30)}} />

      <CityLogo size={70} showCityName />

      <View style={{height: normalized(10)}} /> */}

      {/* <View accessible>
        <Text
          style={[styles.Heading, {fontFamily: AppFonts.InterBold}]}
          accessibilityRole="header"
          allowFontScaling>
          City Services
        </Text>
        <View style={{height: normalized(10)}} />
        <Text style={styles.Desc_Txt_N1} allowFontScaling>
          Easily access online services for residents and staff – from permits
          and requests to reports and city updates.
        </Text>
      </View> */}

      <View
        style={{
          gap: normalized(14),
          marginTop: normalized(30),
          alignSelf: 'stretch',
          paddingHorizontal: normalized(20),
        }}>
        <View>
          <MainCard
            CardIcon={ResidentIcon}
            heading="Resident Services"
            desc="Access essential online services including FOIA requests, property lookups, safety forms, parking permits, and more."
            leftCorner
            onPressBtn={() => goToNext('resident')}
          />
        </View>

        <View>
          <MainCard
            CardIcon={StaffIcon}
            heading="Staff Services"
            desc="Submit reports, manage timekeeping, and access staff-specific tools and portals."
            rightCorner
            onPressBtn={() => goToNext('staff')}
          />
        </View>
        <View>
          <MainCard
            CardIcon={VendorVector}
            heading="Vendor Services"
            desc="Access vendor portals including police duty billing accounts and digital asset management."
            leftCorner
            onPressBtn={() => goToNext('vendor')}
          />
        </View>
      </View>

      {/* <TouchableOpacity
        activeOpacity={1}
        onPress={() => props?.navigation?.navigate(Routes.HelpDeskScreen)}
        style={[styles.helpIconCont, {backgroundColor: colors.Background}]}>
        <HelpIcon size={30} primary={colors.Primary} />
      </TouchableOpacity> */}
      {/* </ScrollView> */}
    </View>
  );
};

export default MainScreen;
