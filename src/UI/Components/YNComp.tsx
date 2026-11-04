// src/Components/YNComp.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {normalized} from '../../Utils/AppConstants';
import TickIcon from '../Svg/TickIcon';

type Props = {
  selectedValue: string;
  options: string[];
  onSelect: (val: string) => void;
  containerStyle?: ViewStyle;
  itemStyle?: ViewStyle;
  labelStyle?: TextStyle;
  size?: number;
  isRight?: boolean;
};

const YNComp: React.FC<Props> = ({
  selectedValue,
  options,
  onSelect,
  containerStyle,
  itemStyle,
  labelStyle,
  size = normalized(18),
  isRight = false,
}) => {
  const colors = useSelector((s: AppRootStore) => s.SliceReducer.themeColors);

  return (
    <View style={[styles.row, containerStyle]}>
      {options?.map((opt, idx) => {
        const isSelected = String(selectedValue) === String(opt);
        return (
          <TouchableOpacity
            key={`${opt}-${idx}`}
            activeOpacity={0.85}
            onPress={() => {
              if (!isSelected) onSelect(opt);
            }}
            style={[
              styles.item,
              itemStyle,
              {
                flexDirection: isRight ? 'row-reverse' : 'row',
              },
            ]}
            accessibilityRole="radio"
            accessibilityState={{selected: isSelected}}>
            <View
              style={[
                styles.circle,
                {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  borderColor: isSelected ? colors.Primary : colors.Desc_Txt,
                  backgroundColor: isSelected ? colors.Primary : 'transparent',
                },
              ]}>
              {isSelected ? <TickIcon /> : null}
            </View>

            <Text
              style={[styles.label, {color: colors.Heading_Txt}, labelStyle]}>
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default YNComp;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalized(16),
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalized(8),
    paddingVertical: normalized(4),
    flex: 1,
  },
  circle: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: normalized(14),
  },
});
