import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import moment from 'moment';
import {normalized} from '../../Utils/AppConstants';
import HomeIcon from '../Svg/HomeIcon';
import SquareIcon from '../Svg/SquareIcon';
import BedIcon from '../Svg/BedIcon';
import BathIcon from '../Svg/BathIcon';
import GarageIcon from '../Svg/GarageIcon';
import ACIcon from '../Svg/ACIcon';
import CalendarIcon from '../Svg/CalendarIcon';
import CustomButton from '../Components/CustomButton';

type Props = {
  item: any;
  colors: any;
  styles: any;
  onItemPress?: (item: any) => void;
  isDarkTheme: boolean;
};

const PropertyItem: React.FC<Props> = ({
  item,
  colors,
  styles,
  onItemPress,
  isDarkTheme,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.itemCont}
      onPress={() => onItemPress?.(item)}>
      <View style={styles.rowCont}>
        <View style={styles.headCont}>
          <Text style={styles.Modal_Heading_Txt}>{item?.STREET}</Text>
          <Text
            style={[
              styles.Desc_Txt_N,
              {
                color: colors.Heading_Txt,
              },
            ]}>
            Downtown
          </Text>
        </View>
        <View style={styles.priceCont}>
          <Text style={styles.priceTxt}>{`$${item['SALE PR']}`}</Text>
        </View>
      </View>

      <View style={styles.rowCont}>
        <View style={[styles.row, {gap: normalized(5)}]}>
          <HomeIcon primary={isDarkTheme ? colors.White : colors.Black} />
          <Text style={styles.txt}>{item?.YR}</Text>
        </View>
        <View style={[styles.row, {gap: normalized(5)}]}>
          <SquareIcon primary={isDarkTheme ? colors.White : colors.Black} />
          <Text style={styles.txt}>{`${item['SQ FT']} sq ft`}</Text>
        </View>
      </View>

      <View style={{height: normalized(3)}} />

      <View style={styles.rowCont}>
        <View style={[styles.row, {gap: normalized(5)}]}>
          <BedIcon primary={isDarkTheme ? colors.White : colors.Black} />
          <Text style={styles.txt}>
            {item?.BED ? `${item?.BED} bed${item?.BED > 1 ? 's' : ''}` : 'N/A'}
          </Text>
        </View>
        <View style={[styles.row, {gap: normalized(5)}]}>
          <BathIcon primary={isDarkTheme ? colors.White : colors.Black} />
          <Text style={styles.txt}>{`${item?.BATHS} baths`}</Text>
        </View>
      </View>

      <View style={[styles.row, {flexWrap: 'wrap', gap: normalized(10)}]}>
        {item?.GAR && (
          <View style={styles.extraItem}>
            <GarageIcon primary={isDarkTheme ? colors.White : colors.Black} />
            <Text style={styles.Desc_Txt_N1}>Garage</Text>
          </View>
        )}
        {item?.AC && (
          <View style={styles.extraItem}>
            <ACIcon primary={isDarkTheme ? colors.White : colors.Black} />
            <Text style={styles.Desc_Txt_N1}>AC</Text>
          </View>
        )}
      </View>

      <View style={styles.rowCont}>
        <View style={[styles.row, {gap: normalized(5)}]}>
          <CalendarIcon
            primary={isDarkTheme ? colors.White : colors.Black}
            width={12}
            height={12}
          />
          <Text style={styles.txt}>{moment(item?.DATE).format('LL')}</Text>
        </View>
        <View style={{width: normalized(110)}}>
          <CustomButton
            text={'View Details'}
            onPress={() => onItemPress?.(item)}
            loading={false}
            style={{
              marginTop: 0,
              height: normalized(24),
              borderRadius: normalized(4),
            }}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default PropertyItem;
