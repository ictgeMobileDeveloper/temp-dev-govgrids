import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useMemo, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {
  AppFonts,
  CDR_STEPPER_LIST,
  normalized,
  ScreenProps,
  CDR_FORENSICS_DIVISION_LIST,
  CDREvidenceKey,
  getCDRForensicsDivisionPayload,
  CDRRecordDivisionKey,
} from '../../Utils/AppConstants';
import Stepper from '../Components/Stepper';
import CustomCheckBox from '../Components/CustomCheckBox';
import SimpleButton from '../Components/SimpleButton';
import CustomButton from '../Components/CustomButton';
import {Routes} from '../../Utils/Routes';
import {updateCdrDraft} from '../../Redux/AppReducers';

const CDRForensicScreen = (props: ScreenProps) => {
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const dispatch = useDispatch();
  const draft = selector?.cdrDraft ?? {};
  const [selected, setSelected] = useState<CDREvidenceKey[]>(
    draft.forensicsSelected ?? [],
  );

  const toggleInfoSelection = (key: CDREvidenceKey) => {
    setSelected(prev =>
      prev.includes(key) ? prev.filter(i => i !== key) : [...prev, key],
    );
  };

  const onNext = () => {
    const obj = getCDRForensicsDivisionPayload(selected);
    dispatch(
      updateCdrDraft({
        ...obj,
        forensicsSelected: selected,
      }),
    );
    props?.navigation?.navigate(Routes.CDR.EvidenceScreen, {
      data: {...obj, ...props?.route?.params?.data},
    });
  };
  return (
    <View style={styles.container}>
      <Stepper
        list={CDR_STEPPER_LIST}
        completedSteps={[
          CDR_STEPPER_LIST[0],
          CDR_STEPPER_LIST[1],
          CDR_STEPPER_LIST[2],
        ]}
        activeStep={CDR_STEPPER_LIST[3]}
      />

      <View style={{height: normalized(20)}} />

      <Text style={[styles.Input_Heading, {marginHorizontal: normalized(20)}]}>
        Digital Forensic Divison
      </Text>
      <View>
        <FlatList
          data={CDR_FORENSICS_DIVISION_LIST}
          keyExtractor={(item, index) => `${item.key}-${index}`}
          contentContainerStyle={{paddingHorizontal: normalized(20)}}
          renderItem={({item}) => {
            const isSelected = selected?.includes(item.key);

            return (
              <View style={styles.infoItem}>
                <CustomCheckBox
                  checked={isSelected}
                  onChange={() => toggleInfoSelection(item.key)}
                />
                <Text style={styles.checkboxTxt}>{item.label}</Text>
              </View>
            );
          }}
        />
      </View>
      <View style={styles.btnRow}>
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
    </View>
  );
};

export default CDRForensicScreen;

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
      marginHorizontal: normalized(20),
    },
    infoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(10),
      marginTop: normalized(5),
      flex: 1,
    },
    checkboxTxt: {
      color: colors.Heading_Txt,
      fontSize: normalized(12),
      fontFamily: AppFonts.UbuntuRegular,
    },
  });
