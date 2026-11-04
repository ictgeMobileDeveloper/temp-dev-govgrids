import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AppRootStore } from '../../Redux/AppStore';
import { AppStyles } from '../../Utils/AppStyles';
import { AppFonts, normalized } from '../../Utils/AppConstants';
import ForwardArrowIcon from '../Svg/ForwardArrowIcon';

const PrimaryButton = (props: any) => {
  const selector: any = useSelector(
    (state: AppRootStore) => state.SliceReducer,
  );
  const colors = selector?.themeColors;
  const styles = useMemo(
    () => ({ ...makeStyles(colors), ...AppStyles(colors) }),
    [colors],
  );

  return (
    <TouchableOpacity style={styles.cont} onPress={props?.onPress} activeOpacity={1}>
      <View style={styles.textCont}>
        <Text style={styles.firstTxt}>{props?.firstTxt}</Text>
        <Text style={styles.secondTxt}>{props?.secondTxt}</Text>
      </View>
      {props?.isShowLastIcon ? <ForwardArrowIcon color="white" /> : <View />}
    </TouchableOpacity>
  );
};

export default PrimaryButton;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    cont: {
      backgroundColor: colors.Primary,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'space-between',
      height: normalized(80),
      borderRadius: normalized(12),
      flexDirection: 'row',
      padding: normalized(10),
    },
    textCont: {
      justifyContent: 'space-between',
    },
    firstTxt: {
      fontSize: normalized(16),
      fontFamily: AppFonts.UbuntuMedium,
      color: colors.White,
    },
    secondTxt: {
      fontSize: normalized(24),
      fontFamily: AppFonts.UbuntuBold,
      color: colors.White,
    },
  });
