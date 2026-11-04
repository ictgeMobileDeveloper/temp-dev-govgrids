// // src/Components/CustomCheckBox.tsx
// import React, { useEffect, useRef, useState } from 'react';
// import {
//   Animated,
//   Text,
//   TouchableOpacity,
//   View,
//   StyleSheet,
//   ViewStyle,
//   TextStyle,
// } from 'react-native';
// import { useSelector } from 'react-redux';
// import { AppRootStore } from '../../Redux/AppStore';
// import { normalized } from '../../Utils/AppConstants';
// import TickIcon from '../Svg/TickIcon';

// type Props = {
//   checked?: boolean; // controlled
//   defaultChecked?: boolean; // uncontrolled
//   onChange?: (next: boolean) => void;
//   size?: number;
//   round?: boolean;
//   style?: ViewStyle; // row container
//   boxStyle?: ViewStyle; // checkbox box
//   label?: string | React.ReactNode;
//   labelStyle?: TextStyle;
//   disabled?: boolean;
//   fillColor?: string;
//   tickColor?: string;
//   borderColor?: string;
// };

// const CustomCheckBox: React.FC<Props> = ({
//   checked,
//   defaultChecked = false,
//   onChange,
//   size = normalized(16),
//   round = false,
//   style,
//   boxStyle,
//   label,
//   labelStyle,
//   disabled = false,
//   fillColor,
//   tickColor,
//   borderColor,
// }) => {
//   const colors = useSelector((s: AppRootStore) => s.SliceReducer.themeColors);

//   const isControlled = typeof checked === 'boolean';
//   const [internal, setInternal] = useState(defaultChecked);
//   const isChecked = isControlled ? (checked as boolean) : internal;

//   const radius = normalized(4);
//   const baseBorder = borderColor ?? colors.Desc_Txt;
//   const onFill = fillColor ?? colors.Primary;
//   const onTick = tickColor ?? colors.White;

//   // --- animations ---
//   const firstRender = useRef(true);
//   const boxScale = useRef(new Animated.Value(1)).current;
//   const fillScale = useRef(new Animated.Value(isChecked ? 1 : 0.01)).current;
//   const tickScale = useRef(new Animated.Value(isChecked ? 1 : 0.9)).current;
//   const tickOpacity = useRef(new Animated.Value(isChecked ? 1 : 0)).current;

//   const bounceBox = () => {
//     boxScale.stopAnimation(() => {
//       Animated.sequence([
//         Animated.timing(boxScale, {
//           toValue: 0.9,
//           duration: 70,
//           useNativeDriver: true,
//         }),
//         Animated.spring(boxScale, {
//           toValue: 1,
//           tension: 220,
//           friction: 12,
//           useNativeDriver: true,
//         }),
//       ]).start();
//     });
//   };

//   // animate on checked changes (including controlled updates)
//   useEffect(() => {
//     if (!firstRender.current) bounceBox();

//     if (isChecked) {
//       Animated.parallel([
//         Animated.spring(fillScale, {
//           toValue: 1,
//           tension: 220,
//           friction: 12,
//           useNativeDriver: true,
//         }),
//         Animated.sequence([
//           Animated.timing(tickOpacity, {
//             toValue: 1,
//             duration: 100,
//             useNativeDriver: true,
//           }),
//           Animated.spring(tickScale, {
//             toValue: 1,
//             tension: 220,
//             friction: 12,
//             useNativeDriver: true,
//           }),
//         ]),
//       ]).start();
//     } else {
//       Animated.parallel([
//         Animated.timing(tickOpacity, {
//           toValue: 0,
//           duration: 80,
//           useNativeDriver: true,
//         }),
//         Animated.timing(tickScale, {
//           toValue: 0.9,
//           duration: 80,
//           useNativeDriver: true,
//         }),
//         Animated.spring(fillScale, {
//           toValue: 0.01, // tiny so it visually disappears
//           tension: 200,
//           friction: 16,
//           useNativeDriver: true,
//         }),
//       ]).start();
//     }

//     firstRender.current = false;
//   }, [isChecked, fillScale, tickOpacity, tickScale]);

//   const toggle = () => {
//     if (disabled) return;
//     const next = !isChecked;
//     if (!isControlled) setInternal(next);
//     onChange?.(next);
//   };

//   const tickSize = Math.round(size * 0.7);

