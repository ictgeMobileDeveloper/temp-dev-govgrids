import {
  ActivityIndicator,
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
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
import CustomInput from '../Components/CustomInput';
import CustomButton from '../Components/CustomButton';
import {getErrorMessage, lightenHexColor} from '../../Utils/Helper';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../Network/Urls';
import {setShowToast} from '../../Redux/AppReducers';
import {AppStrings, Empty_Screen_Type} from '../../Utils/AppStrings';
import EmptyComp from '../Components/EmptyComp';
import WardItem from './Component/WardItem';
import YearPicker from '../Components/YearPicker';
import VoterDetailModal from './Component/VoterDetailModal';

const VoterWardScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthYear, setBirthYear] = useState<number | string>('');
  const [selectedVoter, setSelectedVoter] = useState<any>(null);
  const [lastNameError, setLastNameError] = useState('');
  const [birthYearError, setBirthYearError] = useState('');
  const [list, setList] = useState<any>([]);
  const pageSize = 30;
  const [isLoading, setIsLoading] = useState(false);
  const [totalItems, setTotalItems] = useState<any>();
  const [page, setPage] = useState(1);
  const dispatch = useDispatch();
  const [, setIsPaginationLoading] = useState(false);

  const validateSearch = () => {
    let isValid = true;
    const selectedBirthYear = String(birthYear).trim();

    if (!lastName.trim()) {
      setLastNameError('Last name is required');
      isValid = false;
    }

    if (!selectedBirthYear) {
      setBirthYearError('Birth year is required');
      isValid = false;
    } else if (!/^\d{4}$/.test(selectedBirthYear)) {
      setBirthYearError('Enter valid birth year');
      isValid = false;
    }

    return isValid;
  };

  const onSearch = useCallback(
    async (pageNumber = page) => {
      if (pageNumber === 1) {
        setIsLoading(true);
      } else {
        setIsPaginationLoading(true);
      }

      pageNumber === 1 && setIsLoading(true);

      apiHandler({
        endpoint: ENDPOINTS.voterWardSearch,
        method: 'POST',
        queryParams: {page: pageNumber, pageSize: pageSize},
        payload: {
          firstName: firstName,
          lastName: lastName,
          birthYear: String(birthYear),
        },
        useRecaptcha: true,
        recaptchaAction: 'login',
        onComplete: (resp: any) => {
          if (resp?.status) {
            console.log('Voter Ward Search Response:', resp);
            if (pageNumber === 1) {
              setList(resp?.data?.data?.voters);
            } else {
              setList((prevList: any) => [
                ...prevList,
                ...resp?.data?.data?.properties?.filter(
                  (item: any) =>
                    !prevList.some((prevItem: any) => prevItem.NO === item.NO),
                ),
              ]);
            }

            setIsLoading(false);
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
    },
    [birthYear, dispatch, firstName, lastName, page],
  );

  useEffect(() => {
    if (page > 1) {
      onSearch(page);
    }
  }, [onSearch, page]);

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
        // translucent
        // backgroundColor="transparent"
        barStyle={selector?.isDarkTheme ? 'light-content' : 'dark-content'}
      />

      <CustomHeader
        onBackPress={() => props?.navigation?.goBack()}
        text={'Voter Ward Lookup'}
      />
      <View style={{paddingHorizontal: normalized(20)}}>
        <View style={styles.formCont}>
          <Text style={styles.searchTitle}>Search Ward</Text>
          <View style={styles.searchRow}>
            <View style={styles.searchField}>
              <Text style={styles.trackTxt}>First Name</Text>
              <CustomInput
                placeholder="First Name"
                placeholderColor={colors.Heading_Txt}
                value={firstName}
                setValue={setFirstName}
              />
            </View>

            <View style={styles.searchField}>
              <Text style={styles.trackTxt}>Last Name *</Text>
              <CustomInput
                placeholder="Last Name"
                placeholderColor={colors.Heading_Txt}
                value={lastName}
                setValue={(val: any) => {
                  setLastName(val);
                  setLastNameError('');
                }}
                errorMsg={lastNameError}
              />
            </View>

            <View style={styles.searchField}>
              <Text style={styles.trackTxt}>Birth Year *</Text>

              <YearPicker
                value={birthYear}
                onChange={year => {
                  setBirthYear(year);
                  setBirthYearError('');
                }}
                startYear={1900}
                endYear={new Date().getFullYear()}
              />
              {birthYearError ? (
                <Text style={styles.errorTxt}>{birthYearError}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.buttonWrap}>
            <CustomButton
              text={'Search'}
              onPress={() => {
                if (!validateSearch()) {
                  return;
                }

                setPage(1);
                setList([]);
                onSearch(1);
              }}
              loading={false}
              style={{marginTop: 0}}
            />
          </View>
        </View>

        {list?.length > 0 && <Text style={styles.headTxt}>Ward Records</Text>}
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
            renderItem={({item}) => (
              <WardItem
                item={item}
                styles={styles}
                onItemPress={setSelectedVoter}
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
                  subText="No Wards Found"
                />
              </View>
            )}
          />
        )}
        <VoterDetailModal
          visible={!!selectedVoter}
          item={selectedVoter}
          colors={colors}
          onClose={() => setSelectedVoter(null)}
        />
      </View>
    </View>
  );
};

export default VoterWardScreen;

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
    formCont: {
      width: '100%',
      zIndex: 10,
    },
    searchTitle: {
      fontSize: normalized(16),
      color: colors.Heading_Txt,
      fontFamily: AppFonts.UbuntuRegular,
      marginTop: normalized(10),
      marginBottom: normalized(5),
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: normalized(12),
      width: '100%',
      zIndex: 20,
    },
    searchField: {
      flex: 1,
    },
    errorTxt: {
      marginTop: normalized(3),
      color: colors.ToastColors?.Error ?? colors.Error,
      fontSize: normalized(12),
      fontFamily: AppFonts.UbuntuRegular,
    },
    buttonWrap: {
      width: normalized(85),
      alignSelf: 'flex-end',
      marginTop: normalized(10),
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
