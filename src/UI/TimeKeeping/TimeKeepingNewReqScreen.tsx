import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Animated,
} from 'react-native';
import React, {useEffect, useMemo, useState, useRef} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {
  HOURS_LIST,
  MINUTES_LIST,
  normalized,
  ScreenProps,
} from '../../Utils/AppConstants';
import CustomHeader from '../Components/CustomHeader';
import DateTimeComp from '../Components/DateTimeComp';
import CustomDropDownList from '../Components/CustomDropDownList';
import CustomInput from '../Components/CustomInput';
import CustomButton from '../Components/CustomButton';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../Network/Urls';
import {setShowToast} from '../../Redux/AppReducers';
import {AppStrings} from '../../Utils/AppStrings';
import {getErrorMessage} from '../../Utils/Helper';
import moment from 'moment';

const TimeKeepingNewReqScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector?.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const dispatch = useDispatch();

  const [date, setDate] = useState(null);
  const [dateError, setDateError] = useState('');
  const [time, setTime] = useState(null);
  const [timeError, setTimeError] = useState('');
  const [hourIndex, setHourIndex] = useState(null);
  const [minutesIndex, setMinutesIndex] = useState(null);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [overAllLoading, setOverAllLoading] = useState(false);
  const [leaveCodes, setLeaveCodes] = useState<any>([]);
  const [leaveCodeIndex, setLeaveCodeIndex] = useState<any>(null);
  const [accrualBank, setaccrualBank] = useState([]);
  const [filterBanks, setFilterbanks] = useState<any>([]);
  const [bankIndex, setBankIndex] = useState<any>(null);
  const [leaveCodeError, setLeaveCodeError] = useState(false);
  const [bankError, setBankError] = useState(false);

  // 🔥 Animation
  const bankAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getLeaveCodes();
  }, []);

  // 🔥 Animate bank field
  useEffect(() => {
    if (filterBanks && filterBanks.length > 0) {
      Animated.timing(bankAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(bankAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [filterBanks]);

  const bankAnimatedStyle = {
    opacity: bankAnim,
    transform: [
      {
        translateY: bankAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-10, 0],
        }),
      },
    ],
  };

  const getLeaveCodes = () => {
    setOverAllLoading(true);
    apiHandler({
      endpoint: ENDPOINTS.leaveCodes,
      method: 'GET',
      authContext: 'TIMEKEEPING',
      onComplete: (resp: any) => {
        if (resp?.status) {
          setLeaveCodes(resp?.data?.data?.data);
          getAccrualBanks();
        } else {
          setOverAllLoading(false);
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.error,
              message: getErrorMessage(resp),
            }),
          );
        }
      },
    });
  };

  const getAccrualBanks = () => {
    apiHandler({
      endpoint: ENDPOINTS.getAccrualBanks,
      method: 'GET',
      queryParams: {page: 1, pageSize: 'all', query: ''},
      requiresAuth: true,
      authContext: 'TIMEKEEPING',
      onComplete: (resp: any) => {
        if (resp?.status) {
          setaccrualBank(resp?.data?.data?.accrualBanks);
        }
        setOverAllLoading(false);
      },
    });
  };

  const onSubmitReq = async () => {
    let isValid = true;

    if (!date) {
      setDateError('true');
      isValid = false;
    }
    if (!time) {
      setTimeError('true');
      isValid = false;
    }
    if (leaveCodeIndex == null) {
      setLeaveCodeError(true);
      isValid = false;
    }
    if (bankIndex == null) {
      setBankError(true);
      isValid = false;
      if (filterBanks?.length == 0 && leaveCodeIndex != null) {
        dispatch(
          setShowToast({
            type: AppStrings.ToastType.error,
            message: 'No Banks Available in Selected Leave Code.',
          }),
        );
      }
    }
    if (!reason) {
      setReasonError('..');
      isValid = false;
    }
    if (!isValid) return;

    setIsLoading(true);
    const obj = {
      accrualBankId:
        filterBanks?.length > 0 ? filterBanks[bankIndex]?.accrualBankId : null,
      leaveCodeId: leaveCodes[leaveCodeIndex]?.id,
      leaveDate: moment(date)?.format('YYYY-MM-DD'),
      reason: reason,
      startTime: moment(time)?.format('HH:mm'),
      totalHoursRequested: `${hourIndex ? HOURS_LIST[hourIndex] : '0'}h${
        minutesIndex ? MINUTES_LIST[minutesIndex] : '0'
      }m`,
    };

    apiHandler({
      endpoint: ENDPOINTS.submitLeaveReq,
      method: 'POST',
      payload: obj,
      authContext: 'TIMEKEEPING',
      useRecaptcha: true,
      recaptchaAction: 'login',
      onComplete: (resp: any) => {
        setIsLoading(false);
        if (resp?.status) {
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.success,
              message: resp?.data?.message,
            }),
          );
          props?.navigation?.goBack();
        } else {
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.error,
              message: getErrorMessage(resp),
            }),
          );
        }
      },
    });
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insects.top - normalized(Platform.OS == 'ios' ? 15 : 0),
          paddingBottom: Platform.OS == 'android' ? insects.bottom : 0,
        },
      ]}>
      <StatusBar
        barStyle={selector?.isDarkTheme ? 'light-content' : 'dark-content'}
      />

      <CustomHeader
        onBackPress={() => props?.navigation?.goBack()}
        text={'Submit Leave Requests'}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: normalized(20),
          paddingBottom: normalized(30),
        }}>
        <View style={{height: normalized(10)}} />

        <View style={styles.Input_Row}>
          <View style={{flex: 1}}>
            <Text style={styles.Input_Heading}>Leave Date*</Text>
            <DateTimeComp
              mode="date"
              dateValue={date}
              onDateChange={(val: any) => {
                setDate(val);
                setDateError('');
              }}
              minimumDate={new Date()}
              errorMsg={dateError}
            />
          </View>

          <View style={{flex: 1}}>
            <Text style={styles.Input_Heading}>Start Time*</Text>
            <DateTimeComp
              mode="time"
              timeValue={time}
              onTimeChange={(val: any) => {
                setTime(val);
                setTimeError('');
              }}
              errorMsg={timeError}
            />
          </View>
        </View>

        {/* Leave Code */}
        <Text style={styles.Input_Heading}>Leave Code ID*</Text>
        <CustomDropDownList
          list={leaveCodes?.map(o => o?.name)}
          selectedIndex={leaveCodeIndex}
          onChange={i => {
            setLeaveCodeIndex(i);
            const banks = accrualBank?.filter(
              (bank: any) => bank?.leaveCodeId === leaveCodes[i]?.id,
            );
            setBankIndex(null);
            setFilterbanks(banks ?? []);
            setLeaveCodeError(false);
            setBankError(false);
            if (banks?.length == 0) {
              dispatch(
                setShowToast({
                  type: AppStrings.ToastType.error,
                  message: 'No Banks Available in Selected Leave Code.',
                }),
              );
            }
          }}
          placeholder="Select ID"
          error={leaveCodeError}
        />

        {/* 🔥 Animated Bank Section */}
        {filterBanks && filterBanks.length > 0 && (
          <Animated.View style={bankAnimatedStyle}>
            <Text style={styles.Input_Heading}>Accrual Bank ID*</Text>
            <CustomDropDownList
              list={filterBanks?.map(o => o?.bankName)}
              selectedIndex={bankIndex}
              onChange={(i: any) => {
                setBankIndex(i);
                setBankError(false);
              }}
              placeholder="Select ID"
              error={bankError}
            />
          </Animated.View>
        )}

        {/* Requested Hours */}
        <Text style={styles.Input_Heading}>Requested Hours*</Text>
        <View style={[styles.row, {gap: normalized(10)}]}>
          <View style={{flex: 1}}>
            <CustomDropDownList
              list={HOURS_LIST}
              selectedIndex={hourIndex}
              onChange={i => setHourIndex(i)}
              placeholder="Select Hours"
              listStyle={styles.dropdown}
            />
          </View>
          <View style={{flex: 1}}>
            <CustomDropDownList
              list={MINUTES_LIST}
              selectedIndex={minutesIndex}
              onChange={i => setMinutesIndex(i)}
              placeholder="Select Minutes"
              listStyle={styles.dropdown}
            />
          </View>
        </View>

        {/* Reason */}
        <Text style={styles.Input_Heading}>Reason*</Text>
        <CustomInput
          placeholder={'Add Reason for Leave'}
          value={reason}
          setValue={(val: any) => {
            setReason(val);
            setReasonError('');
          }}
          errorMsg={reasonError}
          isMultiLine={true}
        />

        <View style={styles.submitBtnCont}>
          <CustomButton
            text={'Submit Request'}
            onPress={onSubmitReq}
            loading={isLoading}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default TimeKeepingNewReqScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    submitBtnCont: {
      width: normalized(140),
      alignSelf: 'flex-end',
    },
    dropdown: {
      position: 'absolute',
      width: '100%',
      top: normalized(45),
      zIndex: 99,
    },
  });
