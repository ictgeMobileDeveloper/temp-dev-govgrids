import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppFonts, normalized} from '../../Utils/AppConstants';
import {ThemeHexLighten} from '../../Utils/Helper';

type Props = {
  text: string;
  onPress?: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  LeftIcon?: React.ComponentType<any>;
  accessibilityRole?: any;
  accessibilityLabel?: any;
  accessibilityHint?: any;
  style?: any;
};

const ICON_SIZE = normalized(16);

const CustomSoftButton = (props: Props) => {
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;

  const isLoading = !!props.loading;
  const isDisabled = !!props.disabled || isLoading;

  return (
    <TouchableOpacity
      accessible
      accessibilityRole={props.accessibilityRole ?? 'button'}
      accessibilityLabel={props.accessibilityLabel ?? props.text}
      accessibilityHint={props.accessibilityHint}
      accessibilityState={{disabled: isDisabled, busy: isLoading}}
      activeOpacity={0.7}
      hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
      disabled={isDisabled}
      onPress={props.onPress}
      style={[
        styles.button,
        {
          backgroundColor: ThemeHexLighten(
            colors.Primary,
            selector?.isDarkTheme,
          ),
          opacity: props.disabled ? 0.5 : 1,
        },
        props.style,
      ]}>
      {isLoading ? (
        <ActivityIndicator size="small" color={colors.Primary} />
      ) : (
        !!props.LeftIcon && (
          <props.LeftIcon
            width={ICON_SIZE}
            height={ICON_SIZE}
            color={colors.Primary}
            primary={colors.Primary}
          />
        )
      )}

      <Text numberOfLines={1} style={[styles.text, {color: colors.Primary}]}>
        {props.text}
      </Text>
    </TouchableOpacity>
  );
};

export default CustomSoftButton;

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: normalized(8),
    minHeight: normalized(36),
    paddingHorizontal: normalized(14),
    borderRadius: normalized(8),
  },
  text: {
    flexShrink: 1,
    fontFamily: AppFonts.UbuntuMedium,
    fontSize: normalized(14),
  },
});
