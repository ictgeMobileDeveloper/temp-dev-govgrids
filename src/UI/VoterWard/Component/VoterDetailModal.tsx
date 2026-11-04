import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {AppFonts, normalized} from '../../../Utils/AppConstants';
import CloseIcon from '../../Svg/CloseIcon';

type Props = {
  visible: boolean;
  onClose: () => void;
  item: any;
  colors: any;
};

const VoterDetailModal = ({visible, onClose, item, colors}: Props) => {
  const styles = makeStyles(colors);

  const getValue = (value: any) => {
    const text = String(value ?? '').trim();
    return text ? text : 'N/A';
  };

  const details = [
    ['Voter ID', item?.voterId],
    ['Last Name', item?.lastName],
    ['First Name', item?.firstName],
    ['Middle', item?.middle],
    ['Suffix', item?.suffix],
    ['Street No', item?.stNo],
    ['Street', item?.street],
    ['Apartment Unit', item?.aptUnit],
    ['City', item?.city],
    ['State', item?.state],
    ['Zip', item?.zip],
    ['Party', item?.pty],
    ['Sex', item?.sex],
    ['Birth Year', item?.birthYear],
    ['Phone', item?.phone],
    ['Voting District', item?.votingDistrict],
    ['Congressional District', item?.congressionalDistrict],
    ['Senatorial District', item?.senatorialDistrict],
    ['Assembly District', item?.assemblyDistrict],
    ['Ward', item?.ward],
  ];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>View Ward Record</Text>

            <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
              <CloseIcon width={18} height={18} primary={colors.Heading_Txt} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.grid}>
              {details.map(([label, value]) => (
                <View key={label} style={styles.item}>
                  <Text style={styles.label}>{label}</Text>
                  <Text style={styles.value}>{getValue(value)}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeTxt}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default VoterDetailModal;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: normalized(18),
    },
    card: {
      width: '100%',
      maxHeight: '85%',
      backgroundColor: colors.Background,
      borderRadius: normalized(10),
      padding: normalized(16),
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: normalized(16),
    },
    title: {
      fontSize: normalized(20),
      color: colors.Heading_Txt,
      fontFamily: AppFonts.UbuntuBold,
    },
    closeIcon: {
      width: normalized(30),
      height: normalized(30),
      borderWidth: 1,
      borderColor: colors.BorderColor,
      borderRadius: normalized(6),
      alignItems: 'center',
      justifyContent: 'center',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    item: {
      width: '33.33%',
      marginBottom: normalized(14),
      paddingRight: normalized(10),
    },
    label: {
      fontSize: normalized(13),
      color: colors.Desc_Txt,
      fontFamily: AppFonts.UbuntuBold,
      marginBottom: normalized(5),
    },
    value: {
      fontSize: normalized(14),
      color: colors.Heading_Txt,
      fontFamily: AppFonts.UbuntuRegular,
    },
    closeBtn: {
      alignSelf: 'flex-end',
      marginTop: normalized(12),
      borderWidth: 1,
      borderColor: colors.Heading_Txt,
      borderRadius: normalized(6),
      paddingHorizontal: normalized(18),
      paddingVertical: normalized(8),
    },
    closeTxt: {
      color: colors.Heading_Txt,
      fontSize: normalized(13),
      fontFamily: AppFonts.UbuntuRegular,
    },
  });
