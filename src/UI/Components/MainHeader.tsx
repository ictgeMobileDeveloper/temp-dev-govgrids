import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useMemo} from 'react';
import {AppFonts, IS_TABLET_DEVICE, normalized} from '../../Utils/AppConstants';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import DarkThemeIcon from '../Svg/DarkThemeIcon';
import {initials, lightenHexColor, truncateName} from '../../Utils/Helper';
import NotificationIcon from '../Svg/NotificationIcon';
import AppImageViewer from './AppImageView';
import {Base_Url} from '../../Network/Urls';
import LinearGradient from 'react-native-linear-gradient';
import SettingsVector from '../Svg/SettingsVetor';

const MainHeader = (props: any) => {
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector?.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  return (
    <View style={styles.mainCont}>
      <TouchableOpacity
        style={styles.iconCont}
        activeOpacity={1}
        onPress={props?.onProfilePress}>
        {props?.img ? (
          <LinearGradient
            colors={[colors.Primary, colors.Secondary]}
            style={styles.icon}>
            <AppImageViewer
              source={{uri: `${Base_Url}${props?.img}`}}
              style={{
                width: normalized(48),
                height: normalized(48),
                borderRadius: normalized(48),
              }}
              resizeMode={'cover'}
            />
          </LinearGradient>
        ) : (
          <LinearGradient
            colors={[colors.Primary, colors.Secondary]}
            style={styles.icon}>
            <Text style={styles.profileTxt}>{initials(props?.name)}</Text>
          </LinearGradient>
        )}
        <View>
          <Text style={styles.topHeading}>👋🏼 Hello!!!</Text>
          <Text style={styles.profileNameTxt}>
            {IS_TABLET_DEVICE ? props?.name : truncateName(props?.name)}
          </Text>
        </View>
      </TouchableOpacity>
      <View style={styles.iconCont}>
        {!props?.hideNoti && (
          <>
            <LinearGradient
              colors={[colors.Primary, colors.Secondary]}
              style={styles.icon}>
              <TouchableOpacity
                style={styles.icon}
                activeOpacity={0.8}
                onPress={props?.onNotiPress}>
                <NotificationIcon primary={colors.White} />
              </TouchableOpacity>
            </LinearGradient>
            {Number(props?.unreadNoti) > 0 && (
              <View style={styles.numCont}>
                <Text style={styles.numTxt}>{props?.unreadNoti}</Text>
              </View>
            )}
          </>
        )}
        {props?.showSettings && !selector?.residentUserData && (
          <>
            <LinearGradient
              colors={[colors.Primary, colors.Secondary]}
              style={styles.icon}>
              <TouchableOpacity
                style={styles.icon}
                activeOpacity={0.8}
                onPress={props?.onSettingPress}>
                <SettingsVector color={colors.White} />
              </TouchableOpacity>
            </LinearGradient>
          </>
        )}
      </View>
    </View>
  );
};

export default MainHeader;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    mainCont: {
      flexDirection: 'row',
      paddingHorizontal: normalized(20),
      paddingVertical: normalized(8),
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      height: normalized(64),
      borderWidth: 1,
      borderTopColor: 'transparent',
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderBottomColor: colors.BorderColor,
      // backgroundColor: colors.Background,
    },
    iconCont: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(10),
    },
    icon: {
      width: normalized(48),
      height: normalized(48),
      borderRadius: normalized(48),
      alignItems: 'center',
      justifyContent: 'center',
    },
    numCont: {
      width: normalized(20),
      height: normalized(20),
      backgroundColor: colors.White,
      borderWidth: 1,
      borderColor: colors.Primary,
      borderRadius: normalized(20),
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      top: normalized(-3),
      right: normalized(-2),
      overflow: 'hidden',
    },
    numTxt: {
      fontSize: normalized(12),
      fontFamily: AppFonts.UbuntuBold,
      color: colors.Primary,
    },
    profileTxt: {
      color: colors.White,
      fontSize: normalized(16),
      fontFamily: AppFonts.UbuntuBold,
    },
    profileNameTxt: {
      color: colors.Heading_Txt,
      fontSize: normalized(16),
      fontFamily: AppFonts.UbuntuBold,
    },
    topHeading: {
      fontSize: normalized(13),
      fontFamily: AppFonts.UbuntuRegular,
      color: colors.Desc_Txt,
    },
  });
