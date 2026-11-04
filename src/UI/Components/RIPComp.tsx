import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useMemo} from 'react';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {AppFonts, normalized} from '../../Utils/AppConstants';
import {Base_Url} from '../../Network/Urls';
import moment from 'moment';
import {capitalizeEachWord, getStatusColor} from '../../Utils/Helper';
import LocationPinIcon from '../Svg/LocationIcon';
import MapIcon from '../Svg/MapIcon';
import AppImageViewer from './AppImageView';
import VehiclePlaceholder from '../Svg/CarPlaceholder';
import IssuePortalPlaceholder from '../Svg/IssuePlaceHolder';

const RIPComp = (props: any) => {
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const item = props?.item;
  console.log(item);
  const photoUri = item?.photos?.[0]?.url;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={props?.onView}
      style={styles.card}>
      <AppImageViewer
        source={{uri: photoUri}}
        style={styles.image}
        resizeMode="cover"
        placeholder={
          <IssuePortalPlaceholder
            backgroundColor={colors.Background}
            iconColor={colors.Desc_Txt}
            size={30}
          />
        }
      />

      <View style={styles.content}>
        <View style={styles.rowCont}>
          <View
            style={[
              styles.statusCont,
              {backgroundColor: getStatusColor(item?.status, colors)},
            ]}>
            <Text style={styles.statusTxt}>
              {capitalizeEachWord(item?.status)}
            </Text>
          </View>
          <Text style={styles.dateTxt}>
            {moment(item?.createdAt).format('MMM D, YYYY, h:mm A')}
          </Text>
        </View>

        <Text style={styles.titleTxt} numberOfLines={1}>
          {item?.requestCategory?.title || 'Request'}
        </Text>

        <TouchableOpacity activeOpacity={0.7} style={styles.locationRow}>
          <Text style={styles.reqIdTxt}>{item?.requestId}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={props?.onMapPress}
          style={[styles.rowCont, styles.addressMapRow]}>
          <View style={styles.locationRow}>
            <LocationPinIcon primary={colors.Desc_Txt} width={14} height={14} />
            <Text style={styles.addressTxt} numberOfLines={1}>
              {item?.address}
            </Text>
          </View>
          <View style={styles.mapIconCont}>
            <MapIcon primary={colors.White} width={18} height={18} />
          </View>
        </TouchableOpacity>

        {!!item?.description && (
          <Text style={styles.descTxt} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default RIPComp;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    card: {
      borderRadius: normalized(14),
      backgroundColor: colors.Background,
      borderWidth: 1,
      borderColor: colors.BorderColor,
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: normalized(180),
    },
    content: {
      padding: normalized(14),
      gap: normalized(6),
    },
    rowCont: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    statusCont: {
      paddingHorizontal: normalized(12),
      paddingVertical: normalized(5),
      borderRadius: normalized(20),
      alignSelf: 'flex-start',
    },
    statusTxt: {
      color: colors.White,
      fontSize: normalized(12),
      fontFamily: AppFonts.UbuntuMedium,
    },
    dateTxt: {
      color: colors.Desc_Txt,
      fontSize: normalized(12),
      fontFamily: AppFonts.UbuntuRegular,
    },
    titleTxt: {
      color: colors.Heading_Txt,
      fontSize: normalized(18),
      fontFamily: AppFonts.UbuntuBold,
      marginTop: normalized(4),
    },
    reqIdTxt: {
      color: colors.Desc_Txt,
      fontSize: normalized(13),
      fontFamily: AppFonts.UbuntuRegular,
    },
    locationRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: normalized(6),

      flexShrink: 1,
    },
    addressMapRow: {
      marginTop: normalized(8),
      justifyContent: 'space-between',
      gap: normalized(12),
    },
    mapIconCont: {
      width: normalized(24),
      height: normalized(24),
      borderRadius: normalized(4),
      backgroundColor: colors.Primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addressTxt: {
      flexShrink: 1,
      color: colors.Desc_Txt,
      fontSize: normalized(13),
      fontFamily: AppFonts.UbuntuRegular,
    },
    descTxt: {
      color: colors.Heading_Txt,
      fontSize: normalized(14),
      fontFamily: AppFonts.UbuntuRegular,
      marginTop: normalized(4),
    },
  });
