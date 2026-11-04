import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';
import {AppFonts, normalized} from '../../Utils/AppConstants';
import CloseIcon from '../Svg/CloseIcon';

type InfoItem =
  | string
  | {
      text?: string;
      buildingName?: string;
      buildingAddress?: string;
      buildingCity?: string;
      buildingState?: string;
      buildingZipcode?: string;
      parkingPermitFee?: string;
    };

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  description?: string;
  sectionTitle?: string;
  items?: InfoItem[];
  colors: any;
  topOffset?: number;
  containerStyle?: StyleProp<ViewStyle>;
};

const ExpandableInfoOverlay = ({
  visible,
  onClose,
  title,
  subtitle,
  description,
  sectionTitle,
  items = [],
  colors,
  topOffset = normalized(115),
  containerStyle,
}: Props) => {
  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(180)}
      exiting={FadeOut.duration(150)}
      style={[styles.overlay, {paddingTop: topOffset}]}>
      <TouchableOpacity
        activeOpacity={1}
        style={StyleSheet.absoluteFill}
        onPress={onClose}
      />

      <Animated.View
        entering={ZoomIn.duration(120)}
        exiting={ZoomOut.duration(100)}
        style={[
          styles.card,
          {
            backgroundColor: colors.ScreenBackground || colors.Background,
            borderColor: colors.BorderColor || colors.Grey_2,
            shadowColor: colors.Black,
          },
          containerStyle,
        ]}>
        <View style={styles.header}>
          <View style={{flex: 1}}>
            <Text style={[styles.title, {color: colors.Heading_Txt}]}>
              {title}
            </Text>

            {!!subtitle && (
              <Text style={[styles.subtitle, {color: colors.Desc_Txt}]}>
                {subtitle}
              </Text>
            )}
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onClose}
            style={[styles.closeBtn, {backgroundColor: colors.Primary}]}>
            <CloseIcon width={22} height={22} primary={'#ffff'} />
          </TouchableOpacity>
        </View>

        {!!description && (
          <Text style={[styles.description, {color: colors.Heading_Txt}]}>
            {description}
          </Text>
        )}

        {!!sectionTitle && (
          <>
            <View
              style={[
                styles.divider,
                {backgroundColor: colors.BorderColor || colors.Grey_2},
              ]}
            />

            <Text style={[styles.sectionTitle, {color: colors.Heading_Txt}]}>
              {sectionTitle}
            </Text>
          </>
        )}

        {items.map((item: any, index: number) => {
          return (
            <View style={styles.itemRow}>
              <Text style={[styles.itemTxt, {color: colors.Heading_Txt}]}>
                {item?.buildingName} - ${item?.parkingPermitFee} plus tax
              </Text>
            </View>
          );
        })}
      </Animated.View>
    </Animated.View>
  );
};

export default ExpandableInfoOverlay;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-start',
    paddingHorizontal: normalized(20),
    zIndex: 999,
  },
  card: {
    width: '100%',
    // maxHeight: normalized(360),
    borderRadius: normalized(18),
    padding: normalized(16),
    borderWidth: 1,
    shadowOpacity: 0.25,
    shadowRadius: normalized(12),
    shadowOffset: {width: 0, height: 6},
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: normalized(18),
    fontFamily: AppFonts.UbuntuBold,
  },
  subtitle: {
    marginTop: normalized(2),
    fontSize: normalized(12),
    fontFamily: AppFonts.UbuntuRegular,
  },
  closeBtn: {
    width: normalized(30),
    height: normalized(30),
    borderRadius: normalized(15),
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: normalized(12),
  },
  closeTxt: {
    fontSize: normalized(22),
    lineHeight: normalized(24),
    fontFamily: AppFonts.UbuntuBold,
  },
  description: {
    marginTop: normalized(14),
    fontSize: normalized(13),
    lineHeight: normalized(20),
    fontFamily: AppFonts.UbuntuRegular,
  },
  divider: {
    height: 1,
    marginVertical: normalized(12),
  },
  sectionTitle: {
    fontSize: normalized(15),
    fontFamily: AppFonts.UbuntuBold,
    marginBottom: normalized(8),
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalized(6),
  },
  dot: {
    width: normalized(6),
    height: normalized(6),
    borderRadius: normalized(3),
    marginRight: normalized(8),
  },
  itemTxt: {
    fontSize: normalized(12),
    lineHeight: normalized(17),
    fontFamily: AppFonts.UbuntuRegular,
    marginTop: normalized(2),
  },
});
