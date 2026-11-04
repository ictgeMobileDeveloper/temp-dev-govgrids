import React, {useEffect, useState} from 'react';
import {Text, useWindowDimensions, View} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useDispatch, useSelector} from 'react-redux';
import LottieView from 'lottie-react-native';
import {setShowToast} from '../../Redux/AppReducers';
import {
  Animations,
  AppColors,
  isSmallDevice,
  normalized,
  ScreenSize,
} from '../../Utils/AppConstants';
import {AppStrings} from '../../Utils/AppStrings';
import {capitalizeEachWord} from '../../Utils/Helper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const ToastComp = () => {
  const timeOfAction = 700;
  const dispatch = useDispatch();
  const selector = useSelector((AppState: any) => AppState.SliceReducer);

  const [warningLines, setWarningLines] = useState(1);

  const opacityOffset = useSharedValue(0);
  const {width: winWidth} = useWindowDimensions();
  const toastWidth = Math.min(winWidth * 0.9, 600);
  useEffect(() => {
    changeView();
    const t = setTimeout(() => {
      changeView(true);
    }, timeOfAction + 2500);
    return () => clearTimeout(t);
  }, []);

  // Reset line count when toast changes
  useEffect(() => {
    if (selector?.showToast?.type !== AppStrings.ToastType.warning) {
      setWarningLines(1);
    }
  }, [selector?.showToast]);

  const changeView = (close = false) => {
    if (close) {
      opacityOffset.value = withTiming(0, {
        duration: timeOfAction,
      });
      setTimeout(() => {
        dispatch(setShowToast({type: '', message: ''}));
      }, timeOfAction);
    } else {
      opacityOffset.value = withTiming(1, {
        duration: timeOfAction,
      });
    }
  };

  const viewStyles = useAnimatedStyle(() => {
    return {
      opacity: opacityOffset.value,
    };
  });

  const isWarning = selector?.showToast?.type === AppStrings.ToastType.warning;
  const insects = useSafeAreaInsets();

  const type = selector?.showToast?.type;
  const isSuccess = type === AppStrings.ToastType.success;
  const mainColor = isSuccess
    ? AppColors.green.dark
    : isWarning
    ? AppColors.ToastColors.Alarm
    : AppColors.ToastColors.Error;
  const bgColor = isSuccess
    ? AppColors.green.light
    : isWarning
    ? AppColors.orange.light
    : AppColors.redLight;
  const iconSize = isWarning ? normalized(50) : normalized(32);

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: insects?.bottom + 20,
        alignItems: 'center',
        zIndex: 10,
      }}>
      <Animated.View
        style={[
          {
            width: toastWidth,
            borderWidth: 1,
            borderColor: mainColor,
            backgroundColor: bgColor,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            paddingHorizontal: normalized(10),
            paddingVertical: normalized(8),
            borderRadius: 8,
            ...(isWarning && {
              height: normalized(warningLines > 1 ? 60 : 50),
            }),
          },
          viewStyles,
        ]}>
        <LottieView
          source={
            isSuccess
              ? Animations.Tick
              : isWarning
              ? Animations.Warning
              : Animations.Close
          }
          loop={false}
          autoPlay
          style={{
            width: iconSize,
            height: iconSize,
            marginRight: normalized(8),
          }}
        />

        <Text
          numberOfLines={2}
          onTextLayout={e => {
            if (isWarning) {
              setWarningLines(e.nativeEvent.lines.length);
            }
          }}
          style={{
            flex: 1,
            color: mainColor,
            fontSize: normalized(13),
            fontWeight: '400',
          }}>
          {capitalizeEachWord(selector?.showToast?.message)}
        </Text>
      </Animated.View>
    </View>
  );

  // return (
  //   <View
  //     style={{
  //       justifyContent: 'center',
  //       alignItems: 'center',
  //       zIndex: 10,
  //       width: '90%',
  //       position: 'absolute',
  //       bottom: insects?.bottom + 20,
  //       marginHorizontal: normalized(20),
  //     }}>
  //     <Animated.View
  //       style={[
  //         {
  //           borderWidth: 1,
  //           borderColor:
  //             selector?.showToast?.type === AppStrings.ToastType.success
  //               ? AppColors.green.dark
  //               : isWarning
  //               ? AppColors.ToastColors.Alarm
  //               : AppColors.ToastColors.Error,
  //           backgroundColor:
  //             selector?.showToast?.type === AppStrings.ToastType.success
  //               ? AppColors.green.light
  //               : isWarning
  //               ? AppColors.orange.light
  //               : AppColors.redLight,
  //           justifyContent: 'center',
  //           alignItems: 'center',
  //           paddingHorizontal: normalized(10),
  //           paddingVertical: normalized(8),
  //           borderRadius: 8,
  //           zIndex: 15,
  //           flexDirection: 'row',
  //           ...(isWarning && {
  //             height: normalized(warningLines > 1 ? 60 : 50),
  //           }),
  //         },
  //         viewStyles,
  //       ]}>
  //       <LottieView
  //         source={
  //           selector?.showToast?.type === AppStrings.ToastType.success
  //             ? Animations.Tick
  //             : isWarning
  //             ? Animations.Warning
  //             : Animations.Close
  //         }
  //         loop={false}
  //         autoPlay
  //         style={{
  //           width: isWarning ? normalized(50) : normalized(32),
  //           height: isWarning ? normalized(50) : normalized(32),
  //           marginRight: normalized(5),
  //         }}
  //       />

  //       <Text
  //         numberOfLines={2}
  //         onTextLayout={e => {
  //           if (isWarning) {
  //             setWarningLines(e.nativeEvent.lines.length);
  //           }
  //         }}
  //         style={{
  //           color:
  //             selector?.showToast?.type === AppStrings.ToastType.success
  //               ? AppColors.green.dark
  //               : isWarning
  //               ? AppColors.ToastColors.Alarm
  //               : AppColors.ToastColors.Error,
  //           fontSize: normalized(13),
  //           fontWeight: '400',
  //           width: ScreenSize.width - normalized(100),
  //         }}>
  //         {capitalizeEachWord(selector?.showToast?.message)}
  //       </Text>
  //     </Animated.View>
  //   </View>
  // );
};

export default ToastComp;
