import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useMemo, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {normalized, ScreenProps} from '../../Utils/AppConstants';
import CustomHeader from '../Components/CustomHeader';
import CustomInput from '../Components/CustomInput';
import {formatPhoneNumber, getErrorMessage} from '../../Utils/Helper';
import {LocationHandler} from '../Location/LocationHandler';
import LocationIcon from '../Svg/LocationIcon';
import CustomButton from '../Components/CustomButton';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../Network/Urls';
import {setShowToast} from '../../Redux/AppReducers';
import {AppStrings} from '../../Utils/AppStrings';
import {Routes} from '../../Utils/Routes';

const WalkInNewReqScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const dispatch = useDispatch();
  const MAX_LINES = 3;
  const BASE_HEIGHT = normalized(45);
  const LINE_HEIGHT = normalized(18);
  const [addressLines, setAddressLines] = useState<number>(1);

  const [account, setAccount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [accountError, setAccountError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [addressError, setAddressError] = useState('');

  const onSubmitReq = () => {
    let isFormValid = true;
    if (account == '') {
      setAccountError('...');
      isFormValid = false;
    } else {
      setAccountError('');
    }
    if (!phoneNumber.trim()) {
      setPhoneNumberError('Please enter your phone number');
      isFormValid = false;
    } else if (phoneNumber?.length < 12) {
      setPhoneNumberError('...');
      isFormValid = false;
    } else {
      setPhoneNumberError('');
    }
    if (address == '') {
      setAddressError('..');
      isFormValid = false;
    }
    const payload = {
      accountId: account,
      address: address,
      phoneNumber: phoneNumber,
    };

    if (!isFormValid) return;
    setIsLoading(true);

    apiHandler({
      endpoint: ENDPOINTS.requestQuery,
      method: 'POST',
      authContext: 'RESIDENT',
      payload,
      onComplete: (resp: any) => {
        if (resp?.status) {
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.success,
              message: 'Request Query Submitted',
            }),
          );
          setIsLoading(false);
          props?.navigation?.goBack();
        } else {
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.error,
              message: getErrorMessage(resp),
            }),
          );
          setIsLoading(false);
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
        text={'Request For Walk In Query'}
      />

      <View
        style={{
          paddingHorizontal: normalized(20),
          marginTop: normalized(12),
        }}>
        <Text style={styles.Input_Heading}>Account ID*</Text>
        <CustomInput
          placeholder={'Add Accound ID'}
          value={account}
          setValue={(val: any) => {
            setAccount(val);
            setAccountError('');
          }}
          errorMsg={accountError}
        />

        <Text style={styles.Input_Heading}>Phone Number*</Text>
        <CustomInput
          placeholder={'Add Phone Number'}
          maxLength={12}
          value={phoneNumber}
          setValue={(phone: any) => {
            setPhoneNumber(formatPhoneNumber(phone));
            setPhoneNumberError('');
          }}
          errorMsg={phoneNumberError}
        />

        <Text style={styles.Input_Heading}>Address</Text>
        <TouchableOpacity
          activeOpacity={1}
          onPress={async () => {
            props?.navigation?.navigate(Routes.MapScreen, {
              onChooseLocation: (loc: any) => {
                setAddress(loc?.address);
              },
            });
            setAddressError('');
          }}
          style={[
            styles.addressBox,
            {
              backgroundColor: addressError
                ? colors.redLight
                : colors.Background,
              borderColor: addressError ? colors.Error : colors.Grey_2,
              height:
                BASE_HEIGHT +
                Math.max(0, Math.min(addressLines, MAX_LINES) - 1) *
                  LINE_HEIGHT,
            },
          ]}>
          <Text
            style={[
              styles.Desc_Txt,
              {
                flex: 1,
                textAlign: 'left',
                color: addressError
                  ? colors.Error
                  : address
                  ? colors.Heading_Txt
                  : colors.Desc_Txt,
                lineHeight: LINE_HEIGHT,
                fontSize: normalized(14),
              },
            ]}>
            {address ? address : 'Select Address'}
          </Text>
          <LocationIcon primary={colors.Desc_Txt} />
        </TouchableOpacity>

        <View style={styles.submitBtnCont}>
          <CustomButton
            text={'Submit Query'}
            loading={isLoading}
            onPress={onSubmitReq}
          />
        </View>
      </View>
    </View>
  );
};

export default WalkInNewReqScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    submitBtnCont: {
      width: normalized(120),
      alignSelf: 'flex-end',
    },
  });
