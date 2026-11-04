import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useMemo} from 'react';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {AppColors, AppFonts, normalized} from '../../Utils/AppConstants';
import BackArrowIcon from '../Svg/BackArrowIcon';
import SideFilterIcon from '../Svg/SideFilterIcon';
import LinearGradient from 'react-native-linear-gradient';
import OfflineIcon from '../Svg/OfflineIcon';
import SimpleButton from './SimpleButton';
import SettingsVector from '../Svg/SettingsVetor';

const CustomHeader = (props: any) => {
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

  return (
    <View
      style={[
        styles.container,
        {
          flexDirection: props?.isRight ? 'row-reverse' : 'row',
          backgroundColor: colors.ScreenBackground,
        },
      ]}>
      {props?.onBackPress ? (
        <TouchableOpacity activeOpacity={1} onPress={props?.onBackPress}>
          <View
            style={props?.isRight ? {transform: [{scaleX: -1}]} : undefined}>
            <BackArrowIcon primary={colors.Desc_Txt} />
          </View>
        </TouchableOpacity>
      ) : (
        <View />
      )}

      <View style={styles.titleContainer}>
        <Text
          style={[styles.txt, {textAlign: props?.isRight ? 'right' : 'left'}]}>
          {props?.text}
        </Text>
        {props?.desc ? (
          <Text
            numberOfLines={1}
            style={[
              styles.Desc_Txt_N1,
              {
                textAlign: props?.isRight ? 'right' : 'left',
              },
            ]}>
            {props?.desc}
          </Text>
        ) : null}
      </View>

      {props?.RightIcon ? (
        <TouchableOpacity activeOpacity={0.7} onPress={props?.onRightIconPress}>
          {props.RightIcon}
        </TouchableOpacity>
      ) : (
        <View />
      )}
      {props?.onSidePanel ? (
        <LinearGradient
          colors={[colors.Primary, colors.Secondary]}
          style={styles.sidePanelCont}>
          <TouchableOpacity activeOpacity={1} onPress={props?.onSidePanel}>
            <SideFilterIcon />
          </TouchableOpacity>
        </LinearGradient>
      ) : null}
      {props?.SettingPress ? (
        <LinearGradient
          colors={[colors.Primary, colors.Secondary]}
          style={styles.sidePanelCont}>
          <TouchableOpacity activeOpacity={1} onPress={props?.SettingPress}>
            <SettingsVector color={colors.White} />
          </TouchableOpacity>
        </LinearGradient>
      ) : null}

      {props?.onOfflinePress ? (
        <LinearGradient
          colors={[colors.Primary, colors.Secondary]}
          style={styles.sidePanelCont}>
          <TouchableOpacity activeOpacity={1} onPress={props?.onOfflinePress}>
            <OfflineIcon />
          </TouchableOpacity>
        </LinearGradient>
      ) : null}
    </View>
  );
};

export default CustomHeader;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      width: '100%',
      height: normalized(52),
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: normalized(10),
      flexDirection: 'row',
      paddingHorizontal: normalized(20),
      borderWidth: 1,
      borderTopColor: 'transparent',
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderBottomColor: colors.BorderColor,
    },
    titleContainer: {flex: 1, justifyContent: 'center'},
    txt: {
      fontFamily: AppFonts.UbuntuSemiBold,
      fontSize: normalized(20),
      color: colors.Heading_Txt,
      // flex: 1,
    },
    sidePanelCont: {
      width: normalized(36),
      height: normalized(36),
      borderRadius: normalized(10000),
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
