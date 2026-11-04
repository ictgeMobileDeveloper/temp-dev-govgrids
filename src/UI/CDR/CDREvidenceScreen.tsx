import {StyleSheet, Text, View} from 'react-native';
import React, {useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {
  CDR_STEPPER_LIST,
  normalized,
  ScreenProps,
} from '../../Utils/AppConstants';
import CustomInput from '../Components/CustomInput';
import CustomButton from '../Components/CustomButton';
import Stepper from '../Components/Stepper';
import SimpleButton from '../Components/SimpleButton';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../Network/Urls';
import {
  clearCdrDraft,
  setIsCDRPopped,
  setShowToast,
  setofflineCDRReq,
  updateCdrDraft,
} from '../../Redux/AppReducers';
import {AppStrings, AsyncKeyStrings} from '../../Utils/AppStrings';
import {getErrorMessage} from '../../Utils/Helper';
import {setDataInAsync} from '../../Utils/AsyncStorage';

const CDREvidenceScreen = (props: ScreenProps) => {
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const dispatch = useDispatch();
  const isOnline = selector?.isNetConnected;
  const draft = selector?.cdrDraft ?? {};
  const [evidence, setEvidence] = useState(draft.otherEvidence ?? '');
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async () => {
    const obj = {
      ...(selector?.cdrDraft ?? {}),
      ...props?.route?.params?.data,
      otherEvidence: evidence,
    };

    if (!isOnline) {
      const cdrData = [obj, ...(selector?.offlineCDRRequests ?? [])];
      await setDataInAsync(AsyncKeyStrings.CdrRequests, cdrData);
      dispatch(setofflineCDRReq(cdrData));
      dispatch(
        setShowToast({
          type: AppStrings.ToastType.success,
          message: 'Request Saved.',
        }),
      );
      dispatch(setIsCDRPopped(true));
      return;
    }

    setIsLoading(true);
    apiHandler({
      endpoint: ENDPOINTS.makeCdrReqeust,
      method: 'POST',
      payload: obj,
      authContext: 'CDR',
      onComplete: (resp: any) => {
        if (resp?.status) {
          setIsLoading(false);
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.success,
              message: resp?.data?.message,
            }),
          );
          dispatch(setIsCDRPopped(true));
          dispatch(clearCdrDraft());
        } else {
          setIsLoading(false);
          dispatch(clearCdrDraft());
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
    <View style={styles.container}>
      <Stepper
        list={CDR_STEPPER_LIST}
        completedSteps={[
          CDR_STEPPER_LIST[0],
          CDR_STEPPER_LIST[1],
          CDR_STEPPER_LIST[2],
          CDR_STEPPER_LIST[3],
        ]}
        activeStep={CDR_STEPPER_LIST[4]}
        isLastItem={true}
      />

      <View
        style={{marginTop: normalized(20), paddingHorizontal: normalized(20)}}>
        <Text style={styles.Input_Heading}>Other Evidence</Text>
        <CustomInput
          placeholder={'Enter Any Other Request Evidence'}
          value={evidence}
          setValue={(val: any) => {
            setEvidence(val);
            dispatch(updateCdrDraft({otherEvidence: val}));
          }}
          isMultiLine={true}
        />

        <View style={styles.btnRow}>
          <View style={styles.nextBtnCont}>
            <SimpleButton
              text={'Back'}
              onPress={() => props?.navigation?.goBack()}
              loading={false}
            />
          </View>
          <View style={[styles.nextBtnCont, {width: normalized(130)}]}>
            <CustomButton
              text={'Submit Request'}
              onPress={onSubmit}
              loading={isLoading}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default CDREvidenceScreen;

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
