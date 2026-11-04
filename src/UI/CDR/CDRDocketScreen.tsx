import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useMemo, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {
  CDR_STEPPER_LIST,
  normalized,
  ScreenProps,
} from '../../Utils/AppConstants';
import Stepper from '../Components/Stepper';
import CustomDropDownList from '../Components/CustomDropDownList';
import CustomInput from '../Components/CustomInput';
import {allowOnlyNumbers} from '../../Utils/Helper';
import CustomButton from '../Components/CustomButton';
import SimpleButton from '../Components/SimpleButton';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Routes} from '../../Utils/Routes';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';

import {updateCdrDraft} from '../../Redux/AppReducers';

const CDRDocketScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const dispatch = useDispatch();
  const draft = selector?.cdrDraft ?? {};
  const [gajdIndex, setgajdIndex] = useState<any>(draft.gajdIndex ?? null);
  const [typeIndex, setTypeIndex] = useState<any>(draft.typeIndex ?? null);
  const [year, setYear] = useState(draft.docketYear ?? '');
  const [number, setNumber] = useState(draft.docketNumberValue ?? null);
  const [suffixIndex, setSuffixIndex] = useState(draft.suffixIndex ?? null);

  const [gajdError, setgajdError] = useState(false);
  const [typeError, setTypeError] = useState(false);
  const [yearError, setYearError] = useState('');
  const [numberError, setNumberError] = useState('');
  const [suffixError, setSuffixError] = useState(false);

  const GAJD_LIST = [
    'A05D',
    'A22M',
    'AAN',
    'D03D',
    'DBD',
    'F02B',
    'FBT',
    'FST',
    'H12M',
    'H13W',
    'H14C',
    'H14H',
    'H15N',
    'H17B',
    'HHB',
    'HHD',
    'K10K',
    'K21N',
    'KNL',
    'L18W',
    'LLI',
    'M09M',
    'MMX',
    'N06N',
    'N07M',
    'N08W',
    'N23N',
    'NNH',
    'S01S',
    'S20N',
    'T19R',
    'TTD',
    'U04C',
    'U04W',
    'UWY',
    'W11D',
    'WWM',
    'XBR',
    'XH',
    'XNB',
    'XNH',
    'XNO',
    'XWA',
  ];
  const TYPE_LIST = ['CR', 'MV', 'CI', 'MI'];
  const SUFFIX = [
    'S',
    'T',
    'A',
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
  ];

  const onNext = () => {
    let isValid = true;

    if (gajdIndex == null) {
      setgajdError(true);
      isValid = false;
    }

    if (typeIndex == null) {
      setTypeError(true);
      isValid = false;
    }

    if (!year || year.length !== 4) {
      setYearError('Enter a valid year.');
      isValid = false;
    }

    if (!number) {
      setNumberError('...');
      isValid = false;
    }

    if (suffixIndex == null) {
      setSuffixError(true);
      isValid = false;
    }

    if (!isValid) {
      return;
    }
    const obj = {
      ...props?.route?.params?.data,
      docketNumber: `${GAJD_LIST[gajdIndex]}-${TYPE_LIST[typeIndex]}-${year}-${number}-${SUFFIX[suffixIndex]}`,
    };

    dispatch(
      updateCdrDraft({
        ...obj,
        gajdIndex,
        typeIndex,
        docketYear: year,
        docketNumberValue: number,
        suffixIndex,
      }),
    );
    props?.navigation?.navigate(Routes.CDR.RecordDivisionScreen, {data: obj});
  };

  return (
    <View style={styles.container}>
      <Stepper
        list={CDR_STEPPER_LIST}
        completedSteps={[CDR_STEPPER_LIST[0]]}
        activeStep={CDR_STEPPER_LIST[1]}
      />

      <KeyboardAwareScrollView
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: normalized(20),
          paddingBottom: normalized(20),
        }}>
        <View style={{height: normalized(20)}} />

        <Text style={styles.Input_Heading}>GA/JD*</Text>
        <CustomDropDownList
          list={GAJD_LIST}
          selectedIndex={gajdIndex}
          onChange={i => {
            setgajdIndex(i);
            setgajdError(false);
          }}
          error={gajdError}
        />

        <Text style={styles.Input_Heading}>Type*</Text>
        <CustomDropDownList
          list={TYPE_LIST}
          selectedIndex={typeIndex}
          onChange={i => {
            setTypeIndex(i);
            setTypeError(false);
          }}
          error={typeError}
        />

        <Text style={styles.Input_Heading}>Year*</Text>

        <CustomInput
          placeholder="Enter Year"
          value={year}
          setValue={(val: any) => {
            const onlyNumbers = allowOnlyNumbers(val).slice(0, 4);
            setYear(onlyNumbers);
            setYearError('');
          }}
          keyboardType="number-pad"
          errorMsg={yearError}
        />

        <Text style={styles.Input_Heading}>Number*</Text>
        <CustomInput
          placeholder={'Enter Number'}
          value={number}
          setValue={(val: any) => {
            setNumber(allowOnlyNumbers(val));
            setNumberError('');
          }}
          keyboardType={'number-pad'}
          errorMsg={numberError}
        />

        <Text style={styles.Input_Heading}>Suffix*</Text>
        <CustomDropDownList
          list={SUFFIX}
          selectedIndex={suffixIndex}
          onChange={i => {
            setSuffixIndex(i);
            setSuffixError(false);
          }}
          error={suffixError}
        />

        <View
          style={[
            styles.btnRow,
            {
              marginBottom:
                Platform.OS === 'android'
                  ? insects.bottom + normalized(20)
                  : normalized(20),
            },
          ]}>
          <View style={styles.nextBtnCont}>
            <SimpleButton
              text={'Back'}
              onPress={() => props?.navigation?.goBack()}
              loading={false}
            />
          </View>
          <View style={styles.nextBtnCont}>
            <CustomButton text={'Next'} onPress={onNext} loading={false} />
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default CDRDocketScreen;

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
    btnRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  });
