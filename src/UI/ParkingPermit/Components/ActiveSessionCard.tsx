import React, {useEffect, useMemo, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useSelector} from 'react-redux';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {AppRootStore} from '../../../Redux/AppStore';
import {AppColors, AppFonts, normalized} from '../../../Utils/AppConstants';
import BackArrowIcon from '../../Svg/BackArrowIcon';
import {
  formatDateTime,
  formatRemainingTime,
  getRemainingSeconds,
} from '../../../Utils/Helper';
import {Routes} from '../../../Utils/Routes';
import {useNavigation} from '@react-navigation/native';

const ALARM_THRESHOLD_SEC = 15 * 60;
const ERROR_THRESHOLD_SEC = 5 * 60;
const SLIDE_DISTANCE = normalized(30);
const SLIDE_DURATION = 180;

type Session = {
  sessionId?: string;
  siteName?: string;
  siteAddress?: string;
  endTime?: string | Date;
  [key: string]: any;
};

type Props = {
  sessions: Session[];
};

const ActiveSessionCard: React.FC<Props> = ({sessions}) => {
  const colors = useSelector((s: AppRootStore) => s.SliceReducer.themeColors);
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [index, setIndex] = useState(0);
  const [now, setNow] = useState(Date.now());

  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const session = sessions?.[index];
  const hasMultiple = (sessions?.length ?? 0) > 1;

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const goTo = (nextIndex: number, direction: 'left' | 'right') => {
    const outDistance = direction === 'left' ? -SLIDE_DISTANCE : SLIDE_DISTANCE;

    opacity.value = withTiming(0, {duration: SLIDE_DURATION / 2});
    translateX.value = withTiming(
      outDistance,
      {duration: SLIDE_DURATION / 2, easing: Easing.out(Easing.ease)},
      finished => {
        if (finished) {
          translateX.value = -outDistance;
        }
      },
    );

    setTimeout(() => {
      setIndex(nextIndex);
      translateX.value = withTiming(0, {
        duration: SLIDE_DURATION / 2,
        easing: Easing.out(Easing.ease),
      });
      opacity.value = withTiming(1, {duration: SLIDE_DURATION / 2});
    }, SLIDE_DURATION / 2);
  };

  const onPrev = () => {
    if (index === 0) return;
    goTo(index - 1, 'right');
  };

  const onNext = () => {
    if (index === sessions.length - 1) return;
    goTo(index + 1, 'left');
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{translateX: translateX.value}],
    opacity: opacity.value,
  }));
  const navigation = useNavigation<any>();

  if (!session) return null;

  const remaining = session?.endTime ? getRemainingSeconds(session.endTime) : 0;

  const timeColor =
    remaining <= ERROR_THRESHOLD_SEC
      ? AppColors.ToastColors.Error
      : remaining <= ALARM_THRESHOLD_SEC
      ? AppColors.ToastColors.Alarm
      : colors.Primary;

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate(Routes.ParkingPermit.SessionDetail, {
          SessionId: session?.sessionId,
        })
      }
      style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={[styles.statusTxt, {color: colors.Primary}]}>
          {'ACTIVE SESSION'}
        </Text>
        <Text style={[styles.timeTxt, {color: timeColor}]}>
          {formatRemainingTime(remaining)}
        </Text>
      </View>

      {hasMultiple && (
        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.pill, index === 0 && styles.pillDisabled]}
            disabled={index === 0}
            onPress={onPrev}>
            <BackArrowIcon
              primary={colors.Heading_Txt}
              width={14}
              height={14}
            />
            <Text style={styles.pillTxt}>Prev</Text>
          </TouchableOpacity>

          <Text style={styles.pageTxt}>
            Session {index + 1} of {sessions.length}
          </Text>

          <TouchableOpacity
            style={[
              styles.pill,
              index === sessions.length - 1 && styles.pillDisabled,
            ]}
            disabled={index === sessions.length - 1}
            onPress={onNext}>
            <Text style={styles.pillTxt}>Next</Text>
            <BackArrowIcon
              inverted
              primary={colors.Heading_Txt}
              width={14}
              height={14}
            />
          </TouchableOpacity>
        </View>
      )}

      <Animated.View style={animatedStyle}>
        <Text style={styles.sessionIdTxt}>
          Session ID: {session?.sessionId ?? 'N/A'}
        </Text>
        <Text style={styles.addressTxt}>
          {session?.siteName ?? 'N/A'}
          {session?.siteAddress ? ` • ${session.siteAddress}` : ''}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default ActiveSessionCard;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    card: {
      borderWidth: 1,
      borderColor: colors.Primary,
      borderRadius: normalized(14),
      padding: normalized(10),
      backgroundColor: colors.Background,
      gap: normalized(5),
      marginTop: normalized(10),
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    statusTxt: {
      fontSize: normalized(11),
      fontFamily: AppFonts.UbuntuBold,
      letterSpacing: 0.5,
    },
    timeTxt: {
      fontSize: normalized(13),
      fontFamily: AppFonts.UbuntuBold,
    },
    navRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.BorderColor,
      borderRadius: normalized(20),
      paddingHorizontal: normalized(8),
      paddingVertical: normalized(8),
    },
    pillDisabled: {
      opacity: 0.4,
    },
    pillTxt: {
      fontSize: normalized(10),
      fontFamily: AppFonts.UbuntuMedium,
      color: colors.Heading_Txt,
    },
    pageTxt: {
      fontSize: normalized(11),
      fontFamily: AppFonts.UbuntuBold,
      color: colors.Heading_Txt,
    },
    sessionIdTxt: {
      fontSize: normalized(11),
      fontFamily: AppFonts.UbuntuBold,
      color: colors.Heading_Txt,
    },
    addressTxt: {
      fontSize: normalized(10),
      fontFamily: AppFonts.UbuntuRegular,
      color: colors.Desc_Txt,
    },
  });
