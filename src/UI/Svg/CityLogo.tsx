import React, {useEffect, useMemo, useState} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  ImageStyle,
  TextStyle,
} from 'react-native';
import {useSelector} from 'react-redux';

import {AppRootStore} from '../../Redux/AppStore';
import {AppFonts, normalized} from '../../Utils/AppConstants';
import {Base_Url} from '../../Network/Urls';

type Props = {
  size?: number;
  showPlaceholder?: boolean;
  showCityName?: boolean;
  cityNameFallback?: string;
  containerStyle?: ViewStyle;
  imageStyle?: ImageStyle;
  cityNameStyle?: TextStyle;
};

const CityLogo = ({
  size = 70,
  showPlaceholder = true,
  showCityName = false,
  cityNameFallback = 'City Name',
  containerStyle,
  imageStyle,
  cityNameStyle,
}: Props) => {
  const selector: any = useSelector(
    (state: AppRootStore) => state.SliceReducer,
  );

  const colors = selector?.themeColors;
  const baseData = selector?.baseData || {};

  const [imageFailed, setImageFailed] = useState(false);

  const logoSize = normalized(size);

  const cityName = useMemo(() => {
    return baseData?.cityName || cityNameFallback;
  }, [baseData?.cityName, cityNameFallback]);

  const cityLogo = useMemo(() => {
    const logo = baseData?.localLogoPath || baseData?.logo;

    if (!logo) {
      return '';
    }

    const logoStr = String(logo);

    if (
      logoStr.startsWith('http') ||
      logoStr.startsWith('file://') ||
      logoStr.startsWith('content://')
    ) {
      return logoStr;
    }

    return `${Base_Url}${logoStr}`;
  }, [baseData?.localLogoPath, baseData?.logo]);

  useEffect(() => {
    setImageFailed(false);
  }, [cityLogo]);

  const cityInitial = useMemo(() => {
    return String(cityName).trim().charAt(0).toUpperCase() || 'G';
  }, [cityName]);

  const renderLogo = () => {
    if (cityLogo && !imageFailed) {
      return (
        <Image
          source={{uri: cityLogo}}
          resizeMode="contain"
          onError={err => {
            console.log('CityLogo image error:', err?.nativeEvent);
            setImageFailed(true);
          }}
          style={[
            styles.image,
            {
              width: logoSize,
              height: logoSize,
            },
            imageStyle,
          ]}
        />
      );
    }

    if (!showPlaceholder) {
      return null;
    }

    return (
      <View
        style={[
          styles.placeholder,
          {
            width: logoSize,
            height: logoSize,
            borderRadius: logoSize / 2,
            backgroundColor: colors?.Primary,
          },
        ]}>
        <Text
          style={[
            styles.placeholderTxt,
            {
              color: colors?.White,
              fontSize: normalized(size * 0.4),
            },
          ]}>
          {cityInitial}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {renderLogo()}

      {showCityName ? (
        <>
          <View style={{height: normalized(16)}} />

          <Text
            style={[
              styles.cityNameTxt,
              {
                color: colors?.Heading_Txt,
              },
              cityNameStyle,
            ]}
            accessibilityRole="header"
            allowFontScaling>
            {cityName}
          </Text>
        </>
      ) : null}
    </View>
  );
};

export default React.memo(CityLogo);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },

  image: {
    resizeMode: 'contain',
  },

  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  placeholderTxt: {
    fontFamily: AppFonts.UbuntuBold,
  },

  cityNameTxt: {
    fontFamily: AppFonts.UbuntuBold,
    fontSize: normalized(24),
    lineHeight: normalized(26),
    letterSpacing: normalized(0.1),
    textAlign: 'center',
    includeFontPadding: false,
  },
});
