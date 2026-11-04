import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useMemo } from 'react';
import { AppFonts, normalized } from '../../Utils/AppConstants';
import { useSelector } from 'react-redux';
import { AppRootStore } from '../../Redux/AppStore';
import { AppStyles } from '../../Utils/AppStyles';

const FOIAButton = ({ item, onPress }: any) => {
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({ ...makeStyles(colors), ...AppStyles(colors) }),
    [colors],
  );

  return (
    <TouchableOpacity activeOpacity={1} style={styles.container} onPress={onPress}>
      <item.icon primary={colors.White} />
      <Text style={styles.text}>{item?.text}</Text>
    </TouchableOpacity>
  );
};

export default FOIAButton;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      height: normalized(96),
      //   width: '100%',
      flex: 1,
      backgroundColor: colors.Dark_Blue,
      gap: normalized(10),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: normalized(8),
    },
    text: {
      color: colors.White,
      fontSize: normalized(14),
      fontFamily: AppFonts.InterBold,
      textAlign: 'center',
      lineHeight: normalized(20),
      paddingHorizontal: normalized(20),
    },
  });
