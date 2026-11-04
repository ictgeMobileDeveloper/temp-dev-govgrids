import React, {useMemo} from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import {useSelector} from 'react-redux';

import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {normalized} from '../../Utils/AppConstants';

import CityLogo from '../Svg/CityLogo';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Config from 'react-native-config';

type Props = {
  primary?: string;
  secondary?: string;
  title?: string;
  description?: string;
};

const HeroBanner = ({
  primary = Config.PRIMARY_COLOR,
  secondary = Config.ACCENT_COLOR,
  title = 'City of Innovapolis Services',
  description = 'Easily access online services for residents and staff – from permits and requests to reports and city updates.',
}: Props) => {
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );

  const styles = useMemo(
    () => ({
      ...makeStyles(colors),
      ...AppStyles(colors),
    }),
    [colors],
  );

  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={[primary, secondary]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.gradientBase}>
      <View
        style={[
          styles.container,
          {
            paddingTop:
              Platform.OS === 'ios' ? insets.top : insets.top + normalized(15),
          },
        ]}>
        {/* Decorative circles */}
        <View style={styles.circleTop} />
        <View style={styles.circleBottom} />

        {/* Logo */}
        <View style={styles.logoContainer}>
          <CityLogo size={60} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text
            style={[styles.Heading1, {color: colors.White, textAlign: 'left'}]}>
            {title}
          </Text>

          <View style={{height: normalized(8)}} />

          <Text
            style={[
              styles.Desc_Txt_N1,
              {
                textAlign: 'left',
                color: 'rgba(255,255,255,0.92)',
              },
            ]}
            allowFontScaling>
            {description}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

export default HeroBanner;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    gradientBase: {
      width: '100%',
      borderBottomRightRadius: normalized(24),
      borderBottomLeftRadius: normalized(24),
      overflow: 'hidden', // radius clipping stays on the gradient itself
    },
    container: {
      width: '100%',
      paddingHorizontal: normalized(18),
      paddingBottom: normalized(25),
      flexDirection: 'row',
      alignItems: 'center',
    },

    logoContainer: {
      width: normalized(100),
      height: normalized(100),
      borderRadius: normalized(60),
      backgroundColor: 'rgba(255,255,255,0.65)', // 10% opacity
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: normalized(16),

      zIndex: 2,
    },

    content: {
      flex: 1,
      zIndex: 2,
    },

    circleTop: {
      position: 'absolute',
      width: normalized(170),
      height: normalized(170),
      borderRadius: normalized(85),
      backgroundColor: 'rgba(255,255,255,0.10)',
      top: -60,
      right: -55,
    },

    circleBottom: {
      position: 'absolute',
      width: normalized(130),
      height: normalized(130),
      borderRadius: normalized(110),
      backgroundColor: 'rgba(255,255,255,0.10)',
      bottom: -85,
      left: 80,
    },
  });
