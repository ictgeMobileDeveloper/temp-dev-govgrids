import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useMemo} from 'react';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../../Redux/AppStore';
import {AppStyles} from '../../../Utils/AppStyles';
import {AppColors, AppFonts, normalized} from '../../../Utils/AppConstants';
import LocationPinIcon from '../../Svg/LocationIcon';
import CloseIcon from '../../Svg/CloseIcon';
import AppImageViewer from '../../Components/AppImageView';
import SimpleButton from '../../Components/SimpleButton';
import NavigationIcon from '../../Svg/NavigationIcon';
import {openInMaps, parseCoords} from '../../../Utils/Helper';
import CustomButton from '../../Components/CustomButton';
import VehiclePlaceholder from '../../Svg/CarPlaceholder';

type ParkingSite = {
  id: number | string;
  buildingName?: string;
  buildingAddress?: string;
  buildingAddressCoords?: string;
  siteImageURL?: string;
  zones?: any[];
  [key: string]: any;
};

const ParkingSiteCard = (props: {
  item: ParkingSite;
  chipPress?: (zone: any) => void;
  onApplyPermit?: () => void;
  onClose?: () => void;
  btnTxt: string;
  variant?: 'list' | 'sheet';
}) => {
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const item = props?.item;
  const variant = props?.variant ?? 'list';
  const isSheet = variant === 'sheet';
  const zones = item?.zones || [];

  if (isSheet) {
    return (
      <View
        style={[
          styles.sheetCard,
          zones.length === 0 && {minHeight: normalized(190)},
        ]}>
        <View style={styles.sheetHandle} />

        <TouchableOpacity
          style={styles.sheetCloseBtn}
          activeOpacity={0.7}
          onPress={props?.onClose}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <CloseIcon
            width={20}
            height={20}
            primary={colors.Heading}
            strokeWidth={2}
          />
        </TouchableOpacity>

        <View style={styles.sheetRow}>
          <AppImageViewer
            source={{uri: item.siteImageURL}}
            style={styles.sheetImage}
            placeholder={
              <VehiclePlaceholder
                backgroundColor={colors.Background}
                iconColor={colors.Desc_Txt}
                size={30}
              />
            }
            resizeMode="cover"
          />

          <View style={styles.sheetContent}>
            <Text style={styles.titleTxt} numberOfLines={1}>
              {item?.buildingName}
            </Text>

            <TouchableOpacity
              onPress={() =>
                openInMaps(
                  parseCoords(item?.buildingAddressCoords),
                  item?.buildingName,
                )
              }
              style={[styles.locationRow, {marginTop: normalized(4)}]}>
              <LocationPinIcon
                primary={colors.Desc_Txt}
                width={13}
                height={13}
              />
              <Text style={styles.addressTxt} numberOfLines={2}>
                {item?.buildingAddress}
              </Text>
              <NavigationIcon primary={colors.Primary} size={30} />
            </TouchableOpacity>
          </View>
        </View>

        {zones.length > 0 && (
          <View style={styles.chipsRow}>
            {zones.map(zone => (
              <TouchableOpacity
                key={zone.id}
                onPress={() => props?.chipPress?.(zone)}
                style={styles.chip}
                activeOpacity={0.8}>
                <Text style={styles.chipTxt} numberOfLines={1}>
                  {zone.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <CustomButton onPress={props?.onApplyPermit} text={props?.btnTxt} />
      </View>
    );
  }

  // ---- list variant unchanged below ----
  return (
    <View style={styles.card}>
      <View>
        <AppImageViewer
          source={{uri: item?.siteImageURL}}
          style={styles.image}
          placeholder={
            <VehiclePlaceholder
              backgroundColor={colors.Background}
              iconColor={colors.Desc_Txt}
              size={30}
            />
          }
        />
        <View style={styles.zoneCountBadge}>
          <Text style={styles.zoneCountTxt}>
            {zones.length} {zones.length === 1 ? 'zone' : 'zones'}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.locationRow}>
          <Text style={styles.titleTxt} numberOfLines={1}>
            {item?.buildingName}
          </Text>
        </View>

        <View style={[styles.locationRow, {marginTop: normalized(4)}]}>
          <LocationPinIcon primary={colors.Desc_Txt} width={14} height={14} />
          <Text style={styles.addressTxt} numberOfLines={2}>
            {item?.buildingAddress}
          </Text>
        </View>

        {zones.length > 0 && (
          <View style={styles.chipsRow}>
            {zones.map(zone => (
              <TouchableOpacity
                key={zone.id}
                style={styles.chip}
                onPress={() => props?.chipPress?.(zone)}>
                <Text style={styles.chipTxt} numberOfLines={1}>
                  {zone.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <CustomButton onPress={props?.onApplyPermit} text={props?.btnTxt} />
      </View>
    </View>
  );
};

export default ParkingSiteCard;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    // ---- list variant styles: unchanged, keep everything you already have ----
    card: {
      borderRadius: normalized(14),
      backgroundColor: colors.Background,
      borderWidth: 1,
      borderColor: colors.BorderColor,
      overflow: 'hidden',
      marginBottom: normalized(14),
    },
    image: {width: '100%', height: normalized(150)},
    zoneCountBadge: {
      position: 'absolute',
      right: normalized(10),
      bottom: normalized(10),
      backgroundColor: colors.Heading_Txt,
      paddingHorizontal: normalized(10),
      paddingVertical: normalized(4),
      borderRadius: normalized(20),
    },
    zoneCountTxt: {
      color: colors.Background,
      fontSize: normalized(11),
      fontFamily: AppFonts.UbuntuMedium,
    },
    content: {padding: normalized(14)},
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(6),
    },
    titleTxt: {
      flexShrink: 1,
      color: colors.Heading_Txt,
      fontSize: normalized(16),
      fontFamily: AppFonts.UbuntuBold,
    },
    addressTxt: {
      flexShrink: 1,
      color: colors.Desc_Txt,
      fontSize: normalized(13),
      fontFamily: AppFonts.UbuntuRegular,
    },
    chipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: normalized(8),
      marginTop: normalized(10),
    },
    chip: {
      paddingHorizontal: normalized(10),
      paddingVertical: normalized(5),
      borderRadius: normalized(20),
      backgroundColor: AppColors.Dark_Blue,
    },
    chipTxt: {
      color: colors.White,
      fontSize: normalized(11),
      fontFamily: AppFonts.UbuntuRegular,
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: normalized(12),
    },

    applyBtnTxt: {
      color: colors.Desc_Txt,
      fontSize: normalized(13),
      fontFamily: AppFonts.UbuntuMedium,
    },

    // ---- sheet variant: redesigned ----
    sheetCard: {
      borderTopLeftRadius: normalized(20),
      borderTopRightRadius: normalized(20),
      backgroundColor: colors.Background,
      paddingHorizontal: normalized(18),
      paddingTop: normalized(10),
      minHeight: normalized(240), // ← set whatever height you want
    },
    sheetHandle: {
      alignSelf: 'center',
      width: normalized(36),
      height: normalized(4),
      borderRadius: normalized(3),
      backgroundColor: '#D0D5DD',
    },
    sheetCloseBtn: {
      position: 'absolute',
      top: normalized(12),
      right: normalized(14),
      width: normalized(28),
      height: normalized(28),
      borderRadius: normalized(14),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.InputBackground || '#F2F4F7',
    },
    sheetRow: {flexDirection: 'row', gap: normalized(14)},
    sheetImage: {
      width: normalized(84),
      height: normalized(84),
      borderRadius: normalized(12),
    },
    sheetContent: {
      flex: 1,
      justifyContent: 'center',
      paddingRight: normalized(28),
    },
    sheetApplyBtn: {
      marginTop: normalized(16),
      alignSelf: 'stretch',
      width: '100%',
    },
  });
