import React, {useEffect, useMemo, useRef} from 'react';
import {Animated, Pressable, StyleSheet, Text, View} from 'react-native';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppFonts, normalized} from '../../Utils/AppConstants';

type Props = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
};

const CustomToggleComp = ({value, onValueChange, label, disabled}: Props) => {
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const knobTranslateX = useRef(new Animated.Value(value ? 20 : 2)).current;
  const trackDynamicStyle = useMemo(
    () => ({
      backgroundColor: value ? colors.Primary : '#E9E9EA',
      opacity: disabled ? 0.5 : 1,
    }),
    [colors.Primary, disabled, value],
  );

  useEffect(() => {
    Animated.timing(knobTranslateX, {
      toValue: value ? 20 : 2,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [knobTranslateX, value]);

  return (
    <View style={styles.container}>
      {label ? (
        <Text style={[styles.label, {color: colors.Heading_Txt}]}>{label}</Text>
      ) : null}
      <Pressable
        onPress={() => onValueChange(!value)}
        disabled={disabled}
        style={[styles.toggleTrack, trackDynamicStyle]}>
        <Animated.View
          style={[
            styles.knob,
            {
              transform: [{translateX: knobTranslateX}],
            },
          ]}
        />
      </Pressable>
    </View>
  );
};

export default CustomToggleComp;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: normalized(12),
  },
  label: {
    flex: 1,
    fontFamily: AppFonts.UbuntuMedium,
    fontSize: normalized(14),
  },
  toggleTrack: {
    width: normalized(52),
    height: normalized(32),
    borderRadius: normalized(16),
    justifyContent: 'center',
  },
  knob: {
    width: normalized(28),
    height: normalized(28),
    borderRadius: normalized(14),
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
});
