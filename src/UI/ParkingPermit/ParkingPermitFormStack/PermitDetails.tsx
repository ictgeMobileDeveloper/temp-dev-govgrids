import React, {useEffect, useMemo, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import moment, {duration} from 'moment';
import {AppRootStore} from '../../../Redux/AppStore';
import {AppStyles} from '../../../Utils/AppStyles';
import {
  ALL_MINUTE_CHOICES,
  AppFonts,
  DOCUMENT_TYPE_OPTIONS,
  FALLBACK_MAX_HOURS,
  normalized,
  PP_STEPPER_LIST,
  ScreenProps,
} from '../../../Utils/AppConstants';
import Stepper from '../../Components/Stepper';
import CustomInput from '../../Components/CustomInput';
import CustomButton from '../../Components/CustomButton';
import CustomDropDownList from '../../Components/CustomDropDownList';
import LocationIcon from '../../Svg/LocationIcon';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import DateTimeComp from '../../Components/DateTimeComp';
import CustomGooglePlacesInput from '../../Components/CustomGooglePlacesInput';
import {SECRET_KEYS} from '../../../Network/Urls';
import CustomDocumentPicker from '../../Components/CustomDocumentPicker';
import SimpleButton from '../../Components/SimpleButton';
import VehicleIcon from '../../Svg/VehicleVector';
import ClockIcon from '../../Svg/ClockIcon';
import ClockCheck from '../../Svg/ClockCheckIcon';
import {
  formatAmountToUSD,
  formatMinutesToHours,
  lightenHexColor,
} from '../../../Utils/Helper';
import {Routes} from '../../../Utils/Routes';
import {updateParkingPermitDraft} from '../../../Redux/AppReducers';
import HelpIcon from '../../Svg/HelpIcon';

type PermitType = {
  id: number;
  type: string; // 'hourly' | 'session' | 'daily' | 'monthly' | 'worker' | 'residential' | (future values)
  category: string; // API sends 'PAYG' / 'contract' — compared case-insensitively below
  enabled: boolean;
  rate: string;
  gracePeriod?: number;
  gracePeriodUnit?: string;
  dailyMax?: string | null | undefined;
  extendableAmount?: string | null;
  extendableTime?: boolean;
  maxDurationHours?: number | null;
  maxVehiclesAllowed?: number | null;
  sessionHours?: number | null;
  allowMultipleVehicles?: boolean;
  [key: string]: any;
};

type OperatingHour = {
  id: number;
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
};

type Zone = {
  id: number;
  name: string;
  code?: string;
  operatingHours?: OperatingHour[];
  permitTypes?: PermitType[];
  [key: string]: any;
};

type ParkingSite = {
  id: number | string;
  buildingName?: string;
  zones?: Zone[];
  [key: string]: any;
};

type PermitCategory = 'PAYG' | 'CONTRACT';

const TYPE_LABELS: Record<string, string> = {
  hourly: 'Hourly',
  session: 'Session',
  daily: 'Daily',
  monthly: 'Monthly',
  worker: 'Worker',
  residential: 'Residential',
};

const capitalize = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

const formatOperatingHours = (hours?: OperatingHour[]) => {
  if (!hours || hours.length === 0) return null;
  return hours.map(h => {
    const open = moment(h.openTime, 'HH:mm:ss').format('h:mm A');
    const close = moment(h.closeTime, 'HH:mm:ss').format('h:mm A');
    return `${capitalize(h.dayOfWeek)}: ${open} - ${close}`;
  });
};

const getMaxMinutes = (pt?: PermitType): number | undefined => {
  if (!pt || pt.type !== 'hourly') return undefined;
  const n = Number(pt.dailyMax);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : undefined;
};

const PermitDetailScreen = (props: ScreenProps) => {
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const baseData = selector?.baseData;

  const site: ParkingSite = props?.route?.params?.site ?? {};
  const category: PermitCategory = props?.route?.params?.category;
  const preselectedZoneId = props?.route?.params?.zone?.id;
  console.log(site);
  console.log(preselectedZoneId, 'zoni id', category, 'category');
  // for redux
  const parkingPermitDraft = selector?.parkingPermitDraft;
  const draftDetails = parkingPermitDraft?.details;

  console.log('draft details ', draftDetails);

  const zones = site?.zones ?? [];
  const zoneRequired = site?.zoneRequired;
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<{
    zone?: boolean;
    type?: boolean;
    hours?: boolean;
    minutes?: boolean;
    startDate?: string;
    employerName?: string;
    workAddress?: string;
    docType?: boolean;
    file?: boolean;
  }>({});
  const [fileError, setFileError] = useState(false);
  // ---- Selection state -----------------------------------------------

  const [zoneIndex, setZoneIndex] = useState<number>(() => {
    if (parkingPermitDraft?.zoneId != null) {
      return zones.findIndex(
        z => String(z.id) === String(parkingPermitDraft.zoneId),
      );
    }

    if (preselectedZoneId === undefined) {
      return -1;
    }

    return zones.findIndex(z => String(z.id) === String(preselectedZoneId));
  });
  const [typeIndex, setTypeIndex] = useState<number>(() => {
    const permitTypeId = parkingPermitDraft?.permitType?.id;

    if (permitTypeId == null) {
      return -1;
    }

    return -1;
  });
  const [hoursIndex, setHoursIndex] = useState<number>(-1);
  const [minutesIndex, setMinutesIndex] = useState<number>(-1);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [employerName, setEmployerName] = useState('');
  const [workAddress, setWorkAddress] = useState('');
  const [proofFileName, setProofFileName] = useState<string | undefined>();
  const [file, setFile] = useState<any>('');
  const dispatch = useDispatch();

  const [docTypeIndex, setDocTypeIndex] = useState<number>(-1);
  const selectedZone = zoneIndex >= 0 ? zones[zoneIndex] : undefined;
  const showTypeDropdown = zoneRequired ? !!selectedZone : true;
  const availablePermitTypes = useMemo<PermitType[]>(() => {
    const source: PermitType[] = zoneRequired
      ? selectedZone?.permitTypes ?? []
      : site?.permitTypes ?? [];

    return source.filter(
      pt =>
        pt?.enabled &&
        (pt?.category ?? '').toUpperCase() === category?.toUpperCase(),
    );
  }, [zoneRequired, selectedZone, site?.permitTypes, category]);
  const selectedPermitType =
    typeIndex >= 0 ? availablePermitTypes[typeIndex] : undefined;

  // ---- Hour/minute options, capped by the API's max minutes -----------
  const maxMinutes = getMaxMinutes(selectedPermitType);
  const maxHours = maxMinutes
    ? Math.max(Math.floor(maxMinutes / 60), 1)
    : FALLBACK_MAX_HOURS;
  const maxHourRemainderMinutes = maxMinutes ? maxMinutes % 60 : undefined;

  const hoursOptionValues = Array.from({length: maxHours}, (_, i) =>
    String(i + 1),
  );
  const hours = hoursIndex >= 0 ? hoursOptionValues[hoursIndex] : undefined;

  const minutesOptionValues = useMemo(() => {
    if (!maxMinutes) return ALL_MINUTE_CHOICES;
    const isAtCapHour = hours !== undefined && Number(hours) === maxHours;
    if (!isAtCapHour) return ALL_MINUTE_CHOICES;

    return ALL_MINUTE_CHOICES.filter(
      m => Number(m) <= (maxHourRemainderMinutes ?? 0),
    );
  }, [maxMinutes, hours, maxHours, maxHourRemainderMinutes]);

  const minutes =
    minutesIndex >= 0 ? minutesOptionValues[minutesIndex] : undefined;

  const docType =
    docTypeIndex >= 0 ? DOCUMENT_TYPE_OPTIONS[docTypeIndex]?.value : undefined;

  useEffect(() => {
    const details = parkingPermitDraft?.details;

    if (!details) {
      return;
    }

    setStartDate(details.startDate ? moment(details.startDate).toDate() : null);

    setEmployerName(details.employerName ?? '');
    setWorkAddress(details.workAddress ?? '');
    setProofFileName(details.proofFileName);
    setFile(details.file ?? '');

    setDocTypeIndex(
      details.docType
        ? DOCUMENT_TYPE_OPTIONS.findIndex(
            item => item.value === details.docType,
          )
        : -1,
    );
  }, [parkingPermitDraft]);
  useEffect(() => {
    if (parkingPermitDraft?.permitType?.id == null) return;

    setTypeIndex(
      availablePermitTypes.findIndex(
        pt => String(pt.id) === String(parkingPermitDraft.permitType.id),
      ),
    );
  }, [availablePermitTypes]);

  useEffect(() => {
    if (!selectedPermitType) return;

    const draftHours = draftDetails?.hours;
    const draftMinutes = draftDetails?.minutes;

    setHoursIndex(
      draftHours != null
        ? hoursOptionValues.findIndex(
            value => String(value) === String(draftHours),
          )
        : -1,
    );

    setMinutesIndex(
      draftMinutes != null
        ? minutesOptionValues.findIndex(
            value => String(value) === String(draftMinutes),
          )
        : -1,
    );
  }, [selectedPermitType]);
  const zoneListItems = zones.map(z => ({name: z.name, value: String(z.id)}));
  const typeListItems = availablePermitTypes.map(pt => ({
    name: TYPE_LABELS[pt.type] ?? capitalize(pt.type),
    value: pt.type,
  }));
  const hoursListItems = hoursOptionValues.map(h => ({name: h, value: h}));
  const minutesListItems = minutesOptionValues.map(m => ({name: m, value: m}));

  const operatingHoursLines = zoneRequired
    ? formatOperatingHours(selectedZone?.operatingHours)
    : null;

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    let isValid = true;
    if (zoneRequired && zoneIndex < 0) {
      newErrors.zone = true;
      isValid = false;
    }
    if (typeIndex < 0) {
      newErrors.type = true;
      isValid = false;
    }

    if (!selectedPermitType) {
      setErrors(newErrors);
      return isValid;
    }

    const type = selectedPermitType.type;

    if (category === 'PAYG') {
      if (type === 'hourly') {
        if (hoursIndex < 0) {
          newErrors.hours = true;
          isValid = false;
        }
        if (minutesIndex < 0) {
          newErrors.minutes = true;
          isValid = false;
        }
      }
    } else {
      if (type === 'monthly') {
        if (!startDate) {
          newErrors.startDate = 'Start date is required';
          isValid = false;
        }
      }

      if (type === 'worker') {
        if (!startDate) {
          newErrors.startDate = 'Start date is required';
          isValid = false;
        }
        if (!employerName.trim()) {
          newErrors.employerName = 'Employer name is required';
          isValid = false;
        }
        if (!workAddress.trim()) {
          newErrors.workAddress = 'Work address is required';
          isValid = false;
        }
      }

      if (type === 'residential') {
        if (!startDate) {
          newErrors.startDate = 'Start date is required';
          isValid = false;
        }
        if (docTypeIndex < 0) {
          newErrors.docType = true;
          isValid = false;
        }
        if (!file) {
          newErrors.file = true;
          isValid = false;
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  };
  const onNext = () => {
    const durationMinutes =
      category === 'PAYG' &&
      selectedPermitType?.type === 'hourly' &&
      hours != null &&
      minutes != null
        ? Number(hours) * 60 + Number(minutes)
        : undefined;
    const item = {
      site,
      category,
      maxVehicle: selectedPermitType?.maxVehiclesAllowed ?? 1,
      zoneId: zoneRequired ? selectedZone?.id : undefined,
      permitType: selectedPermitType,
      details: {
        hours,
        minutes,
        duration: durationMinutes,
        startDate: startDate
          ? moment(startDate).format('YYYY-MM-DD')
          : undefined,
        employerName,
        workAddress,
        docType,
        file,
        proofFileName,
      },
    };
    if (!validateForm()) return;
    if ((zoneRequired && zoneIndex < 0) || typeIndex < 0) return;
    dispatch(updateParkingPermitDraft(item));
    props?.navigation?.navigate(Routes.ParkingPermit.FormSubmit, {
      item,
      category,
      maxVehicle: selectedPermitType?.maxVehiclesAllowed,
    });
  };

  const renderPaygDetails = () => {
    if (!selectedPermitType) return null;
    const type = selectedPermitType.type;

    let priceLabel = '—';
    let rateLine = '';
    let durationMinutes: number | undefined;

    if (type === 'hourly') {
      durationMinutes =
        hours != null && minutes != null
          ? Number(hours) * 60 + Number(minutes)
          : undefined;
      const rate = Number(selectedPermitType.rate);
      priceLabel =
        durationMinutes != null && !isNaN(rate)
          ? formatAmountToUSD(((rate * durationMinutes) / 60).toFixed(2))
          : '—';
      rateLine = `${formatAmountToUSD(selectedPermitType.rate)} per hour`;
    } else if (type === 'session') {
      durationMinutes = selectedPermitType.sessionHours ?? undefined;
      priceLabel = formatAmountToUSD(selectedPermitType.rate);
      rateLine = `Selected Type offers a fixed session of ${
        selectedPermitType.sessionHours
          ? selectedPermitType.sessionHours / 60
          : '—'
      } hour session for ${priceLabel}`;
    } else {
      priceLabel = formatAmountToUSD(selectedPermitType.rate);
      rateLine = `${TYPE_LABELS[type] ?? capitalize(type)} rate`;
    }

    return (
      <>
        {type === 'hourly' && (
          <View style={styles.row}>
            <View style={{flex: 1}}>
              <Text style={styles.Input_Heading}>Hours</Text>
              <CustomDropDownList
                list={hoursListItems}
                selectedIndex={hoursIndex}
                onChange={setHoursIndex}
                placeholder="Hours"
                error={!!errors.hours}
              />
            </View>
            <View style={{width: normalized(12)}} />
            <View style={{flex: 1}}>
              <Text style={styles.Input_Heading}>Minutes</Text>
              <CustomDropDownList
                list={minutesListItems}
                selectedIndex={minutesIndex}
                onChange={setMinutesIndex}
                placeholder="Minutes"
                error={!!errors.minutes}
              />
            </View>
          </View>
        )}

        <View style={[styles.itemCont, {marginTop: normalized(14)}]}>
          <Text style={styles.Heading1}>Estimated price: {priceLabel}</Text>
          <Text style={styles.Heading2}>{rateLine}</Text>

          {renderSubBoxesRow()}
        </View>
        <View style={{height: normalized(10)}} />
        {renderEstimatedBlock(durationMinutes)}
      </>
    );
  };

  const renderSubBoxesRow = () => (
    <View
      style={[
        styles.row,
        {marginTop: normalized(14), columnGap: normalized(10)},
      ]}>
      <View style={[styles.itemCont, {width: '30%', height: normalized(120)}]}>
        <View style={styles.iconCont}>
          <VehicleIcon primary={colors.Primary} height={15} width={15} />
        </View>
        <Text
          style={[
            styles.keyTxt,
            {textAlign: 'center', fontSize: normalized(11)},
          ]}>
          Max Vehicles
        </Text>
        <Text style={styles.Heading2}>
          {selectedPermitType?.maxVehiclesAllowed ?? 1} Vehicle
        </Text>
      </View>

      {category === 'PAYG' && (
        <View
          style={[styles.itemCont, {width: '30%', height: normalized(120)}]}>
          <View style={styles.iconCont}>
            <ClockIcon primary={colors.Primary} width={15} height={15} />
          </View>
          <Text style={[styles.keyTxt, {textAlign: 'center'}]}>Max Time</Text>
          <Text style={styles.Heading2}>
            {formatMinutesToHours(selectedPermitType?.dailyMax)}
          </Text>
        </View>
      )}

      <View style={[styles.itemCont, {width: '30%', height: normalized(120)}]}>
        <View
          style={[
            styles.iconCont,
            {
              backgroundColor:
                selectedPermitType?.extendableAmount != null
                  ? lightenHexColor(colors.Primary, 0.6)
                  : lightenHexColor(colors.Error, 0.6),
            },
          ]}>
          <ClockCheck
            color={
              selectedPermitType?.extendableAmount != null
                ? colors.Primary
                : colors.Error
            }
            size={15}
          />
        </View>
        <Text style={[styles.keyTxt, {textAlign: 'center'}]}>Extension</Text>
        <Text style={styles.Heading2}>
          {selectedPermitType?.extendableAmount != null
            ? `${formatAmountToUSD(
                selectedPermitType.extendableAmount,
              )} per hour`
            : 'Not Allowed'}
        </Text>
      </View>
    </View>
  );

  const renderEstimatedBlock = (durationMinutes?: number) => {
    const startMoment = moment();
    const endMoment =
      durationMinutes != null
        ? moment(startMoment).add(durationMinutes, 'minutes')
        : undefined;

    return (
      <View>
        <Text style={styles.estimatedTxt}>
          Estimated start:{' '}
          <Text style={styles.estimatedBoldTxt}>
            {startMoment.format('MMM D, YYYY, h:mm:ss A')}
          </Text>
        </Text>
        {endMoment && (
          <Text style={styles.estimatedTxt}>
            Estimated end:{' '}
            <Text style={styles.estimatedBoldTxt}>
              {endMoment.format('MMM D, YYYY, h:mm:ss A')}
            </Text>
          </Text>
        )}
        <Text style={styles.estimatedSubTxt}>
          Your actual start time will begin once payment is completed.
        </Text>
      </View>
    );
  };
  const renderContractDetails = () => {
    if (!selectedPermitType) return null;
    const type = selectedPermitType.type;
    const rateLine = `${formatAmountToUSD(selectedPermitType.rate)} per month`;

    if (type === 'monthly') {
      return (
        <>
          <View style={{height: normalized(10)}} />
          <Text style={styles.Input_Heading}> Start Date*</Text>
          <DateTimeComp
            mode="date"
            dateValue={startDate}
            onDateChange={(val: any) => {
              setStartDate(val);
              setErrors(prev => ({
                ...prev,
                startDate: undefined,
              }));
            }}
            placeholderDate={'Select Date'}
            error={!!errors.startDate}
          />
          <View style={{height: normalized(10)}} />

          <View style={[styles.itemCont, {marginTop: normalized(14)}]}>
            <Text style={styles.Heading1}>
              Rate: {formatAmountToUSD(selectedPermitType?.rate)} per month
            </Text>
            {renderSubBoxesRow()}
          </View>
        </>
      );
    }

    if (type === 'worker') {
      return (
        <>
          <View style={{height: normalized(10)}} />
          <Text style={styles.Input_Heading}> Start Date*</Text>
          <DateTimeComp
            mode="date"
            dateValue={startDate}
            onDateChange={(val: any) => {
              setStartDate(val);
              setErrors(prev => ({
                ...prev,
                startDate: undefined,
              }));
            }}
            placeholderDate={'Select Date'}
            error={!!errors.startDate}
          />

          <Text style={styles.Input_Heading}>Employer Name*</Text>
          <CustomInput
            placeholder="Enter Employer Name"
            value={employerName}
            setValue={setEmployerName}
            errorMsg={errors.employerName}
          />

          <Text style={styles.Input_Heading}>Work Address*</Text>
          <CustomGooglePlacesInput
            apiKey={SECRET_KEYS.GOOGLE_MAP_KEY}
            value={workAddress}
            countryRestriction={baseData?.countryCode?.toLowerCase()}
            country={baseData?.country}
            allowedCity={baseData?.city}
            restrictToCity
            onPlaceSelected={(p: any) => {
              setWorkAddress(
                p.address ?? p.formattedAddress ?? p.description ?? '',
              );
              if (errors.workAddress) {
                setErrors(prev => ({...prev, workAddress: undefined}));
              }
            }}
            error={!!errors.workAddress}
            placeholder="Search for location"
            debounceMs={800}
            minLength={2}
            maxResults={6}
          />
          <View style={{height: normalized(10)}} />
          <View style={[styles.itemCont, {marginTop: normalized(14)}]}>
            <Text style={styles.Heading1}>
              Rate: {formatAmountToUSD(selectedPermitType?.rate)}
            </Text>
            {renderSubBoxesRow()}
          </View>
        </>
      );
    }

    if (type === 'residential') {
      return (
        <>
          <Text style={styles.Input_Heading}> Start Date*</Text>
          <DateTimeComp
            mode="date"
            dateValue={startDate}
            onDateChange={(val: any) => {
              setStartDate(val);
              setErrors(prev => ({
                ...prev,
                startDate: undefined,
              }));
            }}
            placeholderDate={'Select Date'}
            error={!!errors.startDate}
          />
          <View style={{width: normalized(12)}} />
          <View style={{flex: 1}}>
            <Text style={styles.Input_Heading}>
              Proof of Residency Document Type*
            </Text>
            <CustomDropDownList
              list={DOCUMENT_TYPE_OPTIONS}
              selectedIndex={docTypeIndex}
              onChange={setDocTypeIndex}
              placeholder="Select"
              error={!!errors.docType}
            />
          </View>

          <Text style={styles.Input_Heading}>Proof of Residency Document*</Text>
          <CustomDocumentPicker
            uploading={uploading}
            progress={progress}
            type="file"
            limit={1}
            defaultValue={file ? [file] : []}
            onSelect={(obj: any) => {
              const data = obj?.[0];

              setFileError(false);

              if (!data?.uri) {
                setFile(null);
                return;
              }

              setFile({
                uri: data.uri,
                type: data.type || 'application/octet-stream',
                name: data.name || data.filename || 'attachment',
                filename: data.filename || data.name || 'attachment',
                size: data.size,
              });
            }}
            isError={!!errors?.file}
          />
          <View style={{height: normalized(10)}} />
          <View style={[styles.itemCont, {marginTop: normalized(14)}]}>
            <Text style={styles.Heading1}>
              Rate: {formatAmountToUSD(selectedPermitType?.rate)}
            </Text>
            {renderSubBoxesRow()}
          </View>
        </>
      );
    }

    return (
      <Text style={styles.rateTxt}>
        {TYPE_LABELS[type] ?? capitalize(type)} — {rateLine}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      <Stepper
        list={PP_STEPPER_LIST}
        completedSteps={[PP_STEPPER_LIST[0]]}
        activeStep={PP_STEPPER_LIST[1]}
      />

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: normalized(20),
          paddingBottom: normalized(20),
        }}>
        <View>
          <View style={{height: normalized(10)}} />

          <View style={styles.row}>
            {zoneRequired && zoneListItems.length > 0 && (
              <View style={styles.item}>
                <Text style={styles.Input_Heading}>Zone*</Text>
                <CustomDropDownList
                  list={zoneListItems}
                  selectedIndex={zoneIndex}
                  onChange={setZoneIndex}
                  placeholder="Select Zone"
                  error={!!errors.zone}
                />
              </View>
            )}

            {showTypeDropdown && (
              <View style={styles.item}>
                <Text style={styles.Input_Heading}>Type*</Text>
                <CustomDropDownList
                  list={typeListItems}
                  selectedIndex={typeIndex}
                  onChange={setTypeIndex}
                  placeholder="Select Type"
                  error={!!errors.type}
                />
              </View>
            )}
          </View>
        </View>

        {!!operatingHoursLines && (
          <View style={styles.hoursBox}>
            <Text style={styles.hoursTitle}>Operating Hours</Text>
            {operatingHoursLines.map((line, i) => (
              <Text key={i} style={styles.hoursLine}>
                {line}
              </Text>
            ))}
          </View>
        )}

        {selectedPermitType &&
          (category === 'PAYG' ? renderPaygDetails() : renderContractDetails())}

        {showTypeDropdown && typeListItems.length === 0 && (
          <Text style={styles.emptyTxt}>
            This {zoneRequired ? 'zone' : 'site'} doesn't currently offer any{' '}
            {category === 'PAYG' ? 'pay-as-you-go' : 'contract'} permit types.
          </Text>
        )}

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

export default PermitDetailScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },

    iconCont: {
      width: normalized(28),
      height: normalized(28),
      borderRadius: normalized(8),
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: lightenHexColor(colors.Primary, 0.6),
    },

    selectBox: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: colors.BorderColor,
      borderRadius: normalized(8),
      paddingHorizontal: normalized(12),
      paddingVertical: normalized(12),
      backgroundColor: colors.Background,
    },
    selectTxt: {
      flex: 1,
      color: colors.Heading_Txt,
      fontSize: normalized(14),
      fontFamily: AppFonts.UbuntuRegular,
    },

    hoursBox: {
      borderWidth: 1,
      borderColor: colors.BorderColor,
      borderRadius: normalized(10),
      padding: normalized(14),
      marginTop: normalized(14),
    },
    hoursTitle: {
      color: colors.Heading_Txt,
      fontSize: normalized(15),
      fontFamily: AppFonts.UbuntuBold,
      marginBottom: normalized(6),
    },
    hoursLine: {
      color: colors.Desc_Txt,
      fontSize: normalized(13),
      fontFamily: AppFonts.UbuntuRegular,
    },
    rateTxt: {
      marginTop: normalized(14),
      color: colors.Heading_Txt,
      fontSize: normalized(14),
      fontFamily: AppFonts.UbuntuMedium,
    },
    sessionTxt: {
      marginTop: normalized(14),
      color: colors.Heading_Txt,
      fontSize: normalized(14),
      fontFamily: AppFonts.UbuntuRegular,
    },

    estimatedTxt: {
      color: colors.Desc_Txt,
      fontSize: normalized(13),
      fontFamily: AppFonts.UbuntuRegular,
      marginTop: normalized(4),
    },
    estimatedBoldTxt: {
      color: colors.Heading_Txt,
      fontFamily: AppFonts.UbuntuBold,
    },
    estimatedSubTxt: {
      marginTop: normalized(8),
      color: colors.Desc_Txt,
      fontSize: normalized(12),
      fontFamily: AppFonts.UbuntuRegular,
      fontStyle: 'italic',
    },

    emptyTxt: {
      marginTop: normalized(14),
      color: colors.Desc_Txt,
      fontSize: normalized(13),
      fontFamily: AppFonts.UbuntuRegular,
    },
  });
