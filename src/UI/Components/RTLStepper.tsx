import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppColors, AppFonts, normalized} from '../../Utils/AppConstants';
import {AppStyles} from '../../Utils/AppStyles';
import TickIcon from '../Svg/TickIcon';
import DoubleForwardArrow from '../Svg/DoubleForwardArrow';

const RTLStepper = ({list = [], completedSteps = [], activeStep}: any) => {
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  const getId = (item: any) => {
    if (item === null || item === undefined) return String(item);
    if (typeof item === 'object') {
      return (
        item.id ??
        item.key ??
        String(item.label ?? item.name ?? JSON.stringify(item))
      );
    }
    return String(item);
  };

  const isItemActive = (item: any) => getId(item) === getId(activeStep);
  const isItemCompleted = (item: any) =>
    completedSteps?.some((cs: any) => getId(cs) === getId(item));

  const stepColor = (item: any): string =>
    isItemActive(item)
      ? colors.Primary
      : isItemCompleted(item)
      ? colors.Ice_Blue
      : colors.Black;

  return (
    <View style={styles.container}>
      {list.map((item: any, index: number) => {
        const completed = isItemCompleted(item);
        const active = isItemActive(item);
        const label =
          typeof item === 'object'
            ? item.label ?? item.name ?? String(item)
            : String(item);

        const showArrow = index !== 0; // skip rightmost arrow

        return (
          <View key={index} style={styles.stepItem}>
            <View style={styles.stepRow}>
              {/* Circle / Tick */}
              {completed ? (
                <View style={[styles.circle, {borderColor: colors.Primary}]}>
                  <TickIcon width={12} height={14} primary={colors.Primary} />
                </View>
              ) : active ? (
                <View style={styles.outerCircle}>
                  <View style={styles.innerCircle} />
                </View>
              ) : (
                <View style={styles.circle} />
              )}

              {/* Label */}
              <Text style={[styles.stepTxt, {color: stepColor(item)}]}>
                {label}
              </Text>

              {/* Arrow */}
              {showArrow && (
                <View style={{transform: [{scaleX: -1}]}}>
                  <DoubleForwardArrow primary={stepColor(item)} />
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default RTLStepper;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      width: '100%',
      flexDirection: 'row-reverse', // RTL flow
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: normalized(20),
      height: normalized(60),
    },
    stepItem: {
      flex: 1,
      alignItems: 'center',
    },
    stepRow: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      justifyContent: 'center',
    },
    circle: {
      borderColor: colors.Ice_Blue,
      borderRadius: normalized(50),
      borderWidth: 1,
      width: normalized(20),
      height: normalized(20),
      alignItems: 'center',
      justifyContent: 'center',
    },
    outerCircle: {
      width: normalized(20),
      height: normalized(20),
      borderWidth: 1,
      borderRadius: normalized(20),
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: AppColors.White,
      backgroundColor: AppColors.White,
    },
    innerCircle: {
      width: normalized(18),
      height: normalized(18),
      borderWidth: normalized(5),
      borderRadius: normalized(20),
      borderColor: colors.Primary,
    },
    stepTxt: {
      fontFamily: AppFonts.UbuntuMedium,
      fontSize: normalized(14),
      marginHorizontal: normalized(8),
    },
  });
