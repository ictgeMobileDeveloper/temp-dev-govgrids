import {FlatList, StatusBar, StyleSheet, Text, View} from 'react-native';
import React, {useMemo, useState} from 'react';
import {
  AppHorizontalMargin,
  normalized,
  ScreenProps,
} from '../../../Utils/AppConstants';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../../Redux/AppStore';
import {AppStyles} from '../../../Utils/AppStyles';
import CustomHeader from '../../Components/CustomHeader';
import CustomButton from '../../Components/CustomButton';
import {apiHandler} from '../../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../../Network/Urls';
import {getErrorMessage} from '../../../Utils/Helper';
import {setShowToast, setofflineAutismReq} from '../../../Redux/AppReducers';
import {
  AppStrings,
  AsyncKeyStrings,
  Empty_Screen_Type,
} from '../../../Utils/AppStrings';
import {setDataInAsync} from '../../../Utils/AsyncStorage';
import EmptyComp from '../../Components/EmptyComp';
import I18n from 'i18n-js';
import en from '../../../assets/translation/en.json';
import es from '../../../assets/translation/es.json';
import ar from '../../../assets/translation/ar.json';
import it from '../../../assets/translation/it.json';
import pl from '../../../assets/translation/pl.json';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const AutismCard = ({
  item,
  onSubmitPress,
  onRemovePress,
  submitLoading,
  removeLoading,
  removeDisabled,
  isOnline,
}: any) => {
  const selector: any = useSelector(
    (state: AppRootStore) => state.SliceReducer,
  );
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  I18n.locale = selector?.language;
  I18n.fallbacks = true;
  I18n.translations = {
    en: en,
    es: es,
    ar: ar,
    it: it,
    pl: pl,
  };
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  return (
    <View style={styles.itemCont}>
      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>{I18n.t('OFFLINE_LABEL_NAME')}</Text>
          <Text style={styles.valueTxt}>
            {`${item?.firstName ?? ''} ${item?.lastName ?? ''}`.trim()}
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>{I18n.t('OFFLINE_LABEL_DOB')}</Text>
          <Text style={styles.valueTxt}>{item?.dateOfBirth ?? '-'}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>
            {I18n.t('OFFLINE_LABEL_PHONE_NUMBER')}
          </Text>
          <Text style={styles.valueTxt}>{item?.phoneNumber ?? '-'}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>{I18n.t('OFFLINE_LABEL_GUARDIANS')}</Text>
          <Text style={styles.valueTxt}>
            {Array.isArray(item?.guardians) ? item.guardians.length : 0}
          </Text>
        </View>
      </View>

      <View
        style={[styles.row, {marginTop: normalized(14), gap: normalized(12)}]}>
        <View style={{flex: 1}}>
          <CustomButton
            text={I18n.t('REMOVE')}
            onPress={onRemovePress}
            loading={removeLoading}
            disabled={removeDisabled}
          />
        </View>
        {isOnline && (
          <View style={{flex: 1}}>
            <CustomButton
              text={I18n.t('SUBMIT_REQUEST')}
              onPress={onSubmitPress}
              loading={submitLoading}
            />
          </View>
        )}
      </View>
    </View>
  );
};

