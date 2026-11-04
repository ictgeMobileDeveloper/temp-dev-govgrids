import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import CustomButton from '../../Components/CustomButton';
import {normalized} from '../../../Utils/AppConstants';

type Props = {
  item: any;
  styles: any;
  onItemPress?: (item: any) => void;
};

const WardItem: React.FC<Props> = ({item, styles, onItemPress}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.itemCont}
      onPress={() => onItemPress?.(item)}>
      <View style={styles.rowCont}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>First Name</Text>
          <Text style={styles.valueTxt}>{item?.firstName ?? 'N/A'}</Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.keyTxt}>Middle</Text>
          <Text style={styles.valueTxt}>{item?.middle ?? 'N/A'}</Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.keyTxt}>Last Name</Text>
          <Text style={styles.valueTxt}>{item?.lastName ?? 'N/A'}</Text>
        </View>
      </View>
      <View style={styles.rowCont}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Address</Text>
          <Text style={styles.valueTxt}>
            {item?.stNo},{item?.street}, {item?.city}, {item?.state} -{' '}
            {item?.zip}
          </Text>
        </View>
      </View>

      <View style={styles.rowCont}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Suffix</Text>
          <Text style={styles.valueTxt}>
            {item?.suffix ? item.suffix : 'N/A'}
          </Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.keyTxt}>Birth Year</Text>
          <Text style={styles.valueTxt}>{item?.birthYear ?? 'N/A'}</Text>
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

export default WardItem;
