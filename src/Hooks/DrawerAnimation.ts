import {useRef, useState} from 'react';
import {Animated as RNAnimated, Easing} from 'react-native';
import {ScreenSize} from '../Utils/AppConstants';

export const useDrawer = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const drawerAnim = useRef(new RNAnimated.Value(ScreenSize.width)).current;

  const overlayAnim = useRef(new RNAnimated.Value(0)).current;

  const openDrawer = () => {
    setIsDrawerOpen(true);

    RNAnimated.parallel([
      RNAnimated.timing(drawerAnim, {
        toValue: 0,
        duration: 450,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),

      RNAnimated.timing(overlayAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start();
  };

  const closeDrawer = () => {
    RNAnimated.parallel([
      RNAnimated.timing(drawerAnim, {
        toValue: ScreenSize.width,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: false,
      }),

      RNAnimated.timing(overlayAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start(() => {
      setIsDrawerOpen(false);
    });
  };

  return {
    isDrawerOpen,
    drawerAnim,
    overlayAnim,
    openDrawer,
    closeDrawer,
  };
};
