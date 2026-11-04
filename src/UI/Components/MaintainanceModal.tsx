import {
  Animated,
  Easing,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {AppFonts, normalized} from '../../Utils/AppConstants';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';

import CloseIcon from '../Svg/CloseIcon';
import WrenchVector from '../Svg/WrenchVector';
import {formatDateTime, removeHtmlTags} from '../../Utils/Helper';
import {AsyncKeyStrings} from '../../Utils/AppStrings';
import {getDataAsync, setDataInAsync} from '../../Utils/AsyncStorage';

type Props = {
  data?: any;
  visible?: boolean;
  onEnd?: () => void;
};

const MaintenanceModal = ({data, visible, onEnd}: Props) => {
  useEffect(() => {
    if (!visible || !data) {
      setIsSmallOpen(false);
      setIsModalOpen(false);
      setRemainingSeconds(0);
      setCountdownLabel('Completing in');
    }
  }, [visible, data]);

  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );

  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  const horizontalAnim = useRef(new Animated.Value(0)).current;

  const [isSmallOpen, setIsSmallOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [countdownLabel, setCountdownLabel] = useState('Completing in');

  const maintenanceData =
    data?.maintenanceWindow ?? data?.data?.maintenanceWindow ?? data;
  const startDateTime = maintenanceData?.startDateTime;
  const endDateTime = maintenanceData?.endDateTime;
  const message = maintenanceData?.message;

  useEffect(() => {
    if (!startDateTime || !endDateTime || !visible) {
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const start = new Date(startDateTime).getTime();
      const end = new Date(endDateTime).getTime();

      if (Number.isNaN(start) || Number.isNaN(end)) {
        setRemainingSeconds(0);
        return;
      }

      if (now < start) {
        setCountdownLabel('Commencing in');
        setRemainingSeconds(Math.max(0, Math.floor((start - now) / 1000)));
        return;
      }
      if (now >= end) {
        setCountdownLabel('Completing in');
        setRemainingSeconds(0);
        onEnd?.();
        return;
      }

      setCountdownLabel('Completing in');
      setRemainingSeconds(Math.max(0, Math.floor((end - now) / 1000)));
    };

    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [startDateTime, endDateTime]);

  useEffect(() => {
    if (!startDateTime || !visible) return;
    const id = `${startDateTime}-${endDateTime}`;

    (async () => {
      const seenId = await getDataAsync(AsyncKeyStrings.MaintenanceSeenId);
      if (seenId === id) return; // already shown, stay quiet
      setDataInAsync(AsyncKeyStrings.MaintenanceSeenId, id);
      setIsSmallOpen(true);
      setIsModalOpen(true);
    })();
  }, [startDateTime, endDateTime, visible]);

  const triggerSlideAnimation = (onEnd?: () => void) => {
    Animated.sequence([
      Animated.timing(horizontalAnim, {
        toValue: -normalized(12),
        duration: 180,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(horizontalAnim, {
        toValue: 0,
        duration: 180,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => onEnd?.());
  };

  const formatCountdown = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    return `${String(h).padStart(2, '0')}:${String(m).padStart(
      2,
      '0',
    )}:${String(s).padStart(2, '0')}`;
  };

  const onOpenSmall = () => {
    setIsSmallOpen(true);
    requestAnimationFrame(() => triggerSlideAnimation());
  };

  const onCloseSmall = () => {
    triggerSlideAnimation(() => setIsSmallOpen(false));
  };

  const onOpenModal = () => {
    setIsModalOpen(true);
  };

  const onCloseModal = () => {
    setIsModalOpen(false);
  };
  if (!visible || !data) return null;
  return (
    <>
      <Animated.View
        style={[styles.cont, {transform: [{translateX: horizontalAnim}]}]}>
        {isSmallOpen ? (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onOpenModal}
            style={styles.smallCard}>
            <View style={[styles.sidePanelCont, styles.smallIconCont]}>
              <WrenchVector width={20} height={20} primary={'#F59E0B'} />
            </View>

            <View style={styles.smallTextCont}>
              <Text numberOfLines={1} style={styles.smallTitle}>
                {countdownLabel}
              </Text>
              <Text style={styles.smallTimer}>
                {formatCountdown(remainingSeconds)}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onCloseSmall}
              style={styles.smallCloseBtn}>
              <CloseIcon
                primary={colors.Desc_Txt}
                width={25}
                height={25}
                strokeWidth={2}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onOpenSmall}
            style={styles.arrowCont}>
            <WrenchVector width={20} height={20} primary={'#F59E0B'} />
          </TouchableOpacity>
        )}
      </Animated.View>

      <Modal visible={isModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onCloseModal}
              style={styles.modalCloseBtn}>
              <CloseIcon
                primary={colors.Desc_Txt}
                width={24}
                height={24}
                strokeWidth={2}
              />
            </TouchableOpacity>

            <View style={[styles.sidePanelCont, styles.modalIconCont]}>
              <WrenchVector width={28} height={28} primary={'#F59E0B'} />
            </View>

            <Text style={[styles.Heading, styles.modalTitle]}>
              {maintenanceData?.title || 'System Maintenance In Progress'}
            </Text>

            <Text style={[styles.Desc_Txt_N1, styles.modalDesc]}>
              {
                'If you encounter any issues, please restart your application'
                // removeHtmlTags(message)
              }
            </Text>
            <View style={styles.timeBox}>
              <View style={[styles.rowCont, styles.timeRow]}>
                <Text style={[styles.keyTxt, styles.timeLabel]}>Start</Text>
                <Text style={[styles.valueTxt, styles.timeValue]}>
                  {formatDateTime(startDateTime)}
                </Text>
              </View>

              <View style={[styles.rowCont, styles.timeRow]}>
                <Text style={[styles.keyTxt, styles.timeLabel]}>End</Text>
                <Text style={[styles.valueTxt, styles.timeValue]}>
                  {formatDateTime(endDateTime)}
                </Text>
              </View>
            </View>

            <View style={styles.noteBox}>
              <Text style={[styles.Desc_Txt_N1, styles.noteText]}>
                The server may go down intermittently — we recommend avoiding
                new submissions during this period.
              </Text>
            </View>

            <View style={styles.countdownBox}>
              <Text style={[styles.keyTxt, styles.countdownLabel]}>
                {countdownLabel}
              </Text>
              <Text style={styles.countdownValue}>
                {formatCountdown(remainingSeconds)}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={onCloseModal}
              style={styles.gotItBtn}>
              <Text style={[styles.btnTxt, styles.gotItTxt]}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default MaintenanceModal;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    cont: {
      position: 'absolute',
      bottom: normalized(90),
      right: 0,
      zIndex: 999,
    },

    arrowCont: {
      width: normalized(35),
      height: normalized(35),
      marginBottom: normalized(70),
      backgroundColor: '#FEF3E0',
      borderTopLeftRadius: normalized(25),
      borderBottomLeftRadius: normalized(25),
      alignItems: 'center',
      justifyContent: 'center',
      paddingLeft: normalized(2),
    },

    smallCard: {
      width: normalized(200),
      minHeight: normalized(56),
      marginRight: normalized(12),
      borderRadius: normalized(14),
      backgroundColor: colors.Background,
      borderWidth: 1,
      borderColor: colors.BorderColor,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: normalized(14),
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 8},
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 8,
    },

    smallIconCont: {
      width: normalized(37),
      height: normalized(37),
      borderRadius: normalized(16),
      backgroundColor: '#FFF2D8',
      marginRight: normalized(12),
    },

    smallTextCont: {
      flex: 1,
    },

    smallTitle: {
      fontSize: normalized(12),
      color: colors.Desc_Txt,
      fontFamily: AppFonts.UbuntuBold,
    },

    smallTimer: {
      marginTop: normalized(5),
      fontSize: normalized(15),
      color: colors.Heading_Txt,
      fontFamily: AppFonts.UbuntuBold,
    },

    smallCloseBtn: {
      width: normalized(28),
      height: normalized(28),
      alignItems: 'center',
      justifyContent: 'center',
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: normalized(28),
    },

    modalCard: {
      width: '100%',
      borderRadius: normalized(18),
      backgroundColor: colors.White,
      paddingHorizontal: normalized(18),
      paddingTop: normalized(22),
      paddingBottom: normalized(18),
      alignItems: 'center',

      shadowColor: '#000',
      shadowOffset: {width: 0, height: 12},
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 14,
    },

    modalCloseBtn: {
      position: 'absolute',
      top: normalized(14),
      right: normalized(14),
      width: normalized(28),
      height: normalized(28),
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2,
    },

    modalIconCont: {
      width: normalized(46),
      height: normalized(46),
      borderRadius: normalized(46),
      backgroundColor: '#FFF2D8',
      marginBottom: normalized(20),
    },

    modalTitle: {
      fontSize: normalized(20),
      lineHeight: normalized(26),
      color: '#1F2937',
    },

    modalDesc: {
      marginTop: normalized(12),
      lineHeight: normalized(16),
      color: '#6B7280',
    },

    timeBox: {
      width: '100%',
      marginTop: normalized(14),
      borderRadius: normalized(7),
      backgroundColor: '#A8D0E7',
      paddingVertical: normalized(8),
      paddingHorizontal: normalized(14),
      gap: normalized(7),
    },

    timeRow: {
      gap: normalized(10),
    },

    timeLabel: {
      fontSize: normalized(12),
      color: '#111827',
    },

    timeValue: {
      flex: 1,
      textAlign: 'right',
      fontSize: normalized(11),
      color: '#111827',
    },

    noteBox: {
      width: '100%',
      marginTop: normalized(12),
      borderRadius: normalized(7),
      backgroundColor: '#FFF2D8',
      paddingVertical: normalized(10),
      paddingHorizontal: normalized(12),
    },

    noteText: {
      lineHeight: normalized(16),
      color: '#6B625B',
    },

    countdownBox: {
      width: '100%',
      marginTop: normalized(12),
      borderRadius: normalized(7),
      backgroundColor: '#FFA1A5',
      paddingVertical: normalized(9),
      paddingHorizontal: normalized(14),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: normalized(10),
    },

    countdownLabel: {
      flex: 1,
      fontSize: normalized(11),
      color: '#9B5F63',
    },

    countdownValue: {
      fontSize: normalized(17),
      color: '#000000',
      fontFamily: AppFonts.UbuntuBold,
    },

    gotItBtn: {
      width: '100%',
      height: normalized(39),
      borderRadius: normalized(7),
      backgroundColor: colors.Primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: normalized(22),
    },

    gotItTxt: {
      fontSize: normalized(16),
      color: colors.White,
    },
  });
