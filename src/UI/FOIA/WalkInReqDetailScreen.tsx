import {
  ActivityIndicator,
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {
  AppFonts,
  normalized,
  ScreenProps,
  ScreenSize,
} from '../../Utils/AppConstants';
import CustomHeader from '../Components/CustomHeader';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../Network/Urls';
import {capitalizeEachWord} from '../../Utils/Helper';
import moment from 'moment';

const WalkInNewReqDetailScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector?.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const dispatch = useDispatch();
  const userData = selector?.residentUserData;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState([]);
  const [isFetched, setIsFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchQueries = () => {
    setIsFetched(true);
    setIsLoading(true);
    apiHandler({
      endpoint: ENDPOINTS.requestQueries,
      method: 'GET',
      queryParams: {page: page, pageSize, query: ''},
      authContext: 'RESIDENT',
      onComplete: (resp: any) => {
        if (resp?.status) {
          setData(resp?.data?.data);
          setIsFetched(false);
          setIsLoading(false);
        } else {
          setIsFetched(false);
          setIsLoading(false);
        }
      },
    });
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.loaderCont, styles.container]}>
        <ActivityIndicator color={colors.Primary} size={'large'} />
      </View>
    );
  }
  console.log('data ---  ', data);

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
        text={'List of Walk In Requests'}
      />

      <View
        style={{
          paddingHorizontal: normalized(20),
          marginTop: normalized(12),
        }}>
        <Text style={styles.topHeading}>Submit Queries</Text>

        <FlatList
          data={data}
          contentContainerStyle={{
            marginVertical: normalized(20),
            gap: normalized(12),
          }}
          renderItem={({item, index}: any) => (
            <View style={styles.itemCont}>
              <View style={styles.rowCont}>
                <Text style={styles.srNo}>{item?.id}</Text>
                <View
                  style={[
                    styles.statusCont,
                    {
                      backgroundColor: colors.ToastColors.Alarm, // colors.Primary check
                    },
                  ]}>
                  <Text style={styles.statusTxt}>
                    {capitalizeEachWord(item?.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.contentCont}>
                <View style={styles.content}>
                  <Text style={styles.subHeadingTxt}>Resident</Text>
                  <Text
                    style={
                      styles.valueTxt
                    }>{`${item?.citizenUser?.firstName} ${item?.citizenUser?.lastName}`}</Text>
                </View>
                <View style={styles.content}>
                  <Text style={styles.subHeadingTxt}>Submission Date</Text>
                  <Text style={styles.valueTxt}>
                    {moment(item?.createdAt).format('LLL')}
                  </Text>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={() => {
            return (
              <View style={styles.loaderCont}>
                <Text style={styles.Heading2}>No Walk In Request Found!</Text>
              </View>
            );
          }}
        />
      </View>
    </View>
  );
};

export default WalkInNewReqDetailScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    itemCont: {
      width: '100%',
      borderWidth: 1,
      borderRadius: normalized(8),
      borderColor: colors.BorderColor,
      padding: normalized(12),
    },
    topHeading: {
      fontSize: normalized(18),
      color: colors.Heading_Txt,
      fontFamily: AppFonts.InterExtraBold,
    },
    rowCont: {
      alignItems: 'center',
      justifyContent: 'space-between',
      flexDirection: 'row',
    },
    statusTxt: {
      color: colors.White,
      fontFamily: AppFonts.UbuntuMedium,
      fontSize: normalized(12),
    },
    statusCont: {
      height: normalized(24),
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: normalized(12),
      borderRadius: normalized(24),
    },
    srNo: {
      fontSize: normalized(16),
      fontFamily: AppFonts.UbuntuMedium,
      color: colors.Heading_Txt,
    },
    contentCont: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    content: {
      flex: 1,
      marginTop: normalized(6),
    },
    subHeadingTxt: {
      fontFamily: AppFonts.UbuntuRegular,
      fontSize: normalized(12),
      color: colors.Desc_Txt,
    },
    valueTxt: {
      fontFamily: AppFonts.UbuntuRegular,
      fontSize: normalized(14),
      color: colors.Heading_Txt,
    },
    loaderCont: {
      flex: 1,
      height: ScreenSize.height * 0.8,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
