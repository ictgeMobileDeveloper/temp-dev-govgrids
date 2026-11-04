import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
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
import {
  AppFonts,
  isAndroid15Plus,
  isSmallDevice,
  normalized,
  ScreenProps,
} from '../../Utils/AppConstants';
import CustomHeader from '../Components/CustomHeader';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS, PLACE_API_KEY} from '../../Network/Urls';
import RadioComp from '../Components/RadioComp';
import CustomInput from '../Components/CustomInput';
import {
  allowOnlyNumbers,
  allowOnlyString,
  getErrorMessage,
  useGradualAnimation,
} from '../../Utils/Helper';
import CustomButton from '../Components/CustomButton';
import CustomGooglePlacesInput from '../Components/CustomGooglePlacesInput';
import {
  setCityCartCategories,
  setShowToast,
  setofflineCityCartReq,
} from '../../Redux/AppReducers';
import {AppStrings, AsyncKeyStrings} from '../../Utils/AppStrings';
import CustomCheckBox from '../Components/CustomCheckBox';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {setDataInAsync} from '../../Utils/AsyncStorage';
import SimpleButton from '../Components/SimpleButton';

type CartCategory = {
  id: string | number;
  propertyType: string;
  maxCarts: number;
  txt?: string;
};

const CartRentalSubmitReq = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const baseData = selector?.baseData;
  const colors = selector?.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const dispatch = useDispatch();
  const isOnline = selector?.isNetConnected;
  const cachedCatList = selector?.cityCartCategories ?? [];

  const [catLoading, setCatLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [catList, setCatList] = useState<CartCategory[]>([]);
  const [selectedCat, setSelectedCat] = useState<CartCategory | null>(null);

  const [propertyAddress, setPropertyAddress] = useState('');
  const [propertyAddLatLng, setPropertyAddLatLng] = useState({});
  const [propertyCity, setPropertyCity] = useState('');
  const [propertyState, setPropertySate] = useState('');
  const [propertyZipCode, setPropertyZipCode] = useState('');
  const [propertyCountry, setPropertyCountry] = useState('');

  const [billingAddress, setbillingAddress] = useState('');
  const [billingCity, setbillingCity] = useState('');
  const [billingState, setbillingState] = useState('');
  const [billingZipCode, setbillingZipCode] = useState('');
  const [billingCountry, setbillingCountry] = useState('');

  const [propertyAddressError, setPropertyAddressError] = useState('');
  const [propertyCityError, setPropertyCityError] = useState('');
  const [propertyStateError, setPropertySateError] = useState('');
  const [propertyZipCodeError, setPropertyZipCodeError] = useState('');
  const [propertyCountryError, setPropertyCountryError] = useState('');

  const [billingAddressError, setbillingAddressError] = useState('');
  const [billingAddLatLng, setBillingAddLatLng] = useState({});
  const [billingCityError, setbillingCityError] = useState('');
  const [billingStateError, setbillingSateError] = useState('');
  const [billingZipCodeError, setbillingZipCodeError] = useState('');
  const [billingCountryError, setbillingCountryError] = useState('');

  const [carts, setCarts] = useState(0);
  const [cartError, setCartError] = useState('');
  const [isBillingAddressSelected, setIsBillingAddressSelected] =
    useState(false);
  const [isPropertyAddressSelected, setIsPropoertyAddressSelected] =
    useState(false);

  useEffect(() => {
    getCategoriesList();
  }, [isOnline]);

  const mapCategoryList = (list: any[] = []) =>
    list.map((item: any) => ({
      ...item,
      txt: `${item?.propertyType} (Max Carts: ${item?.maxCarts})`,
    }));

  const getCategoriesList = () => {
    if (!isOnline) {
      setCatLoading(false);
      setCatList(cachedCatList);
      setSelectedCat(cachedCatList?.[0] ?? null);
      return;
    }

    setCatLoading(true);
    apiHandler({
      endpoint: ENDPOINTS.cityCartCat,
      method: 'GET',
      authContext: 'RESIDENT',
      onComplete: (resp: any) => {
        if (resp?.status) {
          setCatLoading(false);
          const list = resp?.data?.data || [];
          const updatedList = mapCategoryList(list);
          dispatch(setCityCartCategories(updatedList));
          setDataInAsync(AsyncKeyStrings.CityCartCategories, updatedList);
          setSelectedCat(updatedList[0]);
          setCatList(updatedList);
        } else {
          setCatLoading(false);
          setCatList(cachedCatList);
          setSelectedCat(cachedCatList?.[0] ?? null);
        }
      },
    });
  };

  const onSubmit = () => {
    let isFormValid = true;
    if (carts == 0 || !carts) {
      setCartError('...');
      isFormValid = false;
    }
    if (
      !propertyAddress
      // ||
      // !propertyAddLatLng?.lat ||
      // !isPropertyAddressSelected
    ) {
      setPropertyAddressError('...');
      isFormValid = false;
    }
    if (!propertyCity) {
      setPropertyCityError('...');
      isFormValid = false;
    }
    if (!propertyState) {
      setPropertySateError('...');
      isFormValid = false;
    }
    // if (!propertyZipCode) {
    //   setPropertyZipCodeError('..');
    //   isFormValid = false;
    // }
    if (!propertyCountry) {
      setPropertyCountryError('..');
      isFormValid = false;
    }
    if (!billingAddress || !isBillingAddressSelected) {
      setbillingAddressError('...');
      isFormValid = false;
    }
    if (!billingCity && !isBillingAddressSelected) {
      setbillingCityError('..');
      isFormValid = false;
    }
    if (!billingState && !isBillingAddressSelected) {
      setbillingSateError('...');
      isFormValid = false;
    }
    // if (!billingZipCode && !isBillingAddressSelected) {
    //   setbillingZipCodeError('..');
    //   isFormValid = false;
    // }
    if (!billingCountry && !isBillingAddressSelected) {
      setbillingCountryError('..');
      isFormValid = false;
    }

    if (!isFormValid) return;

    if (!selectedCat?.id) {
      dispatch(
        setShowToast({
          type: AppStrings.ToastType.error,
          message: 'Categories are not available. Please connect to internet.',
        }),
      );
      return;
    }

    const payload = {
      categoryId: selectedCat?.id,
      quantity: carts?.toString(),
      propertyOwnerFirstName: 'Frontline',
      propertyOwnerLastName: 'Resident',
      propertyOwnerEmail: '',
      propertyOwnerPhone: '000-000-0000',
      billingAddress: billingAddress,
      billingCity: billingCity,
      billingState: billingState,
      billingZip: billingZipCode,
      billingCountry: billingCountry,
      billingCoords: billingAddLatLng,
      propertyAddress: propertyAddress,
      propertyCity: propertyCity,
      propertyState: propertyState,
      propertyZip: propertyZipCode,
      propertyCountry: propertyCountry,
      propertyCoords: propertyAddLatLng,
      source: 'mobile',
      platform: Platform.OS,
    };

    if (!isOnline) {
      const offlinePayload = {
        id: Date.now(),
        ...payload,
      };
      const cityCartData = [
        offlinePayload,
        ...(selector?.offlineCityCartRequests ?? []),
      ];
      setDataInAsync(AsyncKeyStrings.CityCartRequests, cityCartData);
      dispatch(setofflineCityCartReq(cityCartData));
      dispatch(
        setShowToast({
          type: AppStrings.ToastType.success,
          message: 'Request Saved.',
        }),
      );
      props?.navigation?.goBack();
      return;
    }

    setIsLoading(true);
    apiHandler({
      endpoint: ENDPOINTS.submitCityCartReq,
      method: 'POST',
      payload,
      authContext: 'RESIDENT',
      onComplete: (resp: any) => {
        if (resp?.status) {
          setIsLoading(false);
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.success,
              message: 'City Cart Rental Request Submitted Successfully.',
            }),
          );
          props?.navigation?.goBack();
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

  const {height} = useGradualAnimation();

  const keyboardPaddingBottom = useAnimatedStyle(() => {
    return {
      height: height.value,
    };
  }, []);

  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [isBillingUser, setIsBillingUser] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardOpen(true);
    });

    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardOpen(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const onBillingUser = () => {
    const data = selector?.residentUserData;

    console.log('USER ADDRESS DATA:', {
      address: data?.address,
      city: data?.city,
      state: data?.state,
      zipCode: data?.zipCode,
      country: data?.country,
    });

    if (isBillingUser) {
      setbillingAddress('');
      setbillingCity('');
      setbillingState('');
      setbillingZipCode('');
      setbillingCountry('');
    } else {
      setbillingAddress(data?.address);
      setbillingCity(data?.city);
      setbillingState(data?.state);
      setbillingZipCode(data?.zipCode);
      setbillingCountry(data?.country);
      setIsBillingAddressSelected(true);
    }
    setbillingAddressError('');
    setbillingCityError('');
    setbillingSateError('');
    setbillingZipCodeError('');
    setbillingCountryError('');
    setIsBillingUser(prev => !prev);
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
        text={'Submit Cart Rental Request'}
      />

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: normalized(20),
          paddingBottom: normalized(20),
        }}>
        <View style={{height: normalized(20)}} />
        <Text style={[styles.Modal_Heading_Txt, {fontSize: normalized(32)}]}>
          Categories
        </Text>

        <View style={styles.catWrapper}>
          {catLoading ? (
            <View style={styles.loaderCont}>
              <ActivityIndicator size={'small'} color={colors.Primary} />
            </View>
          ) : (
            catList?.map(item => {
              return (
                <RadioComp
                  item={item}
                  onPress={() => {
                    setSelectedCat(item);
                    setCarts(0);
                  }}
                  selected={selectedCat}
                />
              );
            })
          )}

          <Text style={styles.Input_Heading}>{`Quantity`}</Text>
          <CustomInput
            keyboardType={'number-pad'}
            placeholder={'0'}
            value={carts}
            setValue={(val: string) => {
              const quantity = Number(allowOnlyNumbers(val));

              setCarts(quantity);

              if (quantity > (selectedCat?.maxCarts ?? 0)) {
                setCartError('...');
              } else {
                setCartError('');
              }
            }}
            errorMsg={cartError}
          />
          <Text
            style={styles.Input_Heading}>{`Maximum Rental Carts Available : ${
            selectedCat?.maxCarts ?? 0
          }`}</Text>
        </View>

        <Text
          style={[
            styles.Modal_Heading_Txt,
            {fontSize: normalized(24), fontFamily: AppFonts.UbuntuBold},
          ]}>
          Property Address
        </Text>

        <Text style={styles.Input_Heading}>Property Address</Text>
        <CustomGooglePlacesInput
          apiKey={PLACE_API_KEY}
          value={propertyAddress}
          countryRestriction={baseData?.countryCode?.toLowerCase()}
          restrictToCity
          allowedCity={baseData?.city}
          country={baseData?.country}
          onChangeText={(val: any) => {
            setPropertyAddress(val);
            setPropertyAddressError('');
            setIsPropoertyAddressSelected(false);
          }}
          onPlaceSelected={async (p: any) => {
            setPropertyAddress(p?.address);

            const coord = {lat: p.lat, lng: p.lng};
            setPropertyAddLatLng(coord);
            setPropertyCity(p?.components?.city);
            setPropertySate(p?.components?.state);
            setPropertyZipCode(p?.components?.postalCode);
            setPropertyCountry(p?.components?.country);

            if (p?.components?.city) setPropertyCityError('');
            if (p?.components?.state) setPropertySateError('');
            if (p?.components?.postalCode) setPropertyZipCodeError('');
            if (p?.components?.country) setPropertyCountryError('');
            setIsPropoertyAddressSelected(true);
          }}
          onError={err => {
            dispatch(
              setShowToast({
                type: AppStrings.ToastType.warning,
                message: err?.message || 'Address search failed',
              }),
            );
          }}
          placeholder="Search Address (USA only)"
          placeholderColor={
            propertyAddressError?.length > 0 ? colors.Error : colors.Desc_Txt
          }
          debounceMs={300}
          minLength={2}
          maxResults={6}
          inputStyle={[
            styles.placesInput,
            {
              backgroundColor:
                propertyAddressError?.length > 0
                  ? colors.redLight
                  : colors.Background,
              borderColor:
                propertyAddressError?.length > 0
                  ? colors.Error
                  : colors.BorderColor,
            },
          ]}
        />

        <View style={styles.Input_Row}>
          <View style={{flex: 1}}>
            <Text style={styles.Input_Heading}>Property City</Text>
            <CustomInput
              placeholder={'Enter Property City'}
              value={propertyCity}
              setValue={(val: any) => {
                setPropertyCity(val);
                setPropertyCityError('');
              }}
              errorMsg={propertyCityError}
            />
          </View>
          <View
            style={{
              flex: 1,
            }}>
            <Text style={styles.Input_Heading}>Property State</Text>
            <CustomInput
              placeholder={'Enter Property State'}
              value={propertyState}
              setValue={(val: any) => {
                setPropertySate(allowOnlyString(val));
                setPropertySateError('');
              }}
              errorMsg={propertyStateError}
            />
          </View>
        </View>

        <View style={styles.Input_Row}>
          <View style={{flex: 1}}>
            <Text style={styles.Input_Heading}>Property Zip Code</Text>
            <CustomInput
              placeholder={'Enter Zip Code'}
              value={propertyZipCode}
              setValue={(val: any) => {
                setPropertyZipCode(val);
                setPropertyZipCodeError('');
              }}
              errorMsg={propertyZipCodeError}
            />
          </View>
          <View
            style={{
              flex: 1,
            }}>
            <Text style={styles.Input_Heading}>Property Country</Text>
            <CustomInput
              placeholder={'Enter Property Country'}
              value={propertyCountry}
              setValue={(val: any) => {
                setPropertyCountry(allowOnlyString(val));
                setPropertyCountryError('');
              }}
              errorMsg={propertyCountryError}
              fontSize={12}
            />
          </View>
        </View>

        <View style={{height: normalized(10)}} />

        <Text style={[styles.Modal_Heading_Txt, {fontSize: normalized(24)}]}>
          Billing Address Details
        </Text>

        <View style={styles.infoItem}>
          <CustomCheckBox
            checked={isBillingUser}
            onChange={() => onBillingUser()}
          />
          <Text style={styles.checkboxTxt}>Billing details same as user?</Text>
        </View>

        <Text style={styles.Input_Heading}>Address</Text>
        <CustomGooglePlacesInput
          apiKey={PLACE_API_KEY}
          value={billingAddress}
          onChangeText={(val: any) => {
            setbillingAddress(val);
            setbillingAddressError('');
            setIsBillingAddressSelected(false);
          }}
          isEditable={!isBillingUser}
          onPlaceSelected={async (p: any) => {
            const coord = {lat: p.lat, lng: p.lng};
            setBillingAddLatLng(coord);
            setbillingCity(p?.components?.city);
            setbillingState(p?.components?.state);
            setbillingZipCode(p?.components?.postalCode);
            setbillingCountry(p?.components?.country);

            if (p?.components?.city) setbillingCityError('');
            if (p?.components?.state) setbillingSateError('');
            if (p?.components?.postalCode) setbillingZipCodeError('');
            if (p?.components?.country) setbillingCountryError('');
            setIsBillingAddressSelected(true);
          }}
          onError={err => {
            dispatch(
              setShowToast({
                type: AppStrings.ToastType.warning,
                message: err?.message || 'Address search failed',
              }),
            );
          }}
          placeholder={`Search Address (${
            baseData?.country || 'Your Country'
          } only)`}
          debounceMs={300}
          placeholderColor={
            billingAddressError?.length > 0 ? colors.Error : colors.Desc_Txt
          }
          minLength={2}
          maxResults={6}
          inputStyle={[
            styles.placesInput,
            {
              backgroundColor:
                billingAddressError?.length > 0
                  ? colors.redLight
                  : colors.Background,
              borderColor:
                billingAddressError?.length > 0
                  ? colors.Error
                  : colors.BorderColor,
            },
          ]}
          containerStyle={{zIndex: 1}}
        />

        <View style={styles.Input_Row}>
          <View style={{flex: 1}}>
            <Text style={styles.Input_Heading}>Billing City</Text>
            <CustomInput
              placeholder={'Enter Billing City'}
              value={billingCity}
              setValue={(val: any) => {
                setbillingCity(val);
                setbillingCityError('');
              }}
              errorMsg={billingCityError}
              isEditable={!isBillingUser}
            />
          </View>
          <View
            style={{
              flex: 1,
            }}>
            <Text style={styles.Input_Heading}>Billing State</Text>
            <CustomInput
              placeholder={'Enter Billing State'}
              value={billingState}
              setValue={(val: any) => {
                setbillingState(allowOnlyString(val));
                setbillingSateError('');
              }}
              errorMsg={billingStateError}
              isEditable={!isBillingUser}
            />
          </View>
        </View>

        <View style={styles.Input_Row}>
          <View style={{flex: 1}}>
            <Text style={styles.Input_Heading}>Billing Zip Code</Text>
            <CustomInput
              placeholder={'Enter Billing ZipCode'}
              value={billingZipCode}
              setValue={(val: any) => {
                setbillingZipCode(val);
                setbillingZipCodeError('');
              }}
              errorMsg={billingZipCodeError}
              isEditable={!isBillingUser}
            />
          </View>
          <View
            style={{
              flex: 1,
            }}>
            <Text style={styles.Input_Heading}>Billing Country</Text>
            <CustomInput
              placeholder={'Enter Billing Country'}
              value={billingCountry}
              setValue={(val: any) => {
                setbillingCountry(allowOnlyString(val));
                setbillingCountryError('');
              }}
              errorMsg={billingCountryError}
              isEditable={!isBillingUser}
            />
          </View>
        </View>

        <View style={styles.submitBtnCont}>
          <CustomButton
            text={'Submit Request'}
            onPress={() => {
              onSubmit();
            }}
            loading={isLoading}
          />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default CartRentalSubmitReq;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    submitBtnCont: {
      width: normalized(140),
      alignSelf: 'flex-end',
    },
    catWrapper: {
      marginVertical: normalized(12),
      gap: normalized(8),
    },
    loaderCont: {
      height: normalized(150),
      alignItems: 'center',
      justifyContent: 'center',
    },
    placesInput: {
      borderColor: colors.Desc_Txt,
      height: normalized(45),
      borderRadius: normalized(8),
      backgroundColor: colors.Background,
    },
    infoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(10),
      marginTop: normalized(5),
      flex: 1,
    },
    checkboxTxt: {
      color: colors.Desc_Txt,
      fontSize: normalized(16),
      fontFamily: AppFonts.UbuntuMedium,
    },
  });
