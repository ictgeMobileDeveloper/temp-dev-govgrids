import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  ScrollViewInstance,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../../Redux/AppStore';
import {AppStyles} from '../../../Utils/AppStyles';
import {
  AppFonts,
  normalized,
  PP_STEPPER_LIST,
  ScreenProps,
  US_STATES,
  Vehicle_Color,
} from '../../../Utils/AppConstants';

import CustomInput from '../../Components/CustomInput';

import CustomDropDownList from '../../Components/CustomDropDownList';
import DateTimeComp from '../../Components/DateTimeComp';
import CustomDocumentPicker from '../../Components/CustomDocumentPicker';
import PlusIcon from '../../Svg/PlusIcon';

import CustomButton from '../../Components/CustomButton';
import MinusIcon from '../../Svg/MinusIcon';
import {Routes} from '../../../Utils/Routes';
import moment, {invalid} from 'moment';
import {apiHandler} from '../../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../../Network/Urls';

import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewRef,
} from 'react-native-keyboard-controller';

import Stepper from '../../Components/Stepper';
import SimpleButton from '../../Components/SimpleButton';
import {updateParkingPermitDraft} from '../../../Redux/AppReducers';
import CustomCheckBox from '../../Components/CustomCheckBox';
import {bool} from 'prop-types';
import {formatPhoneNumber, isEmailValid} from '../../../Utils/Helper';

type Item = {
  name: string;
  value?: string | number;
};

const ParkingPermitFormScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const selector: any = useSelector(
    (state: AppRootStore) => state.SliceReducer,
  );
  const dispatch = useDispatch();
  const colors = selector?.themeColors;
  const prevData = props?.route?.params?.item;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const [termsHtml, setTermsHtml] = useState('');

  const userData = selector?.residentUserData;
  const parkingPermitDraft = selector?.parkingPermitDraft ?? {};
  console.log('vehicle form ', parkingPermitDraft);
  const scrollRef = useRef<KeyboardAwareScrollViewRef>(null);
  let max = props?.route?.params?.maxVehicle;
  const [maxVehicle, setmaxVehicle] = useState(max ?? 1);
  //   ----------->>> values states

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const vehicle = {
    model: '',
    makeOf: '',
    color: '',
    license: '',
    state: '',
    image: {},
    ownerSameAsApplicant: true,
    ownerName: '',
    ownerPhoneNumber: '',
    ownerEmail: '',
    makeList: [] as Item[],
    makeIndex: -1,
    stateIndex: -1,
    errors: {
      model: '',
      makeOf: '',
      color: '',
      license: '',
      state: '',
      image: false,
      ownerName: '',
      ownerPhoneNumber: '',
      ownerEmail: '',
    },
  };
  const [vehicles, setVehicles] = useState<any[]>(
    parkingPermitDraft?.vehicles?.length
      ? parkingPermitDraft.vehicles
      : [{...vehicle}],
  );

  const category = props?.route?.params?.category;

  //  -------------->>>>>  Vehicle State Mangement Functions

  useEffect(() => {
    fetchTermsAndConditions();
  }, []);

  const addVehicle = () => {
    if (vehicles.length < maxVehicle) {
      setVehicles(prev => [...prev, {...vehicle}]);
    }
  };

  const removeVehicle = (index: number) => {
    setVehicles(prev => prev.filter((_, i) => i !== index));
  };
  const updateVehicle = (index: number, field: string, value: any) => {
    setVehicles(prev =>
      prev.map((v, i) => {
        if (i !== index) return v;
        const updatedVehicle = {...v, [field]: value};
        if (field in updatedVehicle.errors) {
          updatedVehicle.errors = {...updatedVehicle.errors, [field]: ''};
        }
        return updatedVehicle;
      }),
    );
  };

  const fetchTermsAndConditions = () => {
    apiHandler({
      endpoint: ENDPOINTS.parkingPermitTerms,
      method: 'GET',
      authContext: 'RESIDENT',
      onComplete: (resp: any) => {
        console.log('terms and condition', resp);
        if (resp?.status) {
          setTermsHtml(resp?.data?.data?.submissionFormTerms ?? '');
        }
      },
    });
  };

  const getVehicleModelList = (index: number, make: string | number) => {
    apiHandler({
      endpoint: ENDPOINTS.getParkingVehicleModelList,
      method: 'GET',
      authContext: 'RESIDENT',
      useRecaptcha: true,
      recaptchaAction: 'login',
      queryParams: {
        make: make,
      },
      requiresAuth: false,
      onComplete: (resp: any) => {
        if (resp?.status) {
          const data = Array.isArray(resp?.data?.data) ? resp.data.data : [];
          updateVehicle(
            index,
            'makeList',
            data.map((item: any) => ({name: item.name, value: item.id})),
          );
          console.log(vehicle.makeList);
        } else {
          updateVehicle(index, 'makeList', []);
        }
      },
    });
  };
  const getVehicleMakeList = (model: string) => {
    return new Promise<Item[]>(resolve => {
      apiHandler({
        endpoint: ENDPOINTS.getParkingVehicleList,
        method: 'GET',
        authContext: 'RESIDENT',
        useRecaptcha: true,
        recaptchaAction: 'login',
        queryParams: {
          query: model.trim(),
          // make: makeId,
        },
        requiresAuth: false,

        onComplete: (resp: any) => {
          console.log('MODEL RESPONSE >>>', resp);

          if (resp?.status) {
            const data = Array.isArray(resp?.data?.data)
              ? resp?.data?.data
              : [];

            resolve(
              data.map((item: any) => ({
                name: item.name,
                value: item.id,
              })),
            );
          } else {
            resolve([]);
          }
        },
      });
    });
  };
  const validateForm = () => {
    let isFormValid = true;

    const nextVehicles = vehicles.map((v: any) => {
      const errors = {
        model: '',
        makeOf: '',
        color: '',
        license: '',
        state: '',
        image: false,
        ownerName: '',
        ownerPhoneNumber: '',
        ownerEmail: '',
      };

      if (!v.model?.trim()) {
        errors.model = 'Model is required';
        isFormValid = false;
      }
      if (!v.makeOf?.trim()) {
        errors.makeOf = 'Make is required';
        isFormValid = false;
      }
      if (!v.color?.trim()) {
        errors.color = 'Color is required';
        isFormValid = false;
      }
      if (!v.license?.trim()) {
        errors.license = 'License plate is required';
        isFormValid = false;
      }
      if (!v.state?.trim()) {
        errors.state = 'State is required';
        isFormValid = false;
      }

      if (category === 'CONTRACT' && !v.image?.filename) {
        errors.image = true;
        isFormValid = false;
      }
      if (!v.ownerSameAsApplicant) {
        if (!v.ownerName?.trim()) {
          errors.ownerName = 'Owner name is required';
          isFormValid = false;
        }
        if (!v.ownerPhoneNumber?.trim()) {
          errors.ownerPhoneNumber = 'Owner phone is required';
          isFormValid = false;
        }
        if (!v.ownerEmail?.trim() || !isEmailValid(v.ownerEmail)) {
          errors.ownerEmail = 'Valid owner email is required';
          isFormValid = false;
        }
      }
      return {...v, errors};
    });
    setVehicles(nextVehicles);

    return isFormValid;
  };
  const onNext = () => {
    if (!validateForm()) return;
    dispatch(
      updateParkingPermitDraft({
        ...parkingPermitDraft,
        vehicles,
        termsHtml,
      }),
    );
    if (userData) {
      props.navigation.navigate(Routes.ParkingPermit.TermsNCondi);
    } else {
      props.navigation.navigate(Routes.ParkingPermit.GuestSubmission);
    }
  };
  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Platform.OS == 'android' ? insects.bottom : 0,
        },
      ]}>
      <StatusBar
        barStyle={selector?.isDarkTheme ? 'light-content' : 'dark-content'}
      />
      <Stepper
        list={PP_STEPPER_LIST}
        completedSteps={[1]}
        activeStep={PP_STEPPER_LIST[2]}
        skipNext={!!userData}
      />

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        ref={scrollRef}
        contentContainerStyle={{
          paddingHorizontal: normalized(20),
          paddingBottom: normalized(10),
        }}>
        <View style={styles.rowCont}>
          <Text style={styles.Modal_Heading_Txt}>Add Vehicles</Text>
          {vehicles.length < maxVehicle && (
            <TouchableOpacity activeOpacity={1} onPress={addVehicle}>
              <PlusIcon />
            </TouchableOpacity>
          )}
        </View>
        <View style={{height: normalized(8)}} />

        {vehicles?.map((vehicle: any, index: any) => {
          return (
            <View key={index}>
              <View style={styles.rowCont}>
                <Text style={styles.vehicleTxt}>{`Vehicle - ${
                  index + 1
                }`}</Text>
                {index > 0 && (
                  <TouchableOpacity onPress={() => removeVehicle(index)}>
                    <MinusIcon />
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.Input_Row}>
                <View
                  style={{
                    flex: 1,
                  }}>
                  <Text style={styles.Input_Heading}>Vehicle Make*</Text>

                  <CustomDropDownList
                    isSearchable
                    placeholder="Enter Make"
                    value={vehicle.makeOf}
                    fetchList={(search: string) => getVehicleMakeList(search)}
                    onChangeText={text => {
                      updateVehicle(index, 'makeOf', text);
                      updateVehicle(index, 'makeList', []);
                      updateVehicle(index, 'makeIndex', -1);
                      updateVehicle(index, 'model', '');
                    }}
                    onSelect={item => {
                      updateVehicle(index, 'makeOf', item.name);
                      updateVehicle(index, 'model', '');
                      updateVehicle(index, 'makeIndex', -1);
                      getVehicleModelList(index, item.name ?? '');
                    }}
                    error={!!vehicle.errors.makeOf}
                    maxPanelHeight={normalized(180)}
                    parentScrollRef={scrollRef}
                  />
                </View>
              </View>
              <View style={styles.Input_Row}>
                <View
                  style={{
                    flex: 1,
                  }}>
                  <Text style={styles.Input_Heading}>Vehicle Model*</Text>
                  <CustomDropDownList
                    isSearchable={!vehicle.makeList?.length}
                    list={vehicle.makeList}
                    selectedIndex={vehicle.makeIndex}
                    value={vehicle.model}
                    onChange={i => {
                      updateVehicle(index, 'makeIndex', i);
                      updateVehicle(
                        index,
                        'model',
                        vehicle.makeList[i]?.name ?? '',
                      );
                    }}
                    onChangeText={text => updateVehicle(index, 'model', text)}
                    placeholder="Select Model"
                    error={!!vehicle.errors.model}
                    maxPanelHeight={normalized(180)}
                  />
                </View>
              </View>

              <View style={[styles.Input_Row, {alignItems: 'flex-start'}]}>
                <View style={{flex: 1}}>
                  <Text style={styles.Input_Heading}>Vehicle Color*</Text>

                  <CustomDropDownList
                    list={Vehicle_Color.map(color => ({name: color}))}
                    selectedIndex={Vehicle_Color.indexOf(vehicle.color)}
                    maxPanelHeight={normalized(120)}
                    onChange={(i: number) => {
                      updateVehicle(index, 'color', Vehicle_Color[i] ?? '');
                    }}
                    placeholder="Select Color"
                    error={!!vehicle.errors.color}
                  />
                </View>

                <View style={{flex: 1}}>
                  <Text style={styles.Input_Heading}>License Plate*</Text>

                  <CustomInput
                    placeholder="Enter Plate"
                    value={vehicle.license}
                    setValue={(val: string) => {
                      updateVehicle(index, 'license', val);
                    }}
                    errorMsg={vehicle.errors.license}
                  />
                </View>
              </View>
              <View
                style={{
                  flex: 1,
                }}>
                <Text style={styles.Input_Heading}>State*</Text>
                <CustomDropDownList
                  list={US_STATES?.map(o => ({name: o.long}))}
                  selectedIndex={vehicle.stateIndex}
                  onChange={i => {
                    updateVehicle(index, 'stateIndex', i);
                    const stateName = US_STATES[i]?.long ?? '';
                    updateVehicle(index, 'state', stateName);
                  }}
                  placeholder="Select State"
                  error={!!vehicle.errors.state}
                />
              </View>
              {category === 'CONTRACT' && (
                <View
                  style={{
                    flex: 1,
                  }}>
                  <Text style={styles.Input_Heading}>Car Registration*</Text>
                  <CustomDocumentPicker
                    uploading={uploading}
                    progress={progress}
                    maxSize={20 * 1024 * 1024}
                    text1={'Choose Image to Upload'}
                    type={'image'}
                    limit={1}
                    defaultValue={
                      vehicle.image?.uri ? [vehicle.image] : undefined
                    }
                    onSelect={(obj: any) => {
                      const data = obj[0];
                      updateVehicle(index, 'image', {
                        filename: data?.filename,
                        type: data?.type,
                        uri: data?.uri,
                        size: data?.size,
                      });
                    }}
                    isError={vehicle.errors.image}
                  />
                </View>
              )}
              <View style={styles.checkboxCont}>
                <CustomCheckBox
                  checked={vehicle.ownerSameAsApplicant}
                  onChange={(val: boolean) => {
                    updateVehicle(index, 'ownerSameAsApplicant', val);
                    // optional: clear owner fields when switching back to "same as applicant"
                    if (val) {
                      updateVehicle(index, 'ownerName', '');
                      updateVehicle(index, 'ownerPhoneNumber', '');
                      updateVehicle(index, 'ownerEmail', '');
                    }
                  }}
                />
                <View style={{width: normalized(10)}} />
                <Text style={styles.Desc_Txt_N}>
                  {'The owner is the same as the applicant'}
                </Text>
              </View>
              <View style={{height: normalized(10)}} />
              {!vehicle.ownerSameAsApplicant && (
                <View>
                  <View style={styles.Input_Row}>
                    <View
                      style={{
                        flex: 1,
                      }}>
                      <Text style={styles.Input_Heading}>Owner Name*</Text>
                      <CustomInput
                        placeholder={'Owner Name'}
                        value={vehicle.ownerName}
                        setValue={(val: string) =>
                          updateVehicle(index, 'ownerName', val)
                        }
                        errorMsg={vehicle.errors.ownerName}
                      />
                    </View>
                    <View
                      style={{
                        flex: 1,
                      }}>
                      <Text style={styles.Input_Heading}>
                        Owner Phone Number*
                      </Text>
                      <CustomInput
                        placeholder={'Owner Phone Number'}
                        value={formatPhoneNumber(vehicle.ownerPhoneNumber)}
                        setValue={(val: string) =>
                          updateVehicle(index, 'ownerPhoneNumber', val)
                        }
                        errorMsg={vehicle.errors.ownerPhoneNumber}
                      />
                    </View>
                  </View>
                  <View style={styles.Input_Row}>
                    <View
                      style={{
                        flex: 1,
                      }}>
                      <Text style={styles.Input_Heading}>Owner Email*</Text>
                      <CustomInput
                        placeholder={'Owner Email'}
                        value={vehicle.ownerEmail}
                        setValue={(val: string) =>
                          updateVehicle(index, 'ownerEmail', val)
                        }
                        errorMsg={vehicle.errors.ownerEmail}
                      />
                    </View>
                  </View>
                </View>
              )}
            </View>
          );
        })}

        <View style={styles.footerRow}>
          <View style={styles.nextBtnCont}>
            <SimpleButton
              text={'Back'}
              onPress={() => props?.navigation?.goBack()}
              loading={false}
            />
          </View>
          <View style={styles.nextBtnCont}>
            <CustomButton text="Next" onPress={onNext} loading={false} />
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default ParkingPermitFormScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    rowCont: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'space-between',
      flexDirection: 'row',
      marginVertical: normalized(10),
    },
    vehicleTxt: {
      fontSize: normalized(18),
      fontFamily: AppFonts.UbuntuMedium,
      color: colors.Primary,
    },
    checkboxCont: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: normalized(12),
    },
    simpleTxt: {
      fontSize: normalized(18),
      color: colors.Heading_Txt,
      fontFamily: AppFonts.UbuntuRegular,
    },
    bullet: {
      width: normalized(5),
      height: normalized(5),
      backgroundColor: colors.Black,
      borderRadius: normalized(5),
      marginRight: normalized(12),
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(10),
      marginLeft: normalized(10),
    },
    submitBtnCont: {
      width: normalized(140),
      alignSelf: 'flex-end',
    },
    infoHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: normalized(10),
      marginBottom: normalized(10),
    },

    infoIcon: {
      width: normalized(30),
      height: normalized(30),
      borderRadius: normalized(15),
      backgroundColor: colors.Primary,
      alignItems: 'center',
      justifyContent: 'center',
    },

    infoIconTxt: {
      color: colors.White,
      fontSize: normalized(16),
      fontFamily: AppFonts.UbuntuBold,
    },
    loaderCont: {
      height: normalized(40),
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
