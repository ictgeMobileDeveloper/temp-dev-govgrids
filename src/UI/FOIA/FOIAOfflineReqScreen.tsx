import {FlatList, Platform, StatusBar, StyleSheet, View} from 'react-native';
import React, {useMemo, useState} from 'react';
import {
  AppHorizontalMargin,
  normalized,
  ScreenProps,
} from '../../Utils/AppConstants';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import CustomHeader from '../Components/CustomHeader';
import FOIACard from '../Components/FOIACard';
import {Routes} from '../../Utils/Routes';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../Network/Urls';
import {setOfflineFoiaReq, setShowToast} from '../../Redux/AppReducers';
import {getErrorMessage} from '../../Utils/Helper';
import {
  AppStrings,
  AsyncKeyStrings,
  Empty_Screen_Type,
} from '../../Utils/AppStrings';
import {setDataInAsync} from '../../Utils/AsyncStorage';
import {useReCaptcha} from '../../../App';
import EmptyComp from '../Components/EmptyComp';

const FOIAOfflineReqScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const dispatch = useDispatch();
  const colors = selector.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const listEmptyComponent = useMemo(
    () => (
      <EmptyComp type={Empty_Screen_Type.List} subText="No Request Found" />
    ),
    [],
  );
  const list = selector?.offlineFoiaRequests ?? [];
  const isOnline = selector?.isNetConnected;
  const [submitLoadingId, setSubmitLoadingId] = useState<any>(null);
  const [removeLoadingId, setRemoveLoadingId] = useState<any>(null);
  const recaptchaRef = useReCaptcha();

  const removeOfflineRequestLocally = async (item: any, index: number) => {
    const currentOfflineRequests = Array.isArray(selector?.offlineFoiaRequests)
      ? selector?.offlineFoiaRequests
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

    await setDataInAsync(AsyncKeyStrings.FoiaRequests, updatedOfflineRequests);
    dispatch(setOfflineFoiaReq(updatedOfflineRequests));
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
        message: 'Request removed locally',
        type: AppStrings.ToastType.success,
      }),
    );
  };

  const onSubmitOfflineRequest = async (item: any, index: number) => {
    if (!isOnline) {
      return;
    }

    const requestIdentifier = item?.id ?? index;
    const formData = new FormData();
    formData.append('formType', item?.formType);
    formData.append('firstName', item?.firstName);
    formData.append('middleName', item?.middleName);
    formData.append('lastName', item?.lastName);
    formData.append('email', item?.email);
    formData.append('phoneNumber', item?.phoneNumber);
    formData.append('address', item?.address);
    formData.append('addressLine2', item?.addressLine2);
    formData.append('descriptionOfRequest', item?.descriptionOfRequest);
    formData.append('organizationName', item?.organizationName);
    formData.append('paymentMethod', item?.paymentMethod ?? 'Cash');

    const attachment = item?.attachments;
    console.log('attachment----  ', attachment);

    if (attachment?.uri) {
      const rawUri = String(attachment.uri);
      const normalizedUri =
        rawUri.startsWith('file://') || rawUri.startsWith('content://')
          ? rawUri
          : `file://${rawUri}`;

      formData.append('attachments', {
        uri: normalizedUri,
        name: attachment?.name ?? `foia_attachment_${Date.now()}`,
        type: attachment?.type ?? 'application/octet-stream',
      } as any);
    }

    if (item?.formType === 'publicSafetyRequest') {
      formData.append('incidentDate', item?.incidentDate);
      formData.append('incidentTime', item?.incidentTime);
      formData.append('officeName', item?.officeName);
      formData.append('clientName', item?.clientName);
      formData.append('policeReport', String(Boolean(item?.policeReport)));
      formData.append('calls911', String(Boolean(item?.calls911)));
      formData.append('cadReport', String(Boolean(item?.cadReport)));
      formData.append('bodyWornCamera', String(Boolean(item?.bodyWornCamera)));
      formData.append('dashCamVideo', String(Boolean(item?.dashCamVideo)));
      formData.append(
        'surveillanceVideo',
        String(Boolean(item?.surveillanceVideo)),
      );
      formData.append('photographs', String(Boolean(item?.photographs)));
      formData.append('other', item?.other ?? '');
    }
    // const token = await recaptchaRef.current?.getToken('login');
    // formData.append('recaptchToken', token);
    console.log('offline formdata ----  ', formData);

    setSubmitLoadingId(requestIdentifier);

    apiHandler({
      endpoint: ENDPOINTS.foiaSubmitRequest,
      method: 'POST',
      payload: formData,
      isFormData: true,
      useRecaptcha: true,
      recaptchaAction: 'login',
      ...(selector?.residentUserData && {
        authContext: 'RESIDENT',
      }),
      onComplete: async (resp: any) => {
        console.log('offline resp ---  ', resp);

        setSubmitLoadingId(null);

        if (resp?.status) {
          if (resp?.data?.data?.otpRequired) {
            props?.navigation?.navigate(Routes.Auth.Otp, {
              isFoiaOtp: true,
              email: item?.email,
              item: item,
              index: index,
              isOfflineReq: true,
            });
            return;
          }
          await removeOfflineRequestLocally(item, index);
          dispatch(
            setShowToast({
              message: resp?.data?.message ?? 'Request submitted successfully',
              type: AppStrings.ToastType.success,
            }),
          );
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
        text={'FOIA Offline Requests'}
      />
      <FlatList<any>
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
          <FOIACard
            item={item}
            onPress={() =>
              props?.navigation?.navigate(Routes.FOIA.ReqDetailScreen, {
                data: {item, isOffline: true},
              })
            }
            showSubmitButton={isOnline}
            onSubmitPress={() => onSubmitOfflineRequest(item, index)}
            submitLoading={submitLoadingId === (item?.id ?? index)}
            showRemoveButton={true}
            onRemovePress={() => onRemoveOfflineRequest(item, index)}
            removeLoading={removeLoadingId === (item?.id ?? index)}
            removeDisabled={submitLoadingId === (item?.id ?? index)}
          />
        )}
        ListEmptyComponent={listEmptyComponent}
        onEndReachedThreshold={0.2}
      />
    </View>
  );
};

export default FOIAOfflineReqScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
  });
