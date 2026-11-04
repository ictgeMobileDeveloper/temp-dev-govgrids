import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {normalized, ScreenProps} from '../../Utils/AppConstants';
import CustomHeader from '../Components/CustomHeader';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {Base_Url, ENDPOINTS} from '../../Network/Urls';
import {setShowToast} from '../../Redux/AppReducers';
import {AppStrings} from '../../Utils/AppStrings';
import {getErrorMessage} from '../../Utils/Helper';
import moment from 'moment';
import AppImageViewer from '../Components/AppImageView';

const SIRReqDetailScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector?.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const [data, setData] = useState<any>(props?.route?.params?.data?.item ?? {});
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const isOnline = selector?.isNetConnected;

  useEffect(() => {
    getReportDetail();
  }, []);

  const getReportDetail = () => {
    if (!isOnline) {
      return;
    }
    setIsLoading(true);
    apiHandler({
      endpoint: `${ENDPOINTS.SIRReportDetail}${props?.route?.params?.item?.id}/`,
      method: 'GET',
      authContext: 'SIR',
      onComplete: (resp: any) => {
        if (resp?.status) {
          setData(resp?.data?.data);
          setIsLoading(false);
        } else {
          setIsLoading(false);
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
  if (isLoading) {
    return (
      <View style={styles.loaderCont}>
        <ActivityIndicator color={colors.Primary} size={'large'} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insects.top - normalized(Platform.OS == 'ios' ? 15 : 0),
          paddingBottom: Platform.OS === 'android' ? insects.bottom : 0,
        },
      ]}>
      <StatusBar
        barStyle={selector?.isDarkTheme ? 'light-content' : 'dark-content'}
      />

      <CustomHeader
        onBackPress={() => props?.navigation?.goBack()}
        text={data?.reportId ?? 'Request Detail'}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: normalized(20),
          paddingBottom: normalized(30),
        }}>
        <View style={{height: normalized(12)}} />

        <View style={styles.itemCont}>
          <Text style={styles.item_Heading}>Report Details</Text>

          <View style={styles.row}>
            <View style={styles.item}>
              <Text style={styles.keyTxt}>Name</Text>
              <Text
                style={
                  styles.valueTxt
                }>{`${data?.firstName} ${data?.lastName}`}</Text>
            </View>
            <View style={styles.item}>
              <Text style={styles.keyTxt}>Report ID</Text>
              <Text style={styles.valueTxt}>{data?.reportId ?? 'N/A'}</Text>
            </View>
          </View>

          <View style={[styles.row, {gap: normalized(12)}]}>
            <View style={styles.item}>
              <Text style={styles.keyTxt}>Email</Text>
              <Text style={styles.valueTxt}>{data?.email}</Text>
            </View>
            <View style={styles.item}>
              <Text style={styles.keyTxt}>Incident Type</Text>
              <Text style={styles.valueTxt}>{data?.incidentType}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.item}>
              <Text style={styles.keyTxt}>Plate Number</Text>
              <Text style={styles.valueTxt}>{data?.plateNumber ?? 'N/A'}</Text>
            </View>
            <View style={styles.item}>
              <Text style={styles.keyTxt}>Make Model</Text>
              <Text style={styles.valueTxt}>{data?.makeModel ?? 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.item}>
              <Text style={styles.keyTxt}>Date Reported</Text>
              <Text style={styles.valueTxt}>
                {data?.dateReported
                  ? moment(data?.dateReported).format('LL')
                  : 'N/A'}
              </Text>
            </View>
            <View style={styles.item}>
              <Text style={styles.keyTxt}>Time Reported</Text>
              <Text style={styles.valueTxt}>{data?.timeReported ?? 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.item}>
              <Text style={styles.keyTxt}>Date Occured</Text>
              <Text style={styles.valueTxt}>
                {data?.dateOccurred
                  ? moment(data?.dateOccurred).format('LL')
                  : 'N/A'}
              </Text>
            </View>
            <View style={styles.item}>
              <Text style={styles.keyTxt}>Time Occurred</Text>
              <Text style={styles.valueTxt}>{data?.timeOccurred ?? 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.item}>
              <Text style={styles.keyTxt}>Complaint</Text>
              <Text style={styles.valueTxt}>{data?.complainant}</Text>
            </View>
            <View style={styles.item}>
              <Text style={styles.keyTxt}>Responding Officer</Text>
              <Text style={styles.valueTxt}>{data?.respondingOfficer}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.item}>
              <Text style={styles.keyTxt}>Witness</Text>
              <Text style={styles.valueTxt}>{data?.witness}</Text>
            </View>
            <View style={styles.item}>
              <Text style={styles.keyTxt}>Suspect</Text>
              <Text style={styles.valueTxt}>{data?.suspect}</Text>
            </View>
          </View>

          <View style={styles.item}>
            <Text style={styles.keyTxt}>Case Details</Text>
            <Text style={styles.valueTxt}>{data?.caseDetails}</Text>
          </View>
        </View>

        <View style={{height: normalized(12)}} />

        <View style={styles.itemCont}>
          <Text style={styles.item_Heading}>Security Guard Details</Text>

          <View style={styles.item}>
            <Text style={styles.keyTxt}>Name</Text>
            <Text style={styles.valueTxt}>{`${
              data?.securityGuard?.firstName ?? data?.firstName
            } ${data?.securityGuard?.lastName ?? data?.lastName}`}</Text>
          </View>

          <View style={{height: normalized(5)}} />

          <View style={styles.item}>
            <Text style={styles.keyTxt}>Phone Number</Text>
            <Text style={styles.valueTxt}>
              {data?.securityGuard?.phoneNumber ?? data?.phoneNumber}
            </Text>
          </View>

          <View style={{height: normalized(5)}} />

          <View style={styles.item}>
            <Text style={styles.keyTxt}>Email</Text>
            <Text style={styles.valueTxt}>
              {data?.securityGuard?.email ?? data?.email}
            </Text>
          </View>
        </View>

        {/* <View style={{ height: normalized(12) }} />

                <View style={styles.itemCont} >

                    <Text style={styles.item_Heading}>Case Details</Text>

                    <View style={styles.item}>
                        <Text style={styles.keyTxt}>Case Detail</Text>
                        <Text style={styles.valueTxt}>{data?.caseDetails}</Text>
                    </View>

                </View> */}

        <View style={{height: normalized(12)}} />

        <View style={styles.itemCont}>
          <Text style={styles.item_Heading}>Security Guard Signature</Text>
          <AppImageViewer
            source={{
              uri: data?.securityGuardSignature?.uri
                ? data?.securityGuardSignature?.uri
                : `${Base_Url}${data?.securityGuardSignature}`,
            }}
            style={{
              width: '100%',
              height: normalized(150),
            }}
            resizeMode={'contain'}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default SIRReqDetailScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    loaderCont: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.Background,
    },
  });