const getAutismFormData = (item: any) => {
  const formData = new FormData();
  formData.append('language', item?.language ?? '');
  formData.append('firstName', item?.firstName ?? '');
  formData.append('middleName', item?.middleName ?? '');
  formData.append('lastName', item?.lastName ?? '');
  formData.append('dateOfBirth', item?.dateOfBirth ?? '');
  formData.append('age', item?.age ?? '');
  formData.append('sex', item?.sex ?? '');
  formData.append('otherSex', item?.otherSex ?? '');
  formData.append('address', item?.address ?? '');
  formData.append('race', item?.race ?? '');
  formData.append('height', item?.height ?? '');
  formData.append('heightFeet', item?.heightFeet ?? '');
  formData.append('heightInches', item?.heightInches ?? '');
  formData.append('weight', item?.weight ?? '');
  formData.append('eyeColor', item?.eyeColor ?? '');
  formData.append('hairColor', item?.hairColor ?? '');
  formData.append('phoneNumber', item?.phoneNumber ?? '');
  formData.append('wornItems', item?.wornItems ?? '');
  formData.append('identificationMarks', item?.identificationMarks ?? '');
  formData.append('communication', JSON.stringify(item?.communication ?? []));
  formData.append(
    'communicationOtherDetails',
    item?.communicationOtherDetails ?? '',
  );
  formData.append('sensitiveTo', JSON.stringify(item?.sensitiveTo ?? []));
  formData.append(
    'sensitiveToOtherDetails',
    item?.sensitiveToOtherDetails ?? '',
  );
  formData.append('dislikes', JSON.stringify(item?.dislikes ?? []));
  formData.append('dislikesOtherDetails', item?.dislikesOtherDetails ?? '');
  formData.append(
    'atypicalBehaviors',
    JSON.stringify(item?.atypicalBehaviors ?? []),
  );
  formData.append(
    'atypicalBehaviorOtherDetails',
    item?.atypicalBehaviorOtherDetails ?? '',
  );
  formData.append('medicalDiagnosis', item?.medicalDiagnosis ?? '');
  formData.append('medicalMedication', item?.medicalMedication ?? '');
  formData.append(
    'medicalServiceConnection',
    item?.medicalServiceConnection ?? '',
  );
  formData.append(
    'otherMedicalInformation',
    item?.otherMedicalInformation ?? '',
  );
  formData.append('claimingMethods', item?.claimingMethods ?? '');
  formData.append(
    'interestsAndWaysToConnect',
    item?.interestsAndWaysToConnect ?? '',
  );
  formData.append('wanderRisk', item?.wanderRisk ?? '');
  formData.append('placesTheyMayGo', item?.placesTheyMayGo ?? '');
  formData.append('otherSuggestions', item?.otherSuggestions ?? '');
  formData.append('guardians', JSON.stringify(item?.guardians ?? []));
  formData.append('fearOfK9Units', item?.fearOfK9Units ?? '');
  formData.append(
    'additionalInformationForOfficer',
    item?.additionalInformationForOfficer ?? '',
  );

  const photo = item?.photoGraph;
  if (photo?.uri) {
    const rawUri = String(photo.uri);
    const normalizedUri =
      rawUri.startsWith('file://') || rawUri.startsWith('content://')
        ? rawUri
        : `file://${rawUri}`;

    formData.append('photoGraph', {
      uri: normalizedUri,
      name: photo?.name ?? photo?.filename ?? `autism_photo_${Date.now()}.jpg`,
      type: photo?.type ?? 'image/jpeg',
    } as any);
  }

  return formData;
};

