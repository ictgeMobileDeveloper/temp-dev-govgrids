import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useMemo} from 'react';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {
  normalized,
  RESIDENT_MODULES_LIST,
  STAFF_MODULES_LIST,
  VENDER_MODULES_LIST,
} from '../../Utils/AppConstants';
import TopRightArrowIcon from '../Svg/TopRightArrowIcon';

type StaffItem = {
  title: string;
  description: string;
  route?: string;
  code: string;
  vector?: React.ComponentType<{primary: string; secondary: string}>;
  onPress?: () => void;
};

const ModuleComp = (props: any) => {
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const item = props?.item;
  const Vector =
    item?.vector ||
    RESIDENT_MODULES_LIST.find(module => module.code === item?.code)?.vector ||
    STAFF_MODULES_LIST.find(module => module.code === item?.code)?.vector ||
    VENDER_MODULES_LIST.find(module => module.code === item?.code)?.vector;

  return (
    <TouchableOpacity
      style={styles.mainCont}
      activeOpacity={1}
      onPress={() => props?.onPress()}>
      <View
        style={{
          flexDirection: props?.lastOddItem ? 'row-reverse' : 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {Vector ? (
          <Vector color={colors.Primary} primary={colors.Primary} />
        ) : null}
        <View style={styles.contentCont}>
          <Text style={[styles.Heading2, {textAlign: 'center'}]}>
            {item.title}
          </Text>
          <Text style={[styles.Desc_Txt_N1, {textAlign: 'center'}]}>
            {item.description}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(ModuleComp);

const makeStyles = (colors: any) =>
  StyleSheet.create({
    mainCont: {
      flex: 1,
      overflow: 'hidden',
      borderWidth: 1,
      borderRadius: normalized(12),
      borderColor: colors.BorderColor,
      backgroundColor: colors.Background,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: normalized(5),
      paddingVertical: normalized(15),
      // backgroundColor: 'rgba(255,255,255,0.1)',
    },
    leftArrowCont: {
      position: 'absolute',
      top: normalized(15),
      left: normalized(10),
    },
    rightVectorCont: {
      // alignItems: 'flex-end',
    },
    contentCont: {
      // flex: 1,
      // justifyContent: 'flex-end',
      margin: normalized(10),
      alignItems: 'center',
      justifyContent: 'center',
      gap: normalized(6),
    },
  });
