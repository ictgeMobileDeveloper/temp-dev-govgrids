import {FlatList, StatusBar, StyleSheet, Text, View} from 'react-native';
import React, {useMemo, useState} from 'react';
import {
  AppHorizontalMargin,
  normalized,
  ScreenProps,
} from '../../Utils/AppConstants';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import CustomHeader from '../Components/CustomHeader';
import CustomButton from '../Components/CustomButton';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../Network/Urls';
import {getErrorMessage} from '../../Utils/Helper';
import {
  setShowToast,
  setofflineParkingPermitReq,
} from '../../Redux/AppReducers';
import {
  AppStrings,
  AsyncKeyStrings,
  Empty_Screen_Type,
} from '../../Utils/AppStrings';
import {setDataInAsync} from '../../Utils/AsyncStorage';
import EmptyComp from '../Components/EmptyComp';
import {SafeAreaView} from 'react-native-safe-area-context';

const ParkingCard = ({
  item,
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
    <View style={styles.itemCont}>
      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Resident Name</Text>
          <Text style={styles.valueTxt}>
            {`${item?.firstName ?? ''} ${item?.lastName ?? ''}`}
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Email</Text>
          <Text style={styles.valueTxt}>{item?.email ?? '-'}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Phone Number</Text>
          <Text style={styles.valueTxt}>{item?.phoneNumber ?? '-'}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>No. of Vehicles</Text>
          <Text style={styles.valueTxt}>
            {Array.isArray(item?.vehicles) ? item.vehicles.length : 0}
          </Text>
        </View>
      </View>

      <View
        style={[styles.row, {marginTop: normalized(14), gap: normalized(12)}]}>
        <View style={{flex: 1}}>
          <CustomButton
            text={'Remove'}
            onPress={onRemovePress}
            loading={removeLoading}
            disabled={removeDisabled}
          />
        </View>
        {isOnline && (
          <View style={{flex: 1}}>
            <CustomButton
              text={'Submit Request'}
              onPress={onSubmitPress}
              loading={submitLoading}
            />
          </View>
        )}
      </View>
    </View>
  );
};

const getParkingPermitFormData = (item: any) => {
  const formData = new FormData();

  const {lat, lng} = item?.addressCoords || {};
  formData.append('firstName', item?.firstName ?? '');
  formData.append('middleName', item?.middleName ?? '');
  formData.append('lastName', item?.lastName ?? '');
  formData.append('email', item?.email ?? '');
  formData.append('phoneNumber', item?.phoneNumber ?? '');
  formData.append('address', item?.address ?? '');
  formData.append('city', item?.city ?? '');
  formData.append('state', item?.state ?? '');
  formData.append('zipCode', item?.zipCode ?? '');
  formData.append('addressCoords', JSON.stringify({lat: lat, lng: lng}));
  formData.append('termsAgreed', String(Boolean(item?.termsAgreed)));
  formData.append('deductionDate', item?.deductionDate ?? '');

  const driverLicense = item?.driverLicense;
  if (driverLicense?.uri) {
    formData.append('driverLicense', {
      uri: String(driverLicense.uri).startsWith('file://')
        ? String(driverLicense.uri)
        : `file://${driverLicense.uri}`,
      type: driverLicense?.type ?? 'image/jpeg',
      name: driverLicense?.name ?? `driver_license_${Date.now()}.jpg`,
    } as any);
  }

  if (item?.parkingSiteId != null) {
    formData.append('parkingSite', String(item.parkingSiteId));
  }

  const signature = item?.signature;
  if (signature?.uri) {
    formData.append('signature', {
      uri: String(signature.uri).startsWith('file://')
        ? String(signature.uri)
        : `file://${signature.uri}`,
      type: signature?.type ?? 'image/png',
      name: signature?.name ?? `signature_${Date.now()}.png`,
    } as any);
  }

  const keyMap = {
    model: 'vehicleModel',
    makeOf: 'makeOfVehicle',
    color: 'vehicleColor',
    license: 'licensePlate',
    state: 'garageState',
  } as const;

  (item?.vehicles ?? []).forEach((v: any, i: number) => {
    Object.entries(keyMap).forEach(([k, api]) => {
      const val = v?.[k];
      if (val != null && String(val).length) {
        formData.append(`vehicles[${i}][${api}]`, String(val));
      }
    });
    const image = v?.image;
    if (image?.uri) {
      formData.append(`vehicles[${i}][carRegistration]`, {
        uri: String(image.uri).startsWith('file://')
          ? String(image.uri)
          : `file://${image.uri}`,
        type: image?.type ?? 'image/jpeg',
        name: image?.name ?? `vehicle_registration_${Date.now()}_${i}.jpg`,
      } as any);
    }
  });

  return formData;
};

const ParkingPermitOfflineReqScreen = (props: ScreenProps) => {
  const selector: any = useSelector(
    (state: AppRootStore) => state.SliceReducer,
  );
  const dispatch = useDispatch();
  const colors = selector.themeColors;
  const isOnline = selector?.isNetConnected;

  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const list = selector?.offlineParkingPermitRequests ?? [];
  const [submitLoadingId, setSubmitLoadingId] = useState<any>(null);
  const [removeLoadingId, setRemoveLoadingId] = useState<any>(null);
  const listEmptyComponent = useMemo(
    () => (
      <EmptyComp
        type={Empty_Screen_Type.Offline_Message}
        subText="You are Offline"
      />
    ),
    [],
  );

  const removeOfflineRequestLocally = async (item: any, index: number) => {
    const currentOfflineRequests = Array.isArray(
      selector?.offlineParkingPermitRequests,
    )
      ? selector?.offlineParkingPermitRequests
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
      AsyncKeyStrings.ParkingPermitRequests,
      updatedOfflineRequests,
    );
    dispatch(setofflineParkingPermitReq(updatedOfflineRequests));
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
    setSubmitLoadingId(requestIdentifier);

    apiHandler({
      endpoint: ENDPOINTS.parkingPermit,
      method: 'POST',
      payload: getParkingPermitFormData(item),
      isFormData: true,
      authContext: 'RESIDENT',
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
    <SafeAreaView style={styles.container}>
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
          <ParkingCard
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
    </SafeAreaView>
  );
};

export default ParkingPermitOfflineReqScreen;

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