const AutismOfflineReqScreen = (props: ScreenProps) => {
  const selector: any = useSelector(
    (state: AppRootStore) => state.SliceReducer,
  );
  const dispatch = useDispatch();
  const colors = selector.themeColors;
  const isOnline = selector?.isNetConnected;
  I18n.locale = selector?.language;
  I18n.fallbacks = true;
  I18n.translations = {
    en: en,
    es: es,
    ar: ar,
    it: it,
    pl: pl,
  };
  const insects = useSafeAreaInsets();
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors, insects)}),
    [colors],
  );
  const list = selector?.offlineAutismRequests ?? [];
  const [submitLoadingId, setSubmitLoadingId] = useState<any>(null);
  const [removeLoadingId, setRemoveLoadingId] = useState<any>(null);
  const listEmptyComponent = useMemo(
    () => (
      <EmptyComp type={Empty_Screen_Type.List} subText="No Request Found" />
    ),
    [],
  );

  const removeOfflineRequestLocally = async (item: any, index: number) => {
    const currentOfflineRequests = Array.isArray(
      selector?.offlineAutismRequests,
    )
      ? selector?.offlineAutismRequests
      : [];

    const removeIndex = currentOfflineRequests.findIndex(
      (req: any, reqIndex: number) => {
        if (req?.id != null && item?.id != null) {
          return req?.id === item?.id;
        }
        return reqIndex === index;
      },
    );

    const updatedOfflineRequests =
      removeIndex >= 0
        ? [
            ...currentOfflineRequests.slice(0, removeIndex),
            ...currentOfflineRequests.slice(removeIndex + 1),
          ]
        : currentOfflineRequests;

    await setDataInAsync(
      AsyncKeyStrings.AutismRequests,
      updatedOfflineRequests,
    );
    dispatch(setofflineAutismReq(updatedOfflineRequests));
  };

  const onRemoveOfflineRequest = async (item: any, index: number) => {
    const requestIdentifier = item?.id ?? index;
    if (submitLoadingId === requestIdentifier) {
      return;
    }

    setRemoveLoadingId(requestIdentifier);
    await removeOfflineRequestLocally(item, index);
    setRemoveLoadingId(null);
    dispatch(
      setShowToast({
        message: I18n.t('REQUEST_REMOVED_LOCALLY'),
        type: AppStrings.ToastType.success,
      }),
    );
  };

  const onSubmitOfflineRequest = async (item: any, index: number) => {
    if (!isOnline) {
      dispatch(
        setShowToast({
          type: AppStrings.ToastType.warning,
          message: I18n.t('PLEASE_CONNECT_INTERNET_SUBMIT_REQUEST'),
        }),
      );
      return;
    }

    const requestIdentifier = item?.id ?? index;
    setSubmitLoadingId(requestIdentifier);

    apiHandler({
      endpoint: ENDPOINTS.submitAutismFormRequest,
      method: 'POST',
      payload: getAutismFormData(item),
      isFormData: true,
      ...(selector?.residentUserData && {authContext: 'RESIDENT'}),
      useRecaptcha: true,
      recaptchaAction: 'login',
      onComplete: async (resp: any) => {
        setSubmitLoadingId(null);

        if (resp?.status) {
          await removeOfflineRequestLocally(item, index);
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.success,
              message:
                resp?.message ?? I18n.t('REQUEST_SUBMITTED_SUCCESSFULLY'),
            }),
          );
          return;
        }

        dispatch(
          setShowToast({
            type: AppStrings.ToastType.error,
            message: getErrorMessage(resp),
          }),
        );
      },
    });
  };

  return (
    <View style={[styles.container, styles.safeArea]}>
      <StatusBar
        barStyle={selector?.isDarkTheme ? 'light-content' : 'dark-content'}
      />
      <CustomHeader
        onBackPress={() => props?.navigation?.goBack()}
        text={I18n.t('OFFLINE_REQUESTS_TITLE')}
      />

      <FlatList
        data={list}
        keyExtractor={(item, index) => item?.id ?? index.toString()}
        style={{
          marginTop: normalized(10),
          marginBottom: list?.length > 0 ? normalized(30) : 0,
        }}
        contentContainerStyle={{
          gap: normalized(12),
          paddingHorizontal: AppHorizontalMargin,
        }}
        showsVerticalScrollIndicator={false}
        renderItem={({item, index}) => (
          <AutismCard
            item={item}
            onSubmitPress={() => onSubmitOfflineRequest(item, index)}
            submitLoading={submitLoadingId === (item?.id ?? index)}
            onRemovePress={() => onRemoveOfflineRequest(item, index)}
            removeLoading={removeLoadingId === (item?.id ?? index)}
            removeDisabled={submitLoadingId === (item?.id ?? index)}
            isOnline={isOnline}
          />
        )}
        ListEmptyComponent={listEmptyComponent}
        onEndReachedThreshold={0.2}
      />
    </View>
  );
};

export default AutismOfflineReqScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    itemCont: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.BorderColor,
      borderRadius: normalized(8),
      padding: normalized(12),
      backgroundColor: colors.Card_Bg ?? 'transparent',
    },
    row: {
      flexDirection: 'row',
      gap: normalized(12),
      marginTop: normalized(8),
    },
    item: {
      flex: 1,
    },
    keyTxt: {
      fontSize: normalized(12),
      color: colors.Desc_Txt,
    },
    valueTxt: {
      fontSize: normalized(14),
      color: colors.Heading_Txt,
    },
  });
