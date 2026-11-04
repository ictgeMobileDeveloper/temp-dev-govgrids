import {Animated, Easing, StyleSheet, TouchableOpacity} from 'react-native';
import React, {useMemo, useRef, useState} from 'react';
import {normalized} from '../../Utils/AppConstants';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import BackArrowIcon from '../Svg/BackArrowIcon';
import {useNavigation} from '@react-navigation/native';
import {Routes} from '../../Utils/Routes';
import HelpIcon from '../Svg/HelpIcon';
import CloseIcon from '../Svg/CloseIcon';

const CityHelpComp = () => {
  const insects = useSafeAreaInsets();
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  const [isOpened, setIsOpened] = useState(false);
  const navigation: any = useNavigation();
  const horizontalAnim = useRef(new Animated.Value(0)).current;

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

  const onOpen = () => {
    setIsOpened(true);
    requestAnimationFrame(() => triggerSlideAnimation());
  };

  const onClose = () => {
    triggerSlideAnimation(() => setIsOpened(false));
  };

  return (
    <Animated.View
      style={[styles.cont, {transform: [{translateX: horizontalAnim}]}]}>
      {isOpened ? (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => navigation?.navigate(Routes.CityHelpScreen)}
          style={[styles.helpIconCont]}>
          <HelpIcon size={30} primary={colors.White} />
          <TouchableOpacity
            activeOpacity={1}
            onPress={onClose}
            style={styles.closeIconCont}>
            <CloseIcon
              primary={colors.Primary}
              width={25}
              height={25}
              strokeWidth={2}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          activeOpacity={1}
          onPress={onOpen}
          style={styles.arrowCont}>
          <BackArrowIcon width={25} height={25} primary={'white'} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

export default CityHelpComp;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    cont: {
      paddingVertical: normalized(8),
      paddingHorizontal: normalized(5),
      position: 'absolute',
      bottom: 20,
      right: 0,
    },
    helpIconCont: {
      width: normalized(50),
      height: normalized(50),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: normalized(100),
      padding: normalized(15),
      backgroundColor: colors.Primary,
      position: 'absolute',
      bottom: 20,
      right: 20,
    },
    arrowCont: {
      backgroundColor: colors.Primary,
      position: 'absolute',
      bottom: normalized(20),
      right: 0,
      borderTopLeftRadius: normalized(25),
      borderBottomLeftRadius: normalized(25),
      paddingVertical: normalized(6),
      paddingHorizontal: normalized(4),
    },
    closeIconCont: {
      top: -3,
      right: -3,
      position: 'absolute',
      borderRadius: normalized(25),
      backgroundColor: colors.White,
      width: normalized(18),
      height: normalized(18),
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
