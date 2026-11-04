import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Svg, {Circle} from 'react-native-svg';
import {AppColors, AppFonts, normalized} from '../../Utils/AppConstants';
import {formatDate} from '../dynamic_form_shared/DynamicFormCore';
import {formatRemainingTime, getRemainingSeconds} from '../../Utils/Helper';

type Props = {
  expiresAt: string | Date; // timestamp the countdown reaches zero
  totalSeconds: number; // full duration, used to compute ring progress
  color: string; // default ring color, passed by parent
  size?: number;
  strokeWidth?: number;
};

const ALARM_THRESHOLD_SEC = 15 * 60;
const ERROR_THRESHOLD_SEC = 5 * 60;

const CountdownRing: React.FC<Props> = ({
  expiresAt,
  totalSeconds,
  color,
  size = normalized(200),
  strokeWidth = normalized(10),
}) => {
  const [remaining, setRemaining] = useState(() =>
    getRemainingSeconds(expiresAt),
  );

  useEffect(() => {
    const interval = setInterval(
      () => setRemaining(getRemainingSeconds(expiresAt)),
      1000,
    );
    return () => clearInterval(interval);
  }, [expiresAt]);

  const status: 'active' | 'expired' = remaining > 0 ? 'active' : 'expired';

  const ringColor =
    status === 'expired' || remaining <= ERROR_THRESHOLD_SEC
      ? AppColors.ToastColors.Error
      : remaining <= ALARM_THRESHOLD_SEC
      ? AppColors.ToastColors.Alarm
      : color;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = totalSeconds > 0 ? remaining / totalSeconds : 0;

  return (
    <View style={{width: size, height: size}}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={AppColors.Grey_2}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Text style={[styles.timeTxt, {color: ringColor}]}>
          {formatRemainingTime(remaining)}
        </Text>
        <View style={[styles.badge, {backgroundColor: ringColor}]}>
          <Text style={styles.badgeTxt}>
            {status === 'active' ? 'Active' : 'Expired'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {alignItems: 'center', justifyContent: 'center'},
  timeTxt: {fontSize: normalized(20), fontFamily: AppFonts.UbuntuBold},
  badge: {
    marginTop: normalized(8),
    paddingHorizontal: normalized(14),
    paddingVertical: normalized(4),
    borderRadius: normalized(20),
  },
  badgeTxt: {
    color: '#fff',
    fontSize: normalized(13),
    fontFamily: AppFonts.UbuntuMedium,
  },
});

export default CountdownRing;
