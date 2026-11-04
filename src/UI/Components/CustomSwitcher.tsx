import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Easing,
  LayoutChangeEvent,
} from 'react-native';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {normalized} from '../../Utils/AppConstants';

type Item = {name: string; value?: string | number};

type Props = {
  list: Item[];
  selectedIndex: number;
  onChange: (index: number) => void;
};

const CustomSwitcher: React.FC<Props> = ({list, selectedIndex, onChange}) => {
  const colors = useSelector((s: AppRootStore) => s.SliceReducer.themeColors);
  const styles = useMemo(
    () => ({...AppStyles(colors), ...makeStyles(colors)}),
    [colors],
  );

  const [contW, setContW] = useState(0);
  const sliderX = useRef(new Animated.Value(0)).current;

  const itemCount = Math.max(1, list?.length || 1);
  const innerPadding = normalized(5);
  const innerWidth = Math.max(0, contW - innerPadding * 2);
  const itemW = itemCount > 0 ? innerWidth / itemCount : 0;

  useEffect(() => {
    const toX = itemW * selectedIndex;
    Animated.timing(sliderX, {
      toValue: isFinite(toX) ? toX : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [selectedIndex, itemW, sliderX]);

  const onLayout = (e: LayoutChangeEvent) => {
    setContW(e.nativeEvent.layout.width);
  };

  return (
    <View
      style={[
        styles.cont,
        {
          width: list?.length === 1 ? '50%' : '100%',
          alignSelf: list?.length === 1 ? 'center' : 'auto',
        },
      ]}
      onLayout={onLayout}>
      {itemW > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.slider,
            {
              width: itemW,
              transform: [{translateX: sliderX}],
            },
          ]}
        />
      )}

      {list?.map((item, index) => {
        const isActive = index === selectedIndex;
        return (
          <TouchableOpacity
            key={index}
            activeOpacity={1}
            onPress={() => onChange(index)}
            style={[styles.itemCont, {width: `${100 / itemCount}%`}]}>
            <Text
              style={[
                styles.itemText,
                {
                  color: isActive
                    ? colors.White || '#FFFFFF'
                    : colors.Heading_Txt || '#000000',
                },
              ]}>
              {item?.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default CustomSwitcher;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    cont: {
      width: '100%',
      height: normalized(40),
      backgroundColor: colors.ScreenBackground || colors.Background,
      borderWidth: 1,
      borderColor: colors.BorderColor,
      borderRadius: normalized(12),
      alignItems: 'center',
      flexDirection: 'row',
      padding: normalized(5),
      marginTop: normalized(20),
      marginBottom: normalized(10),
      overflow: 'hidden',
    },
    slider: {
      position: 'absolute',
      left: normalized(5),
      top: normalized(5),
      bottom: normalized(5),
      borderRadius: normalized(8),
      backgroundColor: colors.Primary,
    },
    itemCont: {
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    itemText: {
      fontSize: normalized(14),
      fontWeight: '600',
      color: colors.Heading_Txt,
    },
  });
