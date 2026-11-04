import {Platform, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewRef,
} from 'react-native-keyboard-controller';
import {AppRootStore} from '../../../Redux/AppStore';
import {AppStyles} from '../../../Utils/AppStyles';
import {
  normalized,
  P_Company_STEPPER_LIST,
  PP_STEPPER_LIST,
  ScreenProps,
  US_STATES,
  Vehicle_Color,
} from '../../../Utils/AppConstants';
import {Routes} from '../../../Utils/Routes';
import {formatPhoneNumber, isEmailValid} from '../../../Utils/Helper';
import {apiHandler} from '../../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../../Network/Urls';
import {updateParkingPermitDraft} from '../../../Redux/AppReducers';

import CustomInput from '../../Components/CustomInput';
import CustomDropDownList from '../../Components/CustomDropDownList';
import CustomDocumentPicker from '../../Components/CustomDocumentPicker';
import CustomButton from '../../Components/CustomButton';
import SimpleButton from '../../Components/SimpleButton';
import PlusIcon from '../../Svg/PlusIcon';
import MinusIcon from '../../Svg/MinusIcon';
import Stepper from '../../Components/Stepper';
import AnimatedChevron from '../../Svg/CollapseExpandAnimated';

type Item = {name: string; value?: string | number};

const newVehicle = () => ({
  parkingSite: '',
  siteIndex: -1,
  makeOf: '',
  model: '',
  modelList: [] as Item[],
  modelIndex: -1,
  color: '',
  license: '',

  state: '',
  stateIndex: -1,
  ownerName: '',
  ownerPhoneNumber: '',
  ownerEmail: '',
  ownerSameAsApplicant: true,
  image: {} as any,
  errors: {} as Record<string, string>,
});

