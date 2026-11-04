import {useSelector} from 'react-redux';
import {AppRootStore} from '../../../Redux/AppStore';
import {useMemo} from 'react';
import {View, TouchableOpacity, Text} from 'react-native';
import {AppStyles} from '../../../Utils/AppStyles';
import moment from 'moment';
import {capitalizeEachWord, getStatusColor} from '../../../Utils/Helper';
import CustomButton from '../../Components/CustomButton';
import SimpleButton from '../../Components/SimpleButton';
import {normalized} from '../../../Utils/AppConstants';

export const CompanyListComp = ({item, OnPress, OnSubmitPress}: any) => {
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );

  const styles = useMemo(() => ({...AppStyles(colors)}), [colors]);

  return (
    <TouchableOpacity activeOpacity={1} style={styles.itemCont}>
      <View
        style={[
          styles.statusCont,
          {
            backgroundColor: getStatusColor(item?.canApply, colors),
            alignSelf: 'flex-start',
          },
        ]}>
        <Text style={styles.statusTxt}>
          {item?.canApply === true ? 'Not Applied' : 'Applied'}
        </Text>
      </View>
      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Permit Type</Text>
          <Text style={styles.valueTxt}>
            {capitalizeEachWord(item?.permitType?.type ?? 'N/A')}
          </Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.keyTxt}>Contract Period</Text>
          <Text style={styles.valueTxt}>
            {item?.contractStartDate
              ? moment(item.contractStartDate).format('MMM DD, YYYY')
              : 'N/A'}
            {' - '}
            {item?.contractEndDate
              ? moment(item.contractEndDate).format('MMM DD, YYYY')
              : 'N/A'}
          </Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Sites</Text>
          <Text style={styles.valueTxt}>
            <Text style={styles.valueTxt}>
              {item?.sites?.map((s: any) => (
                <View key={s?.id} style={{flexDirection: 'row'}}>
                  <Text style={styles.valueTxt}>{'•  '}</Text>
                  <Text style={[styles.valueTxt, {flex: 1}]}>
                    {s?.site?.buildingName}
                  </Text>
                </View>
              ))}
            </Text>
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Billing Frequency</Text>
          <Text style={styles.valueTxt}>
            {capitalizeEachWord(item?.contractBillingFrequency ?? 'N/A')}
          </Text>
        </View>
      </View>
      <View style={[styles.rowCont, {gap: normalized(5)}]}>
        {item?.canApply === true && (
          <View style={{flex: 1, minWidth: 0}}>
            <CustomButton
              text="Submit Request"
              loading={false}
              onPress={OnSubmitPress}
            />
          </View>
        )}
        <View style={{flex: 1, minWidth: 0}}>
          <SimpleButton text="View Details" loading={false} onPress={OnPress} />
        </View>
      </View>
    </TouchableOpacity>
  );
};
