import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {memo, useMemo} from 'react';
import {AppFonts, normalized} from '../../../Utils/AppConstants';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../../Redux/AppStore';
import {AppStyles} from '../../../Utils/AppStyles';
import {lightenHexColor} from '../../../Utils/Helper';
import TicketIcon from '../../Svg/TicketIcon';
import {Help_Desk_Card_Type} from '../../../Utils/AppStrings';
import KnowledgeIcon from '../../Svg/KnowledgeIcon';
import ApprovalIcon from '../../Svg/ApprovalIcon';
import ServiceIcon from '../../Svg/ServiceIcon';
import Problems from '../../Svg/Problems';

type HelpDeskCardProps = {
  type: string;
  secondValue?: any;
  firstValue?: any;
  thirdValue?: any;
  onPress: () => void;
  onFirstPress?: () => void;
  onSecondPress?: () => void;
  onThirdPress?: () => void;
  onForthPress?: () => void;
};

const getCardMeta = (type: string) => {
  switch (type) {
    case Help_Desk_Card_Type.My_Tickets:
      return {
        title: 'Tickets',
        description:
          'Manage, track, and resolve service requests and incidents across departments.',
        firstKey: 'My Tickets',
        secondKey: 'Watched Tickets',
        thirdKey: 'My Pending Approval',
        // forthKey: 'My Open Tasks',
        icon: 'ticket' as const,
      };
    case Help_Desk_Card_Type.Changes:
      return {
        title: 'Changes',
        description:
          'Review and approve pending requests assigned to you quickly and efficiently.',
        firstKey: 'Watched Changes',
        secondKey: 'My Pending Approval',
        // thirdKey: 'My Open Tasks',
        icon: 'change' as const,
      };
    case Help_Desk_Card_Type.Problems:
      return {
        title: 'Problems',
        description:
          'Review and approve pending requests assigned to you quickly and efficiently.',
        firstKey: 'Watched Problems',
        secondKey: 'My Pending Approvals',
        // thirdKey: 'My Open Tasks',
        icon: 'problem' as const,
      };
    case Help_Desk_Card_Type.Service_Catalog:
      return {
        title: 'Service Catalog',
        description:
          'Browse available services and submit new requests across departments.',
        firstKey: 'Service Catalog',
        icon: 'service' as const,
      };
    default:
      return {
        title: 'Knowledge Base',
        description:
          'Find articles, guides, and FAQs to resolve issues without raising a ticket.',
        firstKey: 'Articles',
        // secondKey: 'Saved Articles',
        icon: 'knowledge' as const,
      };
  }
};

const HelpDeskCard = ({
  type,
  firstValue,
  secondValue,
  thirdValue,
  onPress,
  onFirstPress,
  onSecondPress,
  onThirdPress,
}: HelpDeskCardProps) => {
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
      case 'ticket':
        return <TicketIcon primary={colors.Primary} />;
      case 'change':
        return <ApprovalIcon primary={colors.Primary} />;
      case 'problem':
        return <Problems stroke={'2'} primary={colors.Primary} />;
      case 'service':
        return <ServiceIcon primary={colors.Primary} />;
      default:
        return <KnowledgeIcon primary={colors.Primary} />;
    }
  }, [cardMeta.icon, colors.Primary]);

  return (
    <View style={styles.cont}>
      <View style={styles.iconCont}>{cardIcon}</View>
      <Text style={styles.headingTxt}>{cardMeta.title}</Text>
      <Text style={styles.descTxt}>{cardMeta.description}</Text>

      {cardMeta.firstKey && (
        <TouchableOpacity activeOpacity={0.8} onPress={onFirstPress}>
          <View style={[styles.rowCont, styles.itemCont]}>
            <Text style={styles.itemKey}>{cardMeta.firstKey}</Text>
            <Text style={styles.itemValue}>{firstValue}</Text>
          </View>
        </TouchableOpacity>
      )}

      {cardMeta.secondKey && <View style={styles.space12} />}
      {cardMeta.secondKey && (
        <TouchableOpacity activeOpacity={0.8} onPress={onSecondPress}>
          <View style={[styles.rowCont, styles.itemCont]}>
            <Text style={styles.itemKey}>{cardMeta.secondKey}</Text>
            <Text style={[styles.itemValue, {color: colors.Heading_Txt}]}>
              {secondValue}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {cardMeta.thirdKey && <View style={styles.space12} />}
      {cardMeta.thirdKey && (
        <TouchableOpacity activeOpacity={0.8} onPress={onThirdPress}>
          <View style={[styles.rowCont, styles.itemCont]}>
            <Text style={styles.itemKey}>{cardMeta.thirdKey}</Text>
            <Text style={[styles.itemValue, {color: colors.Heading_Txt}]}>
              {thirdValue}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* {cardMeta.forthKey && <View style={styles.space12} />}
      {cardMeta.forthKey && (
        <TouchableOpacity activeOpacity={0.8} onPress={onThirdPress}>
          <View style={[styles.rowCont, styles.itemCont]}>
            <Text style={styles.itemKey}>{cardMeta.forthKey}</Text>
            <Text style={[styles.itemValue, {color: colors.Heading_Txt}]}>
              {forthK}
            </Text>
          </View>
        </TouchableOpacity>
      )} */}

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={styles.btnCont}>
        <Text style={styles.detailsBtnTxt}>View {cardMeta.title}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default memo(HelpDeskCard);

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

    headingTxt: {
      fontSize: normalized(22),
      color: colors.Heading_Txt,
      fontFamily: AppFonts.UbuntuBold,
    },
    descTxt: {
      fontSize: normalized(13),
      color: colors.Desc_Txt,
      fontFamily: AppFonts.UbuntuMedium,
      lineHeight: normalized(18),
      marginVertical: normalized(12),
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
      fontSize: normalized(15),
      fontFamily: AppFonts.UbuntuBold,
    },
  });
