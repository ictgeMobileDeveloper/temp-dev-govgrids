import {StyleSheet, Text, View} from 'react-native';
import React, {useMemo} from 'react';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {normalized} from '../../Utils/AppConstants';
import CustomButton from './CustomButton';
import LeftCorner from '../Svg/LeftCorner';
import RightCorner from '../Svg/RightCorner';
import ForwardArrowIcon from '../Svg/ForwardArrowIcon';

const MainCard = (props: any) => {
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  return (
    <View style={styles.mainContainer}>
      <View style={props?.leftCorner ? styles.leftCorner : styles.rightCorner}>
        {props?.leftCorner ? (
          <LeftCorner
            primary={colors.Primary}
            secondary={colors.Secondary}
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />
        ) : (
          <RightCorner
            primary={colors.Primary}
            secondary={colors.Secondary}
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />
        )}
      </View>
      {props?.CardIcon && (
        <View style={styles.iconCont}>
          <props.CardIcon primary={colors.Primary} />
        </View>
      )}
      <View style={{height: normalized(15)}} />
      <Text style={styles.Heading1}>{props?.heading}</Text>
      <View style={{height: normalized(5)}} />
      <Text style={styles.Desc_Txt_Main_Card}>{props?.desc}</Text>

      <CustomButton
        text={`Explore ${props?.heading}`}
        RightIcon={ForwardArrowIcon}
        onPress={() => props?.onPressBtn()}
        loading={false}
      />
    </View>
  );
};

export default MainCard;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    mainContainer: {
      width: '100%',
      padding: normalized(12),
      borderWidth: 1,
      borderRadius: normalized(12),
      borderColor: colors.BorderColor,
      backgroundColor: colors.Background,
      overflow: 'hidden',
    },
    leftCorner: {
      top: 0,
      left: 0,
      position: 'absolute',
    },
    rightCorner: {
      top: 0,
      right: 0,
      position: 'absolute',
    },
    iconCont: {
      alignSelf: 'center',
      // marginTop: normalized(5),
    },
  });
