import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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
import moment from 'moment';
import {Routes} from '../../Utils/Routes';
import CustomButton from '../Components/CustomButton';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../Network/Urls';
import {setShowToast, setofflineSIRReq} from '../../Redux/AppReducers';
import {getErrorMessage} from '../../Utils/Helper';
import {
  AppStrings,
  AsyncKeyStrings,
  Empty_Screen_Type,
} from '../../Utils/AppStrings';
import {setDataInAsync} from '../../Utils/AsyncStorage';
import EmptyComp from '../Components/EmptyComp';

const Comp = ({
  item,
  onPress,
  onSubmitPress,
  onRemovePress,
  submitLoading,
  removeLoading,
  removeDisabled,
  isOnline,
}: any) => {
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      style={styles.itemCont}>
      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Security Guard Name</Text>
          <Text style={styles.valueTxt}>
            {`${item?.firstName} ${item?.lastName}`}
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Responding Officer</Text>
          <Text style={styles.valueTxt}>{item?.respondingOfficer}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Date Occurred</Text>
          <Text style={styles.valueTxt}>
            {moment(item?.dateOccurred).format('LL')}
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Date Reported</Text>
          <Text style={styles.valueTxt}>
            {moment(item?.dateReported).format('LL')}
          </Text>
        </View>
      </View>

      <View style={styles.item}>
        <Text style={styles.keyTxt}>Incident Type</Text>
        <Text style={styles.valueTxt}>{item?.incidentType}</Text>
      </View>

      <View style={styles.btnCont}>
        <View style={styles.removeBtnCont}>
          <CustomButton
            text={'Remove'}
            onPress={onRemovePress}
            loading={removeLoading}
            disabled={removeDisabled}
          />
        </View>

        {isOnline && (
          <View style={styles.submitBtnCont}>
            <CustomButton
              text={'Submit Request'}
              onPress={onSubmitPress}
              loading={submitLoading}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const SIROfflineReqScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const selector: any = useSelector(
    (state: AppRootStore) => state.SliceReducer,
  );
  const dispatch = useDispatch();
  const colors = selector.themeColors;
  const isOnline = selector?.isNetConnected;

  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors, insects)}),
    [colors],
  );
  const list = selector?.offlineSIRRequests ?? [];
  const [submitLoadingId, setSubmitLoadingId] = useState<any>(null);
  const [removeLoadingId, setRemoveLoadingId] = useState<any>(null);
  const listEmptyComponent = useMemo(
    () => (
      <EmptyComp type={Empty_Screen_Type.List} subText="No Request Found" />
    ),
    [],
  );

  const removeOfflineRequestLocally = async (item: any, index: number) => {
    const currentOfflineRequests = Array.isArray(selector?.offlineSIRRequests)
      ? selector?.offlineSIRRequests
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

    await setDataInAsync(AsyncKeyStrings.SirRequests, updatedOfflineRequests);
    dispatch(setofflineSIRReq(updatedOfflineRequests));
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
      dispatch(
        setShowToast({
          type: AppStrings.ToastType.warning,
          message: 'Please connect to the internet to submit this request.',
        }),
      );
      return;
    }

    const requestIdentifier = item?.id ?? index;
    const formData = new FormData();

    formData.append('firstName', item?.firstName ?? '');
    formData.append('middleName', item?.middleName ?? '');
    formData.append('lastName', item?.lastName ?? '');
    formData.append('email', item?.email ?? '');
    formData.append('phoneNumber', item?.phoneNumber ?? '');
    formData.append('address', item?.address ?? '');
    formData.append('incidentType', item?.incidentType ?? '');
    formData.append('dateReported', item?.dateReported ?? '');
    formData.append('timeReported', item?.timeReported ?? '');
    formData.append('dateOccurred', item?.dateOccurred ?? '');
    formData.append('timeOccurred', item?.timeOccurred ?? '');
    formData.append('complainant', item?.complainant ?? '');
    formData.append('respondingOfficer', item?.respondingOfficer ?? '');
    formData.append('plateNumber', item?.plateNumber ?? '');
    formData.append('makeModel', item?.makeModel ?? '');
    formData.append('witness', item?.witness ?? '');
    formData.append('suspect', item?.suspect ?? '');
    formData.append('caseDetails', item?.caseDetails ?? '');
    formData.append('otherTypeOfIncident', item?.otherTypeOfIncident ?? '');

    const signature = item?.securityGuardSignature;
    if (signature?.uri) {
      const rawUri = String(signature.uri);
      const normalizedUri =
        rawUri.startsWith('file://') || rawUri.startsWith('content://')
          ? rawUri
          : `file://${rawUri}`;

      formData.append('securityGuardSignature', {
        uri: normalizedUri,
        name: signature?.name ?? `sir_signature_${Date.now()}.png`,
        type: signature?.type ?? 'image/png',
      } as any);
    }

    setSubmitLoadingId(requestIdentifier);

    apiHandler({
      endpoint: ENDPOINTS.makeSirReport,
      method: 'POST',
      payload: formData,
      isFormData: true,
      useRecaptcha: true,
      recaptchaAction: 'login',
      authContext: 'SIR',
      onComplete: async (resp: any) => {
        setSubmitLoadingId(null);

        if (resp?.status) {
          await removeOfflineRequestLocally(item, index);
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.success,
              message: resp?.data?.message ?? 'Request submitted successfully.',
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
        text={'Offline Requests'}
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
          <Comp
            item={item}
            onPress={() =>
              props?.navigation?.navigate(Routes.SIR.ReqDetailScreen, {
                data: {item, isOffline: true},
              })
            }
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

export default SIROfflineReqScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    removeBtnCont: {
      width: normalized(120),
    },
    submitBtnCont: {
      width: normalized(200),
    },
    btnCont: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: normalized(12),
    },
  });