//   return (
//     <TouchableOpacity
//       activeOpacity={1}
//       onPress={toggle}
//       disabled={disabled}
//       style={[
//         {
//           flexDirection: 'row',
//           alignItems: 'center',
//           opacity: disabled ? 0.6 : 1,
//           //   marginTop: normalized(12),
//         },
//         style,
//       ]}
//       hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
//     >
//       <Animated.View
//         style={[
//           {
//             width: size,
//             height: size,
//             borderRadius: radius,
//             borderWidth: 1.5,
//             borderColor: isChecked ? onFill : baseBorder,
//             overflow: 'hidden',
//             justifyContent: 'center',
//             alignItems: 'center',
//             backgroundColor: 'transparent',
//             transform: [{ scale: boxScale }],
//           },
//           boxStyle,
//         ]}
//       >
//         {/* bouncing fill */}
//         <Animated.View
//           pointerEvents="none"
//           style={{
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0, // (instead of inset)
//             backgroundColor: onFill,
//             transform: [{ scale: fillScale }],
//             borderRadius: normalized(2),
//           }}
//         />

//         {/* zooming SVG tick */}
//         <Animated.View
//           pointerEvents="none"
//           style={{
//             opacity: tickOpacity,
//             transform: [{ scale: tickScale }],
//             justifyContent: 'center',
//             alignItems: 'center',
//           }}
//         >
//           <TickIcon />
//         </Animated.View>
//       </Animated.View>

//       {label ? (
//         typeof label === 'string' ? (
//           <Text
//             style={[
//               { marginLeft: normalized(10), color: colors.Heading_Txt },
//               labelStyle,
//             ]}
//           >
//             {label}
//           </Text>
//         ) : (
//           <View style={{ marginLeft: normalized(10) }}>{label}</View>
//         )
//       ) : null}
//     </TouchableOpacity>
//   );
// };

// export default CustomCheckBox;

// const styles = StyleSheet.create({});



///////////////////////////////

// src/Components/CustomCheckBox.tsx
import React, { useState } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useSelector } from 'react-redux';
import { AppRootStore } from '../../Redux/AppStore';
import { AppColors, normalized } from '../../Utils/AppConstants';
import TickIcon from '../Svg/TickIcon';

type Props = {
  checked?: boolean; // controlled
  defaultChecked?: boolean; // uncontrolled
  onChange?: (next: boolean) => void;
  size?: number;
  round?: boolean;
  style?: ViewStyle; // row container
  boxStyle?: ViewStyle; // checkbox box
  label?: string | React.ReactNode;
  labelStyle?: TextStyle;
  disabled?: boolean;
  fillColor?: string;
  tickColor?: string;
  borderColor?: string;
  isError?: boolean;
};

const CustomCheckBox: React.FC<Props> = ({
  checked,
  defaultChecked = false,
  onChange,
  size = normalized(16),
  round = false,
  style,
  boxStyle,
  label,
  labelStyle,
  disabled = false,
  fillColor,
  tickColor,
  borderColor,
  isError = false
}) => {
  const colors = useSelector((s: AppRootStore) => s.SliceReducer.themeColors);

  const isControlled = typeof checked === 'boolean';
  const [internal, setInternal] = useState(defaultChecked);
  const isChecked = isControlled ? (checked as boolean) : internal;

  const radius = round ? size / 2 : normalized(4);
  const baseBorder = colors.Primary;
  const onFill = fillColor ?? colors.Primary;
  const onTick = tickColor ?? colors.White;

  const toggle = () => {
    if (disabled) return;
    const next = !isChecked;
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={toggle}
      disabled={disabled}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <View
        style={[
          {
            width: size,
            height: size,
            borderRadius: radius,
            borderWidth: 1.5,
            borderColor: isError ? AppColors.ToastColors.Error : isChecked ? onFill : baseBorder,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: isError ? AppColors.redLight : isChecked ? onFill : 'transparent',
          },
          boxStyle,
        ]}
      >
        {isChecked && <TickIcon primary={onTick} />}
      </View>

      {label ? (
        typeof label === 'string' ? (
          <Text
            style={[
              { marginLeft: normalized(10), color: colors.Heading_Txt },
              labelStyle,
            ]}
          >
            {label}
          </Text>
        ) : (
          <View style={{ marginLeft: normalized(10) }}>{label}</View>
        )
      ) : null}
    </TouchableOpacity>
  );
};

export default CustomCheckBox;

const styles = StyleSheet.create({});
