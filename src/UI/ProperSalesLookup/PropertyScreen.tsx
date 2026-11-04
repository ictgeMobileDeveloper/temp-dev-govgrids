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
  AppColors,
  AppFonts,
  normalized,
  ScreenProps,
  ScreenSize,
} from '../../Utils/AppConstants';
import CustomHeader from '../Components/CustomHeader';
import CustomInput from '../Components/CustomInput';
import CustomButton from '../Components/CustomButton';
import {getErrorMessage, lightenHexColor} from '../../Utils/Helper';
import HomeIcon from '../Svg/HomeIcon';
import SquareIcon from '../Svg/SquareIcon';
import BedIcon from '../Svg/BedIcon';
import BathIcon from '../Svg/BathIcon';
import CalendarIcon from '../Svg/CalendarIcon';
import {Routes} from '../../Utils/Routes';
import GarageIcon from '../Svg/GarageIcon';
import ACIcon from '../Svg/ACIcon';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../Network/Urls';
import {setShowToast} from '../../Redux/AppReducers';
import {AppStrings, Empty_Screen_Type} from '../../Utils/AppStrings';
import moment from 'moment';
import PropertyItem from '../Cards/PropertyItem';
import EmptyComp from '../Components/EmptyComp';

const PropertyScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [searchQueryError, setSearchQueryError] = useState('');
  const [list, setList] = useState<any>([]);
  const [pageSize, setPageSize] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [totalItems, setTotalItems] = useState<any>();
  const [page, setPage] = useState(1);
  const dispatch = useDispatch();
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);

  useEffect(() => {
    onSearch('', 1);
  }, []);

  const onSearch = async (queryValue = searchQuery, pageNumber = page) => {
    if (pageNumber == 1) {
      setIsLoading(true);
    } else {
      setIsPaginationLoading(true);
    }

    pageNumber == 1 && setIsLoading(true);

    apiHandler({
      endpoint: ENDPOINTS.propertySales,
      method: 'POST',
      queryParams: {page: pageNumber, pageSize: pageSize},
      payload: {query: queryValue},
      useRecaptcha: true,
      recaptchaAction: 'login',
      onComplete: (resp: any) => {
        if (resp?.status) {
          setTotalItems(resp?.data?.pagination?.totalItems);

          if (pageNumber == 1) {
            setList(resp?.data?.data?.properties || []);
          } else {
            setList((prevList: any) => [
              ...prevList,
              ...resp?.data?.data?.properties?.filter(
                (item: any) =>
                  !prevList.some((prevItem: any) => prevItem.NO == item.NO),
              ),
            ]);
          }

          setIsLoading(false);
          setIsPaginationLoading(false);
        } else {
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.error,
              message: getErrorMessage(resp),
            }),
          );
          setIsLoading(false);
          setIsPaginationLoading(false);
        }
      },
    });
  };

  useEffect(() => {
    if (page > 1) {
      onSearch(searchQuery, page);
    }
  }, [page]);

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
        text={'Property Sales Lookup'}
      />
      <View style={{paddingHorizontal: normalized(20)}}>
        <Text style={styles.trackTxt}>Search</Text>
        <View style={styles.reqCont}>
          <View style={{flex: 1}}>
            <CustomInput
              placeholder="Search Query"
              placeholderColor={colors.Heading_Txt}
              value={searchQuery}
              setValue={(val: any) => {
                setSearchQuery(val), setSearchQueryError('');
              }}
              errorMsg={searchQueryError}
            />
          </View>
          <View
            style={{
              width: normalized(65),
              marginBottom: normalized(3),
            }}>
            <CustomButton
              text={'Search'}
              onPress={() => {
                setPage(1);
                onSearch(searchQuery, 1);
              }}
              loading={false}
              style={{marginTop: 0}}
            />
          </View>
        </View>

        {list?.length > 0 && <Text style={styles.headTxt}>Properties</Text>}
        <View style={{height: normalized(10)}} />
        {isLoading ? (
          <View style={styles.loaderCont}>
            <ActivityIndicator size={'large'} color={colors.Primary} />
          </View>
        ) : (
          <FlatList
            data={list}
            contentContainerStyle={{
              marginBottom: normalized(30),
              gap: normalized(12),
            }}
            showsVerticalScrollIndicator={false}
            renderItem={({item, index}) => (
              <PropertyItem
                item={item}
                colors={colors}
                styles={styles}
                onItemPress={selected => {
                  props?.navigation?.navigate(Routes.Property.DetailScreen, {
                    item: selected,
                  });
                }}
                isDarkTheme={selector?.isDarkTheme}
              />
            )}
            ListFooterComponent={() =>
              list?.length < totalItems ? (
                <View
                  style={{height: normalized(220), marginTop: normalized(12)}}>
                  <ActivityIndicator size={'large'} color={colors.Primary} />
                </View>
              ) : (
                <View style={{height: normalized(180)}} />
              )
            }
            onEndReached={() => {
              if (list?.length < totalItems) {
                setPage(prevPage => prevPage + 1);
              }
            }}
            ListEmptyComponent={() => (
              <View style={styles.emptyCont}>
                <EmptyComp
                  type={Empty_Screen_Type.Property}
                  subText="No Properties Found"
                />
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
};

export default PropertyScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    trackTxt: {
      fontSize: normalized(14),
      color: colors.Heading_Txt,
      fontFamily: AppFonts.UbuntuRegular,
      marginTop: normalized(12),
      marginBottom: normalized(3),
    },
    reqCont: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(12),
      width: '100%',
      justifyContent: 'center',
    },
    headTxt: {
      fontSize: normalized(18),
      color: colors.Heading_Txt,
      fontFamily: AppFonts.UbuntuBold,
      marginTop: normalized(5),
    },
    itemCont: {
      width: '100%',
      borderWidth: 1,
      borderRadius: normalized(8),
      borderColor: colors.BorderColor,
      padding: normalized(12),
    },
    rowCont: {
      alignItems: 'center',
      justifyContent: 'space-between',
      flexDirection: 'row',
    },
    headCont: {
      gap: normalized(3),
      marginBottom: normalized(12),
      alignItems: 'flex-start',
    },
    priceCont: {
      height: normalized(28),
      borderRadius: normalized(28),
      backgroundColor: lightenHexColor(colors.Primary, 0.7),
      paddingHorizontal: normalized(12),
      alignItems: 'center',
      justifyContent: 'center',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(5),
    },
    priceTxt: {
      fontSize: normalized(14),
      color: colors.Primary,
      fontFamily: AppFonts.UbuntuRegular,
    },
    txt: {
      color: colors.Heading_Txt,
      fontSize: normalized(14),
      fontFamily: AppFonts.UbuntuRegular,
    },
    extraItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(3),
      paddingHorizontal: normalized(12),
      borderWidth: 1,
      borderColor: colors.Desc_Txt,
      height: normalized(22),
      borderRadius: normalized(22),
      marginTop: normalized(10),
    },
    loaderCont: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: ScreenSize.height / 1.4,
    },
    emptyCont: {
      height: ScreenSize.height * 0.7,
    },
  });
