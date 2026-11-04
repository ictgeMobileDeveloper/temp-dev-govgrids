import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useMemo} from 'react';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {normalized} from '../../Utils/AppConstants';
import TickIcon from '../Svg/TickIcon';

const RadioComp = ({item, onPress, selected}: any) => {
  const colors = useSelector((s: AppRootStore) => s.SliceReducer.themeColors);
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const isSelected = selected?.id == item?.id;
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      style={styles.mainCont}>
      <View
        style={[
          styles.circle,
          {
            width: normalized(20),
            height: normalized(20),
            borderRadius: normalized(18),
            borderColor: isSelected ? colors.Primary : colors.Desc_Txt,
            backgroundColor: isSelected ? colors.Primary : 'transparent',
          },
        ]}>
        {isSelected ? <TickIcon /> : null}
      </View>
      <Text style={styles.valueTxt}>{item?.txt}</Text>
    </TouchableOpacity>
  );
};

export default RadioComp;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    mainCont: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(12),
    },
    circle: {
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
