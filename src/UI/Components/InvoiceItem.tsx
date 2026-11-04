import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useMemo} from 'react';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppColors, AppFonts, normalized} from '../../Utils/AppConstants';
import {AppStyles} from '../../Utils/AppStyles';
import CustomButton from './CustomButton';
import {formatAmountToUSD, getStatusColor} from '../../Utils/Helper';
import moment from 'moment';
import {capitalizeEachWord} from '../../Utils/Helper';

const InvoiceItem = ({item, onDownload, onPress, onView}: any) => {
  const selector: any = useSelector(
    (state: AppRootStore) => state.SliceReducer,
  );
  const colors = selector?.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  return (
    <TouchableOpacity
      style={styles.itemCont}
      onPress={onPress}
      activeOpacity={1}>
      <View style={styles.rowCont}>
        <Text style={styles.nameTxt}>{item?.invoiceNumber}</Text>
        <View
          style={[
            styles.statusCont,
            {
              backgroundColor: getStatusColor(item?.status, colors),
            },
          ]}>
          <Text style={styles.statusTxt}>
            {capitalizeEachWord(item?.status)}
          </Text>
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>{'Total Amount($)'}</Text>
          <Text style={styles.valueTxt}>{formatAmountToUSD(item?.total)}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>{'Due Date'}</Text>
          <Text style={styles.valueTxt}>
            {moment(item?.dueDate).format('LL')}
          </Text>
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>{'Amount Paid'}</Text>
          <Text style={styles.valueTxt}>
            {formatAmountToUSD(item?.amountPaid)}
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>{'Created At:'}</Text>
          <Text style={styles.valueTxt}>
            {moment(item?.createdAt).format('LL')}
          </Text>

          {/* <Text style={styles.keyTxt}>{'Pdf'}</Text> */}
          {/* <View style={styles.btnRow}>
            <View style={styles.viewBtn}>
              <CustomButton style={styles.btn} text={'View'} onPress={onView} />
            </View>
            <View style={styles.btnCont}>
              <CustomButton
                style={styles.btn}
                text={'Download'}
                onPress={onDownload}
              />
            </View>
          </View> */}
        </View>
      </View>
      <View style={styles.row}>
        <View
          style={[styles.item, {flexDirection: 'row', alignItems: 'center'}]}>
          <Text style={styles.keyTxt}>Balance Due</Text>

          <Text style={[styles.Heading2, {marginLeft: normalized(8)}]}>
            {formatAmountToUSD(item?.balanceDue)}
          </Text>
        </View>
      </View>
      ```
    </TouchableOpacity>
  );
};

export default InvoiceItem;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rowCont: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    itemCont: {
      width: '100%',
      borderWidth: 1,
      borderRadius: normalized(8),
      borderColor: colors.BorderColor,
      padding: normalized(12),
      gap: normalized(8),
    },
    statusCont: {
      height: normalized(24),
      paddingHorizontal: normalized(20),
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: normalized(24),
    },
    statusTxt: {
      fontSize: normalized(12),
      color: AppColors.White,
      fontFamily: AppFonts.UbuntuBold,
    },
    item: {
      flex: 1,
      gap: normalized(3),
      alignItems: 'flex-start',
    },
    btnCont: {
      width: normalized(90),
      height: normalized(28),
    },
    viewBtn: {
      width: normalized(70),
      height: normalized(28),
    },
    btn: {
      height: normalized(30),
      marginTop: 0,
    },
    btnRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(12),
    },
  });