const ParkingPermitCompanyVehiclesScreen = (props: ScreenProps) => {
  const insets = useSafeAreaInsets();
  const selector: any = useSelector(
    (state: AppRootStore) => state.SliceReducer,
  );
  const dispatch = useDispatch();
  const colors = selector?.themeColors;
  const userData = selector?.residentUserData;
  const draft = selector?.parkingPermitDraft ?? {};
  const scrollRef = useRef<KeyboardAwareScrollViewRef>(null);
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  const sites: any[] = draft?.association?.sites ?? [];
  const maxVehicle = sites.reduce(
    (n, data) => n + (data?.vehicleCapacity ?? 0),
    0,
  );

  const [termsHtml, setTermsHtml] = useState('');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<number | null>(0);
  const [vehicles, setVehicles] = useState<any[]>(
    draft?.vehicles?.length ? draft.vehicles : [newVehicle()],
  );

  useEffect(() => {
    apiHandler({
      endpoint: ENDPOINTS.parkingPermitTerms,
      method: 'GET',
      authContext: 'RESIDENT',
      onComplete: (resp: any) => {
        if (resp?.status) {
          setTermsHtml(resp?.data?.data?.submissionFormTerms ?? '');
        }
      },
    });
  }, []);

  const usedCount = (siteIndex: number) =>
    vehicles.filter(v => v.siteIndex === siteIndex).length;

  const matchesSearch = (v: any) =>
    [v.license, v.makeOf, v.model, v.color]
      .join(' ')
      .toLowerCase()
      .includes(search.trim().toLowerCase());

  const addVehicle = () => {
    if (vehicles.length < maxVehicle) {
      setVehicles(prev => [...prev, newVehicle()]);
      setExpanded(vehicles.length);
    }
  };

  const removeVehicle = (index: number) => {
    setVehicles(prev => prev.filter((_, i) => i !== index));
    setExpanded(null);
  };

  const updateVehicle = (index: number, fields: Record<string, any>) => {
    setVehicles(prev =>
      prev.map((v, i) => {
        if (i !== index) return v;
        const errors = {...v.errors};
        Object.keys(fields).forEach(key => delete errors[key]);
        return {...v, ...fields, errors};
      }),
    );
  };

  const getMakes = (query: string) =>
    new Promise<Item[]>(resolve => {
      apiHandler({
        endpoint: ENDPOINTS.getParkingVehicleList,
        method: 'GET',
        authContext: 'RESIDENT',
        useRecaptcha: true,
        recaptchaAction: 'login',
        queryParams: {query: query.trim()},
        requiresAuth: false,
        onComplete: (resp: any) => {
          const data = Array.isArray(resp?.data?.data) ? resp.data.data : [];
          resolve(
            resp?.status
              ? data.map((i: any) => ({name: i.name, value: i.id}))
              : [],
          );
        },
      });
    });

  const getModels = (index: number, make: string) => {
    apiHandler({
      endpoint: ENDPOINTS.getParkingVehicleModelList,
      method: 'GET',
      authContext: 'RESIDENT',
      useRecaptcha: true,
      recaptchaAction: 'login',
      queryParams: {make},
      requiresAuth: false,
      onComplete: (resp: any) => {
        const data = Array.isArray(resp?.data?.data) ? resp.data.data : [];
        updateVehicle(index, {
          modelList: resp?.status
            ? data.map((i: any) => ({name: i.name, value: i.id}))
            : [],
        });
      },
    });
  };

  const validateForm = () => {
    const next = vehicles.map(v => {
      const errors: Record<string, string> = {};
      if (v.siteIndex < 0) errors.siteIndex = 'Parking site is required';
      if (!v.makeOf?.trim()) errors.makeOf = 'Make is required';
      if (!v.model?.trim()) errors.model = 'Model is required';
      if (!v.color?.trim()) errors.color = 'Color is required';
      if (!v.license?.trim()) errors.license = 'License plate is required';
      if (!v.state?.trim()) errors.state = 'State is required';
      if (!v.ownerName?.trim()) errors.ownerName = 'Owner name is required';
      if (!v.image?.filename) {
        errors.image = 'Car registration image is required';
      }
      if (!v.ownerPhoneNumber?.trim())
        errors.ownerPhoneNumber = 'Owner phone is required';
      if (!isEmailValid(v.ownerEmail))
        errors.ownerEmail = 'Valid owner email is required';
      return {...v, errors};
    });

    setVehicles(next);

    // open the first vehicle that has errors
    const firstInvalid = next.findIndex(v => Object.keys(v.errors).length);
    if (firstInvalid >= 0) setExpanded(firstInvalid);
    return firstInvalid < 0;
  };

  const onNext = () => {
    if (!validateForm()) return;
    dispatch(
      updateParkingPermitDraft({
        ...draft,
        vehicles: vehicles.map(({errors, modelList, ...rest}) => ({
          ...rest,
          parkingSite: sites[rest.siteIndex]?.site?.id ?? '',
        })),
        termsHtml,
      }),
    );
    props.navigation.navigate(Routes.ParkingPermit.TermsNCondi, {
      isCompany: true,
    });
  };

  return (
    <View
      style={[
        styles.container,
        {paddingBottom: Platform.OS === 'android' ? insets.bottom : 0},
      ]}>
      <Stepper
        list={P_Company_STEPPER_LIST}
        completedSteps={[0, 1]}
        activeStep={P_Company_STEPPER_LIST[2]}
      />

      <KeyboardAwareScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: normalized(20),
          paddingBottom: normalized(10),
        }}>
        <View style={[styles.rowCont, {marginVertical: normalized(10)}]}>
          <Text style={styles.Modal_Heading_Txt}>Add Vehicles</Text>
          {vehicles.length < maxVehicle && (
            <TouchableOpacity onPress={addVehicle}>
              <PlusIcon />
            </TouchableOpacity>
          )}
        </View>

        {/* Capacity per site */}
        <View style={styles.pillWrap}>
          {sites.map((data, i) => (
            <View
              key={data?.id}
              style={[styles.statusCont, styles.outlinePill]}>
              <Text style={[styles.statusTxt, {color: colors.Heading_Txt}]}>
                {`${data?.site?.buildingName}   ${usedCount(i)} / ${
                  data?.vehicleCapacity
                }`}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.Input_Heading}>Search Vehicles</Text>
        <CustomInput
          placeholder="Enter license plate, make, model or color"
          value={search}
          setValue={setSearch}
        />
        <View style={{height: normalized(12)}} />

        {/* Vehicles */}
        {vehicles.map((v, index) => {
          if (!matchesSearch(v)) return null;
          const isOpen = expanded === index;

          return (
            <View key={index} style={[styles.itemCont, styles.vehicleCont]}>
              {/* Header */}
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.rowCont}
                onPress={() => setExpanded(isOpen ? null : index)}>
                <View style={[styles.pillCont, {flex: 1}]}>
                  <Text style={styles.vehicleTxt}>{`Vehicle ${
                    index + 1
                  }`}</Text>
                  {v.siteIndex >= 0 && (
                    <View
                      style={[
                        styles.statusCont,
                        {backgroundColor: `${colors.Primary}26`},
                      ]}>
                      <Text style={[styles.statusTxt, {color: colors.Primary}]}>
                        {sites[v.siteIndex]?.site?.buildingName}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.pillCont}>
                  {index > 0 && (
                    <TouchableOpacity onPress={() => removeVehicle(index)}>
                      <MinusIcon />
                    </TouchableOpacity>
                  )}
                  <View style={styles.iconBtn}>
                    <AnimatedChevron
                      expanded={isOpen}
                      color={colors.Heading_Txt}
                      //   duration={ANIMATION_DURATION}
                    />
                  </View>
                </View>
              </TouchableOpacity>

              {/* Form */}
              {isOpen && (
                <View>
                  <Text style={styles.Input_Heading}>Parking Site*</Text>
                  <CustomDropDownList
                    list={sites.map((data, i) => ({
                      name: `${data?.site?.buildingName} (${usedCount(i)} / ${
                        data?.vehicleCapacity
                      })`,
                    }))}
                    selectedIndex={v.siteIndex}
                    onChange={(i: number) =>
                      updateVehicle(index, {
                        siteIndex: i,
                        parkingSite: sites[i]?.site?.id ?? '',
                      })
                    }
                    placeholder="Select Parking Site"
                    error={!!v.errors.siteIndex}
                  />

                  <Text style={styles.Input_Heading}>Make Of Vehicle*</Text>
                  <CustomDropDownList
                    isSearchable
                    placeholder="Start typing to search Make of Vehicle"
                    value={v.makeOf}
                    fetchList={getMakes}
                    onChangeText={(text: string) =>
                      updateVehicle(index, {
                        makeOf: text,
                        model: '',
                        modelList: [],
                        modelIndex: -1,
                      })
                    }
                    onSelect={(item: Item) => {
                      updateVehicle(index, {
                        makeOf: item.name,
                        model: '',
                        modelList: [],
                        modelIndex: -1,
                      });
                      getModels(index, item.name);
                    }}
                    error={!!v.errors.makeOf}
                    maxPanelHeight={normalized(180)}
                    parentScrollRef={scrollRef}
                  />

                  <Text style={styles.Input_Heading}>Vehicle Model*</Text>
                  <CustomDropDownList
                    isSearchable={!v.modelList.length}
                    list={v.modelList}
                    selectedIndex={v.modelIndex}
                    value={v.model}
                    onChange={(i: number) =>
                      updateVehicle(index, {
                        modelIndex: i,
                        model: v.modelList[i]?.name ?? '',
                      })
                    }
                    onChangeText={(text: string) =>
                      updateVehicle(index, {model: text})
                    }
                    placeholder="Enter Vehicle Model"
                    error={!!v.errors.model}
                    maxPanelHeight={normalized(180)}
                  />

                  <View style={[styles.Input_Row, {alignItems: 'flex-start'}]}>
                    <View style={{flex: 1}}>
                      <Text style={styles.Input_Heading}>Color*</Text>
                      <CustomDropDownList
                        list={Vehicle_Color.map(color => ({name: color}))}
                        selectedIndex={Vehicle_Color.indexOf(v.color)}
                        maxPanelHeight={normalized(170)}
                        onChange={(i: number) => {
                          updateVehicle(index, {
                            color: Vehicle_Color[i] ?? '',
                          });
                        }}
                        placeholder="Select Color"
                        error={!!v.errors.color}
                      />
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={styles.Input_Heading}>License Plate*</Text>
                      <CustomInput
                        placeholder="Enter Plate"
                        value={v.license}
                        setValue={(val: string) =>
                          updateVehicle(index, {license: val})
                        }
                        errorMsg={v.errors.license}
                      />
                    </View>
                  </View>

                  <Text style={styles.Input_Heading}>State*</Text>
                  <CustomDropDownList
                    list={US_STATES.map(o => ({name: o.long}))}
                    selectedIndex={v.stateIndex}
                    onChange={(i: number) =>
                      updateVehicle(index, {
                        stateIndex: i,
                        state: US_STATES[i]?.long ?? '',
                      })
                    }
                    placeholder="Select State"
                    error={!!v.errors.state}
                  />

                  <Text style={styles.Input_Heading}>Owner Name*</Text>
                  <CustomInput
                    placeholder="Enter Owner Name"
                    value={v.ownerName}
                    setValue={(val: string) =>
                      updateVehicle(index, {ownerName: val})
                    }
                    errorMsg={v.errors.ownerName}
                  />

                  <Text style={styles.Input_Heading}>Owner Phone Number*</Text>
                  <CustomInput
                    placeholder="Enter Owner Phone Number"
                    value={formatPhoneNumber(v.ownerPhoneNumber)}
                    setValue={(val: string) =>
                      updateVehicle(index, {ownerPhoneNumber: val})
                    }
                    errorMsg={v.errors.ownerPhoneNumber}
                  />

                  <Text style={styles.Input_Heading}>Owner Email*</Text>
                  <CustomInput
                    placeholder="Enter Owner Email"
                    value={v.ownerEmail}
                    setValue={(val: string) =>
                      updateVehicle(index, {ownerEmail: val})
                    }
                    errorMsg={v.errors.ownerEmail}
                  />

                  <Text style={styles.Input_Heading}>Car Registration*</Text>
                  <CustomDocumentPicker
                    maxSize={20 * 1024 * 1024}
                    text1="Choose Image to Upload"
                    type="image"
                    limit={1}
                    isError={!!v.errors.image}
                    defaultValue={v.image?.uri ? [v.image] : undefined}
                    onSelect={(obj: any) => {
                      const f = obj[0];

                      updateVehicle(index, {
                        image: {
                          filename: f?.filename,
                          type: f?.type,
                          uri: f?.uri,
                          size: f?.size,
                        },
                      });
                    }}
                  />
                </View>
              )}
            </View>
          );
        })}

        <View style={styles.footerRow}>
          <View style={styles.nextBtnCont}>
            <SimpleButton
              text="Back"
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

export default ParkingPermitCompanyVehiclesScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    vehicleCont: {
      marginBottom: normalized(12),
      gap: 0,
    },
    vehicleTxt: {
      fontSize: normalized(18),
      fontWeight: '700',
      color: colors.Primary,
    },
    outlinePill: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.BorderColor,
    },
    iconBtn: {
      width: normalized(28),
      height: normalized(28),
      borderRadius: normalized(6),
      borderWidth: 1,
      borderColor: colors.BorderColor,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
