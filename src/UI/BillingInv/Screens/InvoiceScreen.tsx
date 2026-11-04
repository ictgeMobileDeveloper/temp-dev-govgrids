import {
  ActivityIndicator,
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {
  AppColors,
  AppFonts,
  normalized,
  ScreenProps,
} from '../../../Utils/AppConstants';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../../Redux/AppStore';
import {AppStyles} from '../../../Utils/AppStyles';
import CustomHeader from '../../Components/CustomHeader';
import CustomButton from '../../Components/CustomButton';
import InvoiceItem from '../../Components/InvoiceItem';
import CustomInput from '../../Components/CustomInput';
import {apiHandler} from '../../../Network/Services/ApiHandler';
import {Base_Url, ENDPOINTS} from '../../../Network/Urls';
import {setShowToast} from '../../../Redux/AppReducers';
import {AppStrings, Empty_Screen_Type} from '../../../Utils/AppStrings';
import {getErrorMessage} from '../../../Utils/Helper';
import {handleFileDownload} from '../../../Utils/DownloadHelper';
import {Routes} from '../../../Utils/Routes';
import PdfModal from '../../Components/PdfModal';
import EmptyComp from '../../Components/EmptyComp';

const InvoiceScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const selector: any = useSelector(
    (state: AppRootStore) => state.SliceReducer,
  );
  const colors = selector?.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const dispatch = useDispatch();
  const [search, setSearch] = useState('');
  const [searchError, setSearchError] = useState('');
  const [searchLoader, setSearchLoader] = useState(false);
  const userData = selector?.residentUserData;
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loader, setLoader] = useState(false);
  const [list, setList] = useState<any>([]);

  const [showPdfModal, setShowPdfModal] = useState({
    isVisible: false,
    url: '',
  });
  const {code} = props.route?.params || {};
  useEffect(() => {
    getInvoices();
  }, []);

  useEffect(() => {
    getInvoices();
  }, [page]);

  const getInvoices = () => {
    page === 1 && setLoader(true);
    search?.length > 0 && setSearchLoader(true);
    apiHandler({
      endpoint: ENDPOINTS.getInvoices,
      requiresAuth: true,
      useRecaptcha: true,
      authContext: 'DAM',
      method: 'GET',
      queryParams: {
        page,
        pageSize: 10,
        query: search,
      },
      onComplete: (resp: any) => {
        console.log('RAW RESP', JSON.stringify(resp));
        console.log('CODE PARAM', code);
        if (resp?.status) {
          setLoader(false);
          setSearchLoader(false);
          setTotalItems(resp?.data?.pagination?.totalItems ?? 0);
          setTotalPages(resp?.data?.pagination?.totalPages ?? 1); // ⬅️ new

          const invoices = Array.isArray(resp?.data?.data)
            ? resp.data.data
            : [];

          console.log(invoices);
          const filteredInvoices = code
            ? invoices.filter((item: any) => item?.category?.code === code)
            : invoices;

          if (page === 1) {
            setList(filteredInvoices);
          } else {
            setList((prevList: any[]) => [
              ...prevList,
              ...filteredInvoices.filter(
                (item: any) =>
                  !prevList.some((prevItem: any) => prevItem?.id === item?.id),
              ),
            ]);
          }
        } else {
          setLoader(false);
          setSearchLoader(false);
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

  const onDownload = async (attachments: any) => {
    await handleFileDownload(attachments, userData, dispatch);
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
        text={'Invoices'}
      />

      <View style={styles.searchCont}>
        <View style={{flex: 1}}>
          <CustomInput
            placeholder="Search"
            placeholderColor={colors.Heading_Txt}
            value={search}
            setValue={setSearch}
            errorMsg={searchError}
          />
        </View>
        <View
          style={{
            width: normalized(70),
            marginBottom: normalized(3),
          }}>
          <CustomButton
            text={'Search'}
            onPress={() => {
              getInvoices();
            }}
            loading={searchLoader}
            style={{marginTop: 0, height: normalized(40)}}
          />
        </View>
      </View>

      {loader ? (
        <View style={styles.loaderCont}>
          <ActivityIndicator color={colors.Primary} size={'large'} />
        </View>
      ) : (
        <FlatList
          data={list}
          contentContainerStyle={{
            paddingHorizontal: normalized(20),
            gap: normalized(10),
          }}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({item, index}) => (
            <InvoiceItem
              onDownload={() => {
                onDownload({
                  url: item?.pdfUrl,
                  name: item?.invoiceNumber,
                  isCompleteUrl: false,
                });
              }}
              item={item}
              onPress={() =>
                props?.navigation?.navigate(
                  Routes.PoliceDuty.InvoiceDetailScreen,
                  {item: item},
                )
              }
              onView={() => {
                setShowPdfModal({
                  isVisible: true,
                  url: `${Base_Url}${item?.pdfUrl}`,
                });
              }}
            />
          )}
          ListFooterComponent={() =>
            page < totalPages ? (
              <View style={{height: normalized(40), marginTop: normalized(12)}}>
                <ActivityIndicator size="large" color={colors.Primary} />
              </View>
            ) : (
              <View style={{height: normalized(30)}} />
            )
          }
          ListEmptyComponent={() =>
            !loader ? (
              <View style={styles.loaderCont}>
                <EmptyComp
                  type={Empty_Screen_Type.List}
                  subText="No Invoices Found"
                />
              </View>
            ) : null
          }
          onEndReachedThreshold={0.2}
          onEndReached={() => {
            if (!loader && page < totalPages) {
              setPage(prev => prev + 1);
            }
          }}
        />
      )}
    </View>
  );
};

export default InvoiceScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    searchCont: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(12),
      justifyContent: 'center',
      marginTop: normalized(15),
      marginBottom: normalized(10),
      marginHorizontal: normalized(20),
    },
    loaderCont: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
