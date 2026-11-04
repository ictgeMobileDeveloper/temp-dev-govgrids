import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {memo, useMemo} from 'react';
import {AppFonts, normalized} from '../../../Utils/AppConstants';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../../Redux/AppStore';
import {AppStyles} from '../../../Utils/AppStyles';
import {lightenHexColor} from '../../../Utils/Helper';
import TicketIcon from '../../Svg/TicketIcon';
import {Billing_Card_Type, Billing_Types_Type} from '../../../Utils/AppStrings';
import KnowledgeIcon from '../../Svg/KnowledgeIcon';
import ApprovalIcon from '../../Svg/ApprovalIcon';
import ServiceIcon from '../../Svg/ServiceIcon';
import Problems from '../../Svg/Problems';
import InvoiceVector from '../../Svg/InvoiceVector';
import ForwardArrowIcon from '../../Svg/ForwardArrowIcon';
import BackArrowIcon from '../../Svg/BackArrowIcon';
import JobsSVG from '../../Svg/JobsVector';

type BillingCardProps = {
  type: any;
  secondValue?: any;
  isBillingType?: boolean;
  onPress: () => void;
  onFirstPress?: () => void;
  onSecondPress?: () => void;
  onThirdPress?: () => void;
};

const getCardMeta = (type: any, isBillingType: boolean) => {
  if (isBillingType) {
    switch (type) {
      case Billing_Types_Type.Invoices:
        return {
          title: 'Invoices',
          description: 'View and manage your marijuana billing invoices.',
          icon: 'invoice' as const,
        };
      case Billing_Types_Type.Jobs:
        return {
          title: 'Jobs',
          description: 'View your police duty billing jobs.',
          icon: 'jobs' as const,
        };
    }
  } else {
    switch (type) {
      case Billing_Card_Type.Police_Duty:
        return {
          title: 'Police Duty Billing',
          description:
            'Manage police duty billing charges and invoice workflows.',
          firstKey: 'Invoices',
          secondKey: 'Jobs',
          thirdKey: 'Submit Form',
          icon: 'invoice' as const,
        };
      case Billing_Card_Type.Marijuana_Billing:
        return {
          title: 'Marijuana Billing',
          description:
            'Manage marijuana billing charges and invoice workflows.',
          firstKey: 'Invoices',
          icon: 'invoice' as const,
        };
      case Billing_Card_Type.Medical_Billing:
        return {
          title: 'Medical Billing',
          description: 'Manage medical billing charges and invoice workflows.',
          firstKey: 'Invoices',
          icon: 'invoice' as const,
        };
      case Billing_Card_Type.Police_Academy_Billing:
        return {
          title: 'Police Academy Billing',
          description:
            'Manage police academy billing charges and invoice workflows.',
          firstKey: 'Invoices',
          icon: 'invoice' as const,
        };
    }
  }

  return {
    title: 'Invoices',
    description: '',
    icon: 'invoice' as const,
  };
};
const BillingCard = ({
  type,
  isBillingType = false,
  onPress,
  onFirstPress,
  onSecondPress,
  onThirdPress,
}: BillingCardProps) => {
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const cardMeta = useMemo(
    () => getCardMeta(type, isBillingType),
    [type, isBillingType],
  );
  const cardIcon = useMemo(() => {
    switch (cardMeta.icon) {
      case 'invoice':
        return <InvoiceVector primary={colors.Primary} />;
      case 'jobs':
        return <JobsSVG primary={colors.Primary} />;
      default:
        return <InvoiceVector primary={colors.Primary} />;
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
            <BackArrowIcon inverted primary={colors.Heading_Txt} />
          </View>
        </TouchableOpacity>
      )}

      {cardMeta.secondKey && <View style={styles.space12} />}
      {cardMeta.secondKey && (
        <TouchableOpacity activeOpacity={0.8} onPress={onSecondPress}>
          <View style={[styles.rowCont, styles.itemCont]}>
            <Text style={styles.itemKey}>{cardMeta.secondKey}</Text>
            <BackArrowIcon inverted primary={colors.Heading_Txt} />
          </View>
        </TouchableOpacity>
      )}

      {cardMeta.thirdKey && <View style={styles.space12} />}
      {cardMeta.thirdKey && (
        <TouchableOpacity activeOpacity={0.8} onPress={onThirdPress}>
          <View style={[styles.rowCont, styles.itemCont]}>
            <Text style={styles.itemKey}>{cardMeta.thirdKey}</Text>
            <BackArrowIcon inverted primary={colors.Heading_Txt} />
          </View>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={styles.btnCont}>
        <Text style={styles.detailsBtnTxt}>View {cardMeta.title}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default memo(BillingCard);

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
