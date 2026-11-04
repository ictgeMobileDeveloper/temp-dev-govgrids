import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {AppColors, AppFonts, normalized} from '../../Utils/AppConstants';

const LEGEND_ITEMS = [
  {label: 'Open', color: AppColors.ToastColors.Alarm},
  {label: 'Acknowledged', color: AppColors.Ice_Blue},
  {label: 'Closed', color: AppColors.ToastColors.Success},
  {label: 'Archived', color: AppColors.Grey_2},
];

const MapLegend = () => {
  return (
    <View style={styles.container}>
      {LEGEND_ITEMS.map(item => (
        <View key={item.label} style={styles.item}>
          <View
            style={[
              styles.dot,
              {
                backgroundColor: item.color,
                borderColor: item.color,
              },
            ]}
          />
          <Text style={styles.label}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalized(12),
    paddingVertical: normalized(8),
    backgroundColor: '#fff',
    justifyContent: 'space-evenly',
    gap: normalized(14),
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: normalized(9),
    height: normalized(9),
    borderRadius: normalized(5),
    borderWidth: 1,
    marginRight: normalized(5),
  },
  label: {
    fontFamily: AppFonts.UbuntuMedium,
    fontSize: normalized(13),
    color: '#555',
  },
});

export default MapLegend;
