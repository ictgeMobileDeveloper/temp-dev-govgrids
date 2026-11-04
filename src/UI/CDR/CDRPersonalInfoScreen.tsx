import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {
  CDR_STEPPER_LIST,
  isAndroid15Plus,
  isSmallDevice,
  normalized,
  ScreenProps,
} from '../../Utils/AppConstants';
import Stepper from '../Components/Stepper';
import CustomInput from '../Components/CustomInput';
import {
  allowOnlyString,
  formatCaseNo,
  useGradualAnimation,
} from '../../Utils/Helper';
import DateTimeComp from '../Components/DateTimeComp';
import CustomButton from '../Components/CustomButton';
import {Routes} from '../../Utils/Routes';
import moment from 'moment';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {clearCdrDraft, updateCdrDraft} from '../../Redux/AppReducers';

const CDRPersonalInfoScreen = (props: ScreenProps) => {
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const dispatch = useDispatch();
  const draft = selector?.cdrDraft ?? {};
  const userData = selector?.CDRUserData;

  const [firstName, setFirstName] = useState(userData?.firstName ?? '');
  const [middleName, setMiddleName] = useState(
    userData?.middleName ? userData?.middleName : '',
  );
  const [lastName, setLastName] = useState(userData?.lastName ?? '');
  const [email, setEmail] = useState(userData?.email ?? '');
  const [caseNo, setCaseNo] = useState(draft.nbpdCaseNo ?? '');
  const [incidentdate, setIncidentDate] = useState(
    draft.incidentDate ? new Date(draft.incidentDate) : null,
  );
  const [defendentName, setDefendentName] = useState(draft.defendantName ?? '');

  const [firstNameError, setFirstNameError] = useState('');
  const [middleNameError, setMiddleNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [caseNoError, setCaseNoError] = useState('');
  const [dateError, setDateError] = useState(false);
  const [defendentNameError, setDefendentNameError] = useState('');

  useEffect(() => {
    const unsubscribe = props.navigation.addListener('beforeRemove', e => {
      const actionType = e.data.action.type;

      if (
        actionType === 'GO_BACK' ||
        actionType === 'POP' ||
        actionType === 'POP_TO_TOP'
      ) {
        dispatch(clearCdrDraft());
      }
    });

    return unsubscribe;
  }, [props.navigation, dispatch]);

  const onNext = () => {
    let isValid = true;

    if (!caseNo) {
      setCaseNoError('...');
      isValid = false;
    }

    if (incidentdate == null) {
      setDateError(true);
      isValid = false;
    }
    if (!defendentName) {
      setDefendentNameError('...');
      isValid = false;
    }
    if (!isValid) {
      return;
    }

    const obj = {
      defendantName: defendentName,
      email: email,
      firstName: firstName,
      incidentDate: moment(incidentdate)?.format('YYYY-MM-DD'),
      lastName: lastName,
      middleName: middleName,
      nbpdCaseNo: caseNo,
    };

    dispatch(updateCdrDraft(obj));

    props?.navigation?.navigate(Routes.CDR.DocketScreen, {data: obj});
  };

  const {height} = useGradualAnimation();

  const keyboardPaddingBottom = useAnimatedStyle(() => {
    return {
      height: height.value,
    };
  }, []);

  return (
    <View style={styles.container}>
      <Stepper
        list={CDR_STEPPER_LIST}
        completedSteps={[]}
        activeStep={CDR_STEPPER_LIST[0]}
      />

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: normalized(20),
          paddingBottom: normalized(20),
        }}>
        <View style={{height: normalized(10)}} />
        <View style={styles.Input_Row}>
          <View style={{flex: 1}}>
            <Text style={styles.Input_Heading}>First Name*</Text>
            <CustomInput
              placeholder={'Enter Name'}
              value={firstName}
              isEditable={false}
              setValue={(val: any) => {
                setFirstName(allowOnlyString(val));
                setFirstNameError('');
              }}
              errorMsg={firstNameError}
            />
          </View>
          <View
            style={{
              flex: 1,
            }}>
            <Text style={styles.Input_Heading}>Middle Name</Text>
            <CustomInput
              placeholder={'Enter Name'}
              value={middleName}
              setValue={(val: any) => {
                setMiddleName(allowOnlyString(val));
                setMiddleNameError('');
              }}
              isEditable={false}
              errorMsg={middleNameError}
            />
          </View>
        </View>

        <View
          style={{
            flex: 1,
          }}>
          <Text style={styles.Input_Heading}>Last Name*</Text>
          <CustomInput
            placeholder={'Enter Name'}
            value={lastName}
            setValue={(val: any) => {
              setLastName(allowOnlyString(val));
              setLastNameError('');
            }}
            isEditable={false}
            errorMsg={lastNameError}
          />
        </View>

        <Text style={styles.Input_Heading}>Email*</Text>
        <CustomInput
          placeholder={'Enter Email'}
          value={email}
          setValue={(val: any) => {
            setEmail(val);
            setEmailError('');
          }}
          isEditable={false}
          errorMsg={emailError}
        />

        <Text style={styles.Input_Heading}>NBPD Case*</Text>
        <CustomInput
          placeholder={'Enter Case Number'}
          keyboardType="number-pad"
          value={caseNo}
          setValue={(val: any) => {
            setCaseNo(formatCaseNo(val));
            setCaseNoError('');
          }}
          errorMsg={caseNoError}
        />

        <Text style={styles.Input_Heading}>Incident Date*</Text>
        <DateTimeComp
          mode="date"
          dateValue={incidentdate}
          onDateChange={(val: any) => {
            setIncidentDate(val);
            setDateError(false);
          }}
          maximumDate={new Date()}
          // errorMsg={dateError}
        />

        <Text style={styles.Input_Heading}>Defendant Name*</Text>
        <CustomInput
          placeholder={'Enter Name'}
          value={defendentName}
          setValue={(val: any) => {
            setDefendentName(val);
            setDefendentNameError('');
          }}
          errorMsg={defendentNameError}
        />

        <View style={styles.submitBtnCont}>
          <CustomButton text={'Next'} onPress={onNext} loading={false} />
        </View>
      </KeyboardAwareScrollView>
      {isAndroid15Plus && (
        <Animated.View
          style={[keyboardPaddingBottom, {backgroundColor: 'transparent'}]}
        />
      )}
    </View>
  );
};

export default CDRPersonalInfoScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    nextBtnCont: {
      width: normalized(90),
      alignSelf: 'flex-end',
    },
    submitBtnCont: {
      width: normalized(120),
      alignSelf: 'flex-end',
    },
  });
