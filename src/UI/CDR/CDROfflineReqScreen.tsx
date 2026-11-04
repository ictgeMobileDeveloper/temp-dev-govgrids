import {FlatList, StatusBar, StyleSheet, Text, View} from 'react-native';
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
import CustomButton from '../Components/CustomButton';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../Network/Urls';
import {getErrorMessage} from '../../Utils/Helper';
import {setShowToast, setofflineCDRReq} from '../../Redux/AppReducers';
import {
  AppStrings,
  AsyncKeyStrings,
  Empty_Screen_Type,
} from '../../Utils/AppStrings';
import {setDataInAsync} from '../../Utils/AsyncStorage';
import EmptyComp from '../Components/EmptyComp';

const CDRCard = ({
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
          <Text style={styles.keyTxt}>Requester&apos;s Name</Text>
          <Text style={styles.valueTxt}>
            {`${item?.firstName ?? ''} ${item?.lastName ?? ''}`}
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Email</Text>
          <Text style={styles.valueTxt}>{item?.email}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>NBPD Case</Text>
          <Text style={styles.valueTxt}>{item?.nbpdCaseNo}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Incident Date</Text>
          <Text style={styles.valueTxt}>{item?.incidentDate}</Text>
        </View>
      </View>

      <View style={styles.item}>
        <Text style={styles.keyTxt}>Defendant Name</Text>
        <Text style={styles.valueTxt}>{item?.defendantName}</Text>
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

const CDROfflineReqScreen = (props: ScreenProps) => {
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
  const list = selector?.offlineCDRRequests ?? [];
  const [submitLoadingId, setSubmitLoadingId] = useState<any>(null);
  const [removeLoadingId, setRemoveLoadingId] = useState<any>(null);
  const listEmptyComponent = useMemo(
    () => (
      <EmptyComp type={Empty_Screen_Type.List} subText="No Request Found" />
    ),
    [],
  );

  const removeOfflineRequestLocally = async (item: any, index: number) => {
    const currentOfflineRequests = Array.isArray(selector?.offlineCDRRequests)
      ? selector?.offlineCDRRequests
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

    await setDataInAsync(AsyncKeyStrings.CdrRequests, updatedOfflineRequests);
    dispatch(setofflineCDRReq(updatedOfflineRequests));
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
      endpoint: ENDPOINTS.makeCdrReqeust,
      method: 'POST',
      payload: item,
      authContext: 'CDR',
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
          <CDRCard
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

export default CDROfflineReqScreen;

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
