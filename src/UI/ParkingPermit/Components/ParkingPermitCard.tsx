import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {memo, useMemo} from 'react';
import {AppFonts, normalized} from '../../../Utils/AppConstants';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../../Redux/AppStore';
import {AppStyles} from '../../../Utils/AppStyles';
import {lightenHexColor} from '../../../Utils/Helper';
import TicketIcon from '../../Svg/TicketIcon';
import {
  Cart_Rental_Card_Type,
  Help_Desk_Card_Type,
  Parking_Permit_Card_Type,
} from '../../../Utils/AppStrings';

import ListVector from '../../Svg/ListSVG';
import SiteVector from '../../Svg/SiteVector';
import PermitVector from '../../Svg/PermitVector';
import SessionVector from '../../Svg/SessionVector';
import ContractSVG from '../../Svg/ContractSVG';

type ParkingPermitCardProps = {
  type: string;
  onPress: () => void;
};

const getCardMeta = (type: string) => {
  switch (type) {
    case Parking_Permit_Card_Type.ParkingSites:
      return {
        title: 'Parking Sites',
        description: 'Browse and find available parking sites nearby.',
        icon: 'sites' as const,
      };
    case Parking_Permit_Card_Type.ParkingPermits:
      return {
        title: 'Parking Permits',
        description: 'Apply for and manage your parking permits online.',
        icon: 'permits' as const,
      };
    case Parking_Permit_Card_Type.ParkingSession:
      return {
        title: 'Parking Session',
        description: 'Start, track, and manage your active parking sessions.',
        icon: 'sessions' as const,
      };
    case Parking_Permit_Card_Type.ParkingAssosiation:
      return {
        title: 'Parking Company',
        description: 'Manage your parking association contracts.',
        icon: 'associations' as const,
      };

    default:
      return {
        title: 'Parking Sites',
        description: 'View  parking sites.',
        icon: 'sites' as const,
      };
  }
};

const ParkingPermitCard = ({type, onPress}: ParkingPermitCardProps) => {
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const cardMeta = useMemo(() => getCardMeta(type), [type]);
  const cardIcon = useMemo(() => {
    switch (cardMeta.icon) {
      case 'sites':
        return <SiteVector primary={colors.Primary} />;
      case 'permits':
        return <PermitVector primary={colors.Primary} />;
      case 'sessions':
        return <SessionVector primary={colors.Primary} />;
      case 'associations':
        return <ContractSVG primary={colors.Primary} size={30} />;

      default:
        return <SiteVector primary={colors.Primary} />;
    }
  }, [cardMeta.icon, colors.Primary]);

  return (
    <View style={styles.cont}>
      <View style={styles.iconCont}>{cardIcon}</View>
      <Text style={styles.CardheadingTxt}>{cardMeta.title}</Text>
      <Text style={styles.CarddescTxt}>{cardMeta.description}</Text>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={styles.btnCont}>
        <Text style={styles.detailsBtnTxt}>View {cardMeta.title}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default memo(ParkingPermitCard);

const makeStyles = (colors: any) =>
  StyleSheet.create({
    cont: {
      flex: 1,
      borderRadius: normalized(12),
      padding: normalized(15),
      borderWidth: 1,
      borderColor: colors.BorderColor,
      marginTop: normalized(12),
    },
    iconCont: {
      width: normalized(55),
      height: normalized(55),
      borderRadius: normalized(8),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: lightenHexColor(colors.Primary, 0.6),
      marginBottom: normalized(14),
    },
    itemCont: {
      padding: normalized(8),
      borderWidth: 1,
      borderColor: colors.BorderColor,
    },
    space12: {
      height: normalized(12),
    },
    itemKey: {
      fontSize: normalized(13),
      color: colors.Desc_Txt,
      fontFamily: AppFonts.UbuntuMedium,
    },

    itemValue: {
      fontSize: normalized(13),
      color: colors.Primary,
      fontFamily: AppFonts.UbuntuBold,
    },
    btnCont: {
      borderWidth: 1,
      borderRadius: normalized(12),
      borderColor: colors.BorderColor,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: normalized(12),
      backgroundColor: colors.ScreenBackground,
      paddingVertical: normalized(10),
    },
    detailsBtnTxt: {
      color: colors.Heading_Txt,
      fontSize: normalized(13),
      fontFamily: AppFonts.UbuntuBold,
    },
  });
