import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppFonts, normalized} from '../../Utils/AppConstants';

type Props = {
  text: string;
  onPress?: () => void | Promise<void>;
  disabled?: boolean;
  LeftIcon?: React.ComponentType<any>;
  RightIcon?: React.ComponentType<any>;
  loading?: boolean;
  accessibilityRole?: any;
  accessibilityLabel?: any;
  accessibilityHint?: any;
  style?: any;
};

const CustomButton = (props: Props) => {
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );

  // --- bounce of the whole button ---
  const buttonScale = useRef(new Animated.Value(1)).current;
  const bounce = () => {
    buttonScale.stopAnimation(() => {
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 0.94,
          duration: 70,
          useNativeDriver: true,
        }),
        Animated.spring(buttonScale, {
          toValue: 1,
          tension: 220,
          friction: 12,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  // --- label <-> loader swap ---
  const [internalLoading, setInternalLoading] = useState(false);
  const isLoading = props.loading ?? internalLoading;

  const labelScale = useRef(new Animated.Value(1)).current;
  const labelOpacity = useRef(new Animated.Value(1)).current;

  const spinnerScale = useRef(new Animated.Value(0.8)).current;
  const spinnerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLoading) {
      Animated.parallel([
        Animated.timing(labelOpacity, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(labelScale, {
          toValue: 0.8,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(spinnerOpacity, {
            toValue: 1,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.spring(spinnerScale, {
            toValue: 1,
            tension: 220,
            friction: 12,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(spinnerOpacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(spinnerScale, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(40),
          Animated.spring(labelScale, {
            toValue: 1,
            tension: 220,
            friction: 12,
            useNativeDriver: true,
          }),
          Animated.timing(labelOpacity, {
            toValue: 1,
            duration: 80,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [isLoading, labelOpacity, labelScale, spinnerOpacity, spinnerScale]);

  const handlePress = () => {
    if (props.disabled || isLoading) return;

    // 1) tap bounce right away
    bounce();

    // 2) trigger swap animation (uncontrolled mode)
    if (typeof props.loading !== 'boolean') {
      setInternalLoading(true);
      setTimeout(() => setInternalLoading(false), 1200);
    }

    // 3) call user's handler
    props.onPress?.();
  };

  return (
    <Animated.View
      accessible={false}
      pointerEvents="box-none" // never block touches to the child Touchable
      style={{transform: [{scale: buttonScale}]}}>
      <TouchableOpacity
        // Make the touchable the sole accessible element
        accessible
        accessibilityRole={props.accessibilityRole ?? 'button'}
        accessibilityLabel={props.accessibilityLabel ?? props.text}
        accessibilityHint={props.accessibilityHint}
        accessibilityState={{
          disabled: !!props.disabled || !!isLoading,
          busy: !!isLoading,
        }}
        activeOpacity={0.7}
        hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
        onPress={handlePress}
        disabled={props.disabled || isLoading}
        style={[
          styles.button,
          {
            backgroundColor: colors.Primary,
          },
          props.RightIcon || props.LeftIcon
            ? {justifyContent: 'space-between'}
            : {justifyContent: 'center'},
          {...props?.style},
        ]}>
        {/* Left icon: decorative (don't intercept touches) */}
        {props.LeftIcon && !isLoading ? (
          <View pointerEvents="none">
            <props.LeftIcon color={'#fff'} />
          </View>
        ) : (
          <View style={{width: normalized(16)}} />
        )}

        {/* Label overlay: ensure it never steals touches */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.labelOverlay,
            {
              opacity: labelOpacity,
              transform: [{scale: labelScale}],
              ...(props.RightIcon && !isLoading ? {left: normalized(15)} : {}),
            },
          ]}>
          <Text
            style={{
              color: colors.White,
              fontFamily: AppFonts.UbuntuBold,
              fontSize: normalized(14),
            }}>
            {props.text}
          </Text>
        </Animated.View>

        {/* Spinner: decorative (don’t intercept) */}
        <Animated.View
          pointerEvents="none"
          style={{
            opacity: spinnerOpacity,
            transform: [{scale: spinnerScale}],
          }}>
          <ActivityIndicator size="small" color={colors.White} />
        </Animated.View>

        {/* Right icon: decorative (don’t intercept) */}
        {props.RightIcon && !isLoading ? (
          <View pointerEvents="none">
            <props.RightIcon color={'#fff'} />
          </View>
        ) : (
          <View style={{width: normalized(16)}} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  button: {
    marginTop: normalized(20),
    alignItems: 'center',
    borderRadius: normalized(8),
    height: normalized(40),
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: normalized(12),
  },
  labelOverlay: {
    position: 'absolute',
    alignSelf: 'center',
  },
});
