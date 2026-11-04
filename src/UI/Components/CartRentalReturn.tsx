import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useMemo} from 'react';
import {useSelector} from 'react-redux';
import moment from 'moment';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {normalized} from '../../Utils/AppConstants';
import {
  capitalizeEachWord,
  formatStatus,
  getStatusColor,
} from '../../Utils/Helper';

const ReturnDamangeComp = (props: any) => {
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const item = props?.item;
  const reference = props?.reference;

  const claimTypes =
    item?.items
      ?.map((it: any) => formatStatus(it?.claimType))
      .filter(Boolean)
      .join(', ') || 'N/A';

  const paymentStatus = item?.payment?.paymentStatus ?? 'Unpaid';
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={props?.onPress}
      style={styles.itemCont}>
      <View style={styles.rowCont}>
        <Text style={styles.nameTxt}>{item?.requestId}</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Cart Request</Text>
          <Text style={styles.valueTxt}>{item?.cartRequestId}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>
            {reference === 'CartDamage' ? 'Claim Type(s)' : 'Cart'}
          </Text>
          <Text style={styles.valueTxt}>
            {reference === 'CartDamage'
              ? claimTypes
              : item?.carts
                  ?.map((c: any) => c?.serialNumber)
                  .filter(Boolean)
                  .join(', ') || 'N/A'}
          </Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Reason</Text>
          <Text style={styles.valueTxt}>{item?.reason}</Text>
        </View>
        {/* <View style={styles.item}>
          <Text style={styles.keyTxt}>Assigned Driver</Text>
          <Text style={styles.valueTxt}>{item?.assignedDriver ?? 'N/A'}</Text>
        </View> */}
      </View>

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Status</Text>
          <View
            style={[
              styles.statusCont,
              {
                backgroundColor: getStatusColor(item?.status, colors),
                alignSelf: 'flex-start',
              },
            ]}>
            <Text style={styles.statusTxt}>{formatStatus(item?.status)}</Text>
          </View>
        </View>
        {reference === 'CartDamage' && (
          <View style={styles.item}>
            <Text style={styles.keyTxt}>Payment Status</Text>
            <View
              style={[
                styles.statusCont,
                {
                  backgroundColor: getStatusColor(paymentStatus, colors),
                  alignSelf: 'flex-start',
                },
              ]}>
              <Text style={styles.statusTxt}>
                {capitalizeEachWord(paymentStatus)}
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>
            {reference === 'CartDamage' ? 'Report By' : 'Assigned at'}
          </Text>
          <Text style={styles.valueTxt}>
            {reference === 'CartDamage'
              ? item?.reviewedBy ?? 'N/A'
              : item?.assignedAt
              ? moment(item?.assignedAt).format('LL')
              : 'N/A'}
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>
            {reference === 'CartDamage' ? 'Reviewed At' : 'Return at'}
          </Text>
          <Text style={styles.valueTxt}>
            {reference === 'CartDamage'
              ? moment(item?.pickedUpAt).isValid()
                ? moment(item.pickedUpAt).format('LL')
                : 'N/A'
              : moment(item?.returnedAt).isValid()
              ? moment(item.returnedAt).format('LL')
              : 'N/A'}
          </Text>
        </View>
      </View>

      <View style={styles.item}>
        <Text style={styles.keyTxt}>Created At</Text>
        <Text style={styles.valueTxt}>
          {item?.createdAt ? moment(item?.createdAt).format('LL') : 'N/A'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ReturnDamangeComp;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    itemCont: {
      width: '100%',
      borderWidth: 1,
      borderRadius: normalized(8),
      borderColor: colors.BorderColor,
      padding: normalized(12),
      gap: normalized(8),
      marginBottom: normalized(12),
    },
  });
