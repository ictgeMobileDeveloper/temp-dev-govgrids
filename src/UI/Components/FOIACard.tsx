import React, {useEffect, useMemo} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {AppColors, AppFonts, normalized} from '../../Utils/AppConstants';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {
  capitalizeEachWord,
  getStatusColor,
  getStatusFontSize,
} from '../../Utils/Helper';
import moment from 'moment';
import CustomButton from './CustomButton';

const FOIACard = ({
  item,
  onPress,
  showSubmitButton = false,
  onSubmitPress,
  submitLoading = false,
  showRemoveButton = false,
  onRemovePress,
  removeLoading = false,
  removeDisabled = false,
}: any) => {
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  return (
    <View style={styles.itemCont}>
      <TouchableOpacity activeOpacity={1} onPress={onPress}>
        <View style={[styles.rowCont, {gap: normalized(10)}]}>
          {item?.requestReference && (
            <Text style={styles.nameTxt}>{item?.requestReference}</Text>
          )}
          {/* <View style={{maxWidth: normalized(170)}}>
              <View
                style={[
                  styles.statusCont,
                  {backgroundColor: getStatusColor(item?.status, colors)},
                ]}>
                <Text style={[styles.statusTxt, {textAlign: 'center'}]}>
                  {capitalizeEachWord(
                    item?.status == 'partiallyPublished'
                      ? 'Partially Published'
                      : item?.status,
                  )}
                </Text>
              </View>
            </View> */}
        </View>

        <View style={styles.row}>
          <View style={styles.content}>
            <Text style={styles.keyTxt}>Form Type</Text>
            <Text style={styles.valueTxt}>
              {item?.formType == 'publicSafetyRequest'
                ? 'Publice Safety Request'
                : 'City Hall Request'}
            </Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.keyTxt}>Status</Text>
            <View style={{flexDirection: 'row'}}>
              <View
                style={[
                  styles.statusCont,
                  {
                    backgroundColor: item?.status
                      ? getStatusColor(item?.status, colors)
                      : AppColors.ToastColors.Alarm,
                    // alignSelf: 'flex-start'
                  },
                ]}>
                <Text
                  style={[
                    styles.statusTxt,
                    {fontSize: getStatusFontSize(item?.status)},
                  ]}>
                  {capitalizeEachWord(
                    String(item?.status ?? 'Not Submitted')
                      .replace(/([A-Z])/g, ' $1')
                      .trim(),
                  )}
                </Text>
              </View>
              <View style={{flex: 1}} />
            </View>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.content}>
            <Text style={styles.keyTxt}>Requester&apos;s Name</Text>
            <Text style={styles.valueTxt}>{`${
              item?.citizenUser?.firstName ?? item?.firstName
            } ${item?.citizenUser?.lastName ?? item?.lastName}`}</Text>
          </View>
          <View style={styles.content}>
            <Text style={styles.keyTxt}>Assign To</Text>
            <Text style={styles.valueTxt}>
              {item?.assignedTo ?? 'General Member Frontline'}
            </Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.content}>
            <Text style={styles.keyTxt}>Submission Date</Text>
            <Text style={styles.valueTxt}>
              {moment(item?.data).format('LL')}
            </Text>
          </View>
          <View style={styles.content}>
            <Text style={styles.keyTxt}>Payment Status</Text>
            <View style={{flexDirection: 'row'}}>
              <View
                style={[
                  styles.statusCont,
                  {
                    backgroundColor: getStatusColor(
                      item?.paymentStatus ?? 'Pending',
                      colors,
                    ),
                  },
                ]}>
                <Text style={styles.statusTxt}>
                  {item?.paymentStatus == 'PartiallyPaid'
                    ? 'Partially Paid'
                    : item?.paymentStatus ?? 'Pending'}
                </Text>
              </View>
              <View style={{flex: 1}} />
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {(showSubmitButton || showRemoveButton) && (
        <View style={styles.actionsRow}>
          {showRemoveButton && (
            <View style={styles.removeBtnCont}>
              <CustomButton
                text={'Remove'}
                onPress={onRemovePress}
                loading={removeLoading}
                disabled={removeDisabled}
              />
            </View>
          )}
          {showSubmitButton && (
            <View style={styles.submitBtnCont}>
              <CustomButton
                text={'Submit Request'}
                onPress={onSubmitPress}
                loading={submitLoading}
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default FOIACard;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    itemCont: {
      width: '100%',
      borderWidth: 1,
      borderRadius: normalized(8),
      borderColor: colors.BorderColor,
      padding: normalized(12),
    },
    rowCont: {
      alignItems: 'center',
      justifyContent: 'space-between',
      flexDirection: 'row',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    content: {
      flex: 1,
      marginTop: normalized(6),
      gap: normalized(4),
    },
    keyTxt: {
      fontFamily: AppFonts.UbuntuRegular,
      fontSize: normalized(12),
      color: colors.Desc_Txt,
    },
    valueTxt: {
      fontFamily: AppFonts.UbuntuRegular,
      fontSize: normalized(14),
      color: colors.Heading_Txt,
    },
    statusCont: {
      height: normalized(24),
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: normalized(20),
      borderRadius: normalized(24),
    },
    statusTxt: {
      color: colors.White,
      fontFamily: AppFonts.UbuntuMedium,
      fontSize: normalized(12),
    },
    actionsRow: {
      flexDirection: 'row',
      gap: normalized(10),
      justifyContent: 'center',
      alignSelf: 'center',
      marginTop: normalized(10),
    },
    submitBtnCont: {
      width: normalized(140),
    },
    removeBtnCont: {
      width: normalized(100),
    },
  });
