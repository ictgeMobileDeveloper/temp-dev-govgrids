import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { AppRootStore } from '../../Redux/AppStore';
import { AppFonts, normalized } from '../../Utils/AppConstants';

type Props = {
  text: string;
  onPress?: () => void | Promise<void>;
  disabled?: boolean;
  LeftIcon?: React.ComponentType<any>;
  RightIcon?: React.ComponentType<any>;
  loading?: boolean; // NEW
  accessibilityRole?: any;
  accessibilityLabel?: any;
  accessibilityHint?: any;
  style?: any;
  textStyle?: any;
  leftIconProps?: any;
  rightIconProps?: any;
};

const SimpleButton = (props: Props) => {
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );

  // --- bounce ---
  const scale = useRef(new Animated.Value(1)).current;
  const bounce = () => {
    scale.stopAnimation(() => {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 0.94,
          duration: 70,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 220,
          friction: 12,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  // --- label <-> loader swap (mirrors your first button) ---
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

    // 1) haptic-like bounce
    bounce();

    // 2) uncontrolled loading auto-timeout
    if (typeof props.loading !== 'boolean') {
      setInternalLoading(true);
      setTimeout(() => setInternalLoading(false), 1200);
    }

    // 3) user handler
    props.onPress?.();
  };

  const showIcons = !isLoading;

  return (
    <Animated.View style={{ transform: [{ scale }], width: '100%' }}>
      <TouchableOpacity
        accessible
        accessibilityRole={props.accessibilityRole ?? 'button'}
        accessibilityLabel={props.accessibilityLabel ?? props.text}
        accessibilityHint={props.accessibilityHint}
        accessibilityState={{
          disabled: !!props.disabled || !!isLoading,
          busy: !!isLoading,
        }}
        activeOpacity={1} // scale provides feedback
        onPress={handlePress}
        disabled={props.disabled || isLoading}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={[
          styles.button,
          {
            borderColor: colors.Desc_Txt,
            opacity: props.disabled || isLoading ? 0.6 : 1,
          },
          props.style,
        ]}
      >
        {/* Left icon (keep layout from shifting) */}
        {/* {props.LeftIcon && showIcons ? (
          <View pointerEvents="none">
            <props.LeftIcon {...props.leftIconProps} />
          </View>
        ) : (
          <View style={{ width: normalized(16) }} />
        )} */}

        {/* Center label with animated swap */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.labelOverlay,
            {
              opacity: labelOpacity,
              transform: [{ scale: labelScale }],
              ...(props.RightIcon && showIcons ? { left: normalized(15) } : {}),
            },
          ]}
        >
          <Text
            style={[
              {
                color: colors.Heading_Txt,
                fontFamily: AppFonts.InterBold,
                fontSize: normalized(14),
                textAlign: 'center'
              },
              props.textStyle,
            ]}
          >
            {props.text}
          </Text>
        </Animated.View>

        {/* Spinner */}
        <Animated.View
          pointerEvents="none"
          style={{
            opacity: spinnerOpacity,
            transform: [{ scale: spinnerScale }],
          }}
        >
          <ActivityIndicator size="small" color={colors.Heading_Txt} />
        </Animated.View>

        {/* Right icon (keep layout from shifting) */}
        {/* {props.RightIcon && showIcons ? (
          <View pointerEvents="none">
            <props.RightIcon {...props.rightIconProps} />
          </View>
        ) : (
          <View style={{ width: normalized(16) }} />
        )} */}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default SimpleButton;

const styles = StyleSheet.create({
  button: {
    marginTop: normalized(20),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: normalized(8),
    backgroundColor: 'transparent',
    height: normalized(40),
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: normalized(12),
    borderWidth: 1,
  },
  labelOverlay: {
    position: 'absolute',
    alignSelf: 'center',
  },
});
