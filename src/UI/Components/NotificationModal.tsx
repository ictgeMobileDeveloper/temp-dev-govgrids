import {
  Animated,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useMemo, useRef} from 'react';
import {ScreenSize, normalized} from '../../Utils/AppConstants';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';

const NotificationModal = ({isVisible, onClose, onPress, data}: any) => {
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );

  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  const translateY = useRef(new Animated.Value(-140)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: isVisible ? 10 : -140,
      duration: 250,
      useNativeDriver: true,
    }).start();

    if (!isVisible) return;

    const timer = setTimeout(() => {
      Animated.timing(translateY, {
        toValue: -140,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        onClose?.();
      });
    }, 5000);

    return () => clearTimeout(timer);
  }, [isVisible, translateY, onClose]);

  if (!isVisible) return null;

  return (
    <>
      <StatusBar barStyle="dark-content" />

      <Pressable style={styles.touchLayer} onPress={onClose} />

      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.container,
          {
            transform: [{translateY}],
          },
        ]}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            onPress?.();
            onClose?.();
          }}
          style={styles.bar}>
          <Text style={styles.title}>
            {data?.notification?.title || 'Notification'}
          </Text>

          <Text style={styles.message}>{data?.notification?.body}</Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};

export default NotificationModal;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    touchLayer: {
      ...StyleSheet.absoluteFill,
      zIndex: 998,
      backgroundColor: 'transparent',
    },
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 999,
      elevation: 999,
    },
    bar: {
      marginTop: normalized(55),
      marginHorizontal: normalized(16),
      paddingVertical: normalized(14),
      paddingHorizontal: normalized(16),
      borderRadius: normalized(12),
      backgroundColor: colors.Background,
      borderWidth: 1,
      borderColor: colors.BorderColor,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.18,
      shadowRadius: 8,
      elevation: 5,
    },
    title: {
      fontSize: normalized(16),
      fontWeight: '700',
      color: colors.Heading_Txt,
      marginBottom: normalized(4),
    },
    message: {
      fontSize: normalized(14),
      color: colors.Desc_Txt,
    },
  });
