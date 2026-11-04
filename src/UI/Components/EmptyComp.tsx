import {StyleSheet, Text, View} from 'react-native';
import React, {useMemo} from 'react';
import NotificationEmpty from '../Svg/NotificationEmpty';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {Empty_Screen_Type, EmptyScreenType} from '../../Utils/AppStrings';
import {
  AppColors,
  AppFonts,
  normalized,
  ScreenSize,
} from '../../Utils/AppConstants';
import {AppStyles} from '../../Utils/AppStyles';
import RequestIcon from '../Svg/RequestIcon';
import OfflineIcon from '../Svg/OfflineIcon';
import EmptySearch from '../Svg/EmptySearch';

interface Props {
  type: EmptyScreenType;
  subText: string;
  component?: Boolean;
}

const EmptyComp = ({type, subText, component = false}: Props) => {
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors, component],
  );
  const isOnline = selector?.isNetConnected;

  return (
    <View style={styles.container}>
      <View
        style={{
          // backgroundColor: 'rgba(0,0,0,0.1)',
          // borderWidth: 0.5,
          borderColor: colors.BorderColor,
          width: '80%',
          padding: normalized(10),
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: normalized(12),
          paddingVertical: normalized(40),
        }}>
        {type == Empty_Screen_Type.Offline_Message ? (
          <OfflineIcon size={80} color={colors.Desc_Txt} />
        ) : type == Empty_Screen_Type.Property ? (
          <EmptySearch primary={colors.Primary} width={80} height={80} />
        ) : type == Empty_Screen_Type.List ||
          type == Empty_Screen_Type.Report ? (
          <RequestIcon primary={colors.Primary} width={80} height={80} />
        ) : (
          <NotificationEmpty
            primary={colors.Primary}
            width={100}
            height={100}
          />
        )}
        <Text style={styles.txt}>{subText}</Text>
        {/* {type == Empty_Screen_Type.Offline_Message
            ? 'No Offline Requests Found.'
            : !isOnline
            ? 'You are Offline.'
            : type == Empty_Screen_Type.Property
            ? 'No Properties Found.'
            : type == Empty_Screen_Type.Report
            ? "You don't have any Reports."
            : type == Empty_Screen_Type.List
            ? "You don't have any Requests."
            : "You Dont' have any Notifications."} */}
      </View>
    </View>
  );
};

export default EmptyComp;

const makeStyles = (colors: any, component?: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      height: component ? ScreenSize.height * 0.1 : ScreenSize.height * 0.8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    txt: {
      fontSize: component ? normalized(8) : normalized(18),
      color: colors.Heading_Txt,
      fontFamily: AppFonts.UbuntuMedium,
      marginTop: normalized(15),
      textAlign: 'center',
    },
  });
