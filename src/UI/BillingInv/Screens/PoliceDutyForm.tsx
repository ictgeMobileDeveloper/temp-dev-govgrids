import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useMemo, useRef, useState} from 'react';
import {normalized, ScreenProps, AppFonts} from '../../../Utils/AppConstants';
import {useSelector, useDispatch} from 'react-redux';
import {AppRootStore} from '../../../Redux/AppStore';
import {AppStyles} from '../../../Utils/AppStyles';
import {AppStrings} from '../../../Utils/AppStrings';
import {PLACE_API_KEY, ENDPOINTS} from '../../../Network/Urls';
import {getErrorMessage} from '../../../Utils/Helper';
import {setShowToast} from '../../../Redux/AppReducers';
import {apiHandler} from '../../../Network/Services/ApiHandler';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import moment from 'moment';

import CustomInput from '../../Components/CustomInput';
import DateTimeComp from '../../Components/DateTimeComp';
import YNComp from '../../Components/YNComp';
import CustomGooglePlacesInput from '../../Components/CustomGooglePlacesInput';
import CustomButton from '../../Components/CustomButton';
import RadioComp from '../../Components/RadioComp';
import CustomHeader from '../../Components/CustomHeader';

import PlusIcon from '../../Svg/PlusIcon';
import MinusIcon from '../../Svg/MinusIcon';

type Position = {
  description: string;
  hoursRequested: string;
  errors: {
    description: string;
    hoursRequested: string;
  };
};

const initialPosition: Position = {
  description: '',
  hoursRequested: '',
  errors: {
    description: '',
    hoursRequested: '',
  },
};

const JOB_TYPE_OPTIONS = [
  {id: 1, label: 'City Contractor'},
  {id: 2, label: 'City Department'},
  {id: 3, label: 'Independent Contractor'},
];

const SubmitJobScreen = (props: ScreenProps) => {
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const isRight = selector?.language == 'ar';
  const dispatch = useDispatch();
  const scrollRef = useRef(null);
  const baseData = selector?.baseData;
  // ---------------- Fields ----------------
  const [hiringDate, setHiringDate] = useState<Date | null>(null);
  const [hiringCompany, setHiringCompany] = useState('');
  const [jobSite, setJobSite] = useState('');
  const [jobSiteSupervisor, setJobSiteSupervisor] = useState('');
  const [timeOfficerArrived, setTimeOfficerArrived] = useState<Date | null>(
    null,
  );
  const [timeOfficerQuit, setTimeOfficerQuit] = useState<Date | null>(null);
  const [totalHoursRequested, setTotalHoursRequested] = useState('');
  const [cruiserRequired, setCruiserRequired] = useState('No');
  const [projectName, setProjectName] = useState('');
  const [positions, setPositions] = useState<Position[]>([
    {...initialPosition},
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [jobType, setJobType] = useState<number | null>(null);

  // Address components captured from the place picker
  const [jobSiteCity, setJobSiteCity] = useState('');
  const [jobSiteState, setJobSiteState] = useState('');
  const [jobSiteZip, setJobSiteZip] = useState('');
  const [jobSiteCountry, setJobSiteCountry] = useState('');
  // ---------------- Errors ----------------
  const [hiringDateError, setHiringDateError] = useState('');
  const [hiringCompanyError, setHiringCompanyError] = useState('');
  const [jobSiteError, setJobSiteError] = useState('');
  const [jobSiteSupervisorError, setJobSiteSupervisorError] = useState('');
  const [timeOfficerArrivedError, setTimeOfficerArrivedError] = useState('');
  const [timeOfficerQuitError, setTimeOfficerQuitError] = useState('');
  const [jobTypeError, setJobTypeError] = useState('');
  const [projectNameError, setProjectNameError] = useState('');

  // ---------------- Helpers ----------------

  const insects = useSafeAreaInsets();

  const recalcTotalHours = (arrived: Date | null, quit: Date | null) => {
    if (arrived && quit && quit.getTime() > arrived.getTime()) {
      const diffMs = quit.getTime() - arrived.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      setTotalHoursRequested(`${diffHours.toFixed(2)} hrs`);
    } else {
      setTotalHoursRequested('');
    }
  };

  const onTimeArrivedChange = (val: Date | null) => {
    if (!val) {
      setTimeOfficerArrived(null);
      setTimeOfficerArrivedError('');
      recalcTotalHours(null, timeOfficerQuit);
      return;
    }

    setTimeOfficerArrived(val);
    setTimeOfficerArrivedError('');
    recalcTotalHours(val, timeOfficerQuit);
  };

  const onTimeQuitChange = (val: Date | null) => {
    if (!val) {
      setTimeOfficerQuit(null);
      setTimeOfficerQuitError('');
      recalcTotalHours(timeOfficerArrived, null);
      return;
    }

    if (timeOfficerArrived && val.getTime() <= timeOfficerArrived.getTime()) {
      setTimeOfficerQuitError('Quit time must be after the arrival time');
      return;
    }

    setTimeOfficerQuit(val);
    setTimeOfficerQuitError('');
    recalcTotalHours(timeOfficerArrived, val);
  };

  const addPosition = () => {
    setPositions((prev: Position[]) => [...prev, {...initialPosition}]);
  };

  const removePosition = (index: number) => {
    setPositions((prev: Position[]) => prev.filter((_, i) => i !== index));
  };

  const updatePosition = (
    index: number,
    field: 'description' | 'hoursRequested',
    value: string,
  ) => {
    setPositions((prev: Position[]) =>
      prev.map((position: Position, i: number) => {
        if (i !== index) return position;
        return {
          ...position,
          [field]: value,
          errors: {
            ...position.errors,
            [field]: '',
          },
        };
      }),
    );
  };

  const onSubmit = async () => {
    let isFormValid = true;

    if (!hiringDate) {
      setHiringDateError('Hiring date is required');
      isFormValid = false;
    }
    if (!hiringCompany) {
      setHiringCompanyError('Hiring company is required');
      isFormValid = false;
    }
    if (!jobSite) {
      setJobSiteError('Job site is required');
      isFormValid = false;
    }
    if (!jobSiteSupervisor) {
      setJobSiteSupervisorError('Job site supervisor is required');
      isFormValid = false;
    }
    if (!timeOfficerArrived) {
      setTimeOfficerArrivedError('Time officer arrived is required');
      isFormValid = false;
    }
    if (!timeOfficerQuit) {
      setTimeOfficerQuitError('Time officer quit is required');
      isFormValid = false;
    }
    if (!jobType) {
      setJobTypeError('Job type is required');
      isFormValid = false;
    }
    if (jobType === 1 && !projectName) {
      setProjectNameError('Project name is required');
      isFormValid = false;
    }

    const updatedPositions = positions.map(position => {
      const updatedErrors = {description: '', hoursRequested: ''};
      if (!position.description) {
        updatedErrors.description = 'Description is required';
        isFormValid = false;
      }

      return {...position, errors: updatedErrors};
    });
    setPositions(updatedPositions);
    console.log(isFormValid);
    if (!isFormValid) return;

    const cleanedPositions = positions.map(position => ({
      description: position.description,
      totalHoursRequested: position.hoursRequested,
    }));

    const formData = new FormData();
    formData.append('categoryId', '1');
    formData.append('city', jobSiteCity);
    formData.append('state', jobSiteState);
    formData.append('country', jobSiteCountry);
    formData.append('zipCode', jobSiteZip);
    formData.append('cruiserRequested', String(cruiserRequired === 'Yes'));
    formData.append('hiringCompany', hiringCompany);
    formData.append(
      'hiringDate',
      hiringDate ? moment(hiringDate).format('YYYY-MM-DD') : '',
    );
    formData.append('jobSiteLocation', jobSite);
    formData.append('jobSiteSupervisor', jobSiteSupervisor);
    formData.append('jobType', String(jobType));
    formData.append('platform', Platform.OS);
    formData.append('source', 'mobile');
    formData.append('projectName', projectName);
    formData.append(
      'timeOfficerArrived',
      timeOfficerArrived ? moment(timeOfficerArrived).format('HH:mm') : '',
    );
    formData.append(
      'timeOfficerQuit',
      timeOfficerQuit ? moment(timeOfficerQuit).format('HH:mm') : '',
    );
    formData.append(
      'totalHoursRequested',
      totalHoursRequested.replace(' hrs', ''),
    );
    formData.append('positions', JSON.stringify(cleanedPositions));

    setIsLoading(true);

    apiHandler({
      endpoint: ENDPOINTS.submitJobForm,
      method: 'POST',
      payload: formData,
      authContext: 'DAM',
      isFormData: true,
      useRecaptcha: true,

      onComplete: (resp: any) => {
        if (resp?.status) {
          setIsLoading(false);
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.success,
              message: resp?.data?.message ?? 'Job submitted successfully.',
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
        text={'Submit Form'}
      />
      <KeyboardAwareScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
        contentContainerStyle={{
          gap: normalized(12),
          paddingHorizontal: normalized(15),
          paddingBottom: normalized(12),
        }}>
        {/* Row: Hiring Date / Hiring Company */}
        <View style={[styles.Input_Row, {flexDirection: 'row'}]}>
          <View style={{flex: 1}}>
            <Text style={styles.Input_Heading}>
              Hiring Date
              <Text style={{color: colors.Error}}> *</Text>
            </Text>
            <DateTimeComp
              mode="date"
              dateValue={hiringDate}
              onDateChange={(val: any) => {
                setHiringDate(val);
                setHiringDateError('');
              }}
              placeholderDate={'Select Date'}
              errorMsg={hiringDateError}
            />
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.Input_Heading}>
              Hiring Company
              <Text style={{color: colors.Error}}> *</Text>
            </Text>
            <CustomInput
              placeholder={'Enter Hiring Company'}
              value={hiringCompany}
              setValue={(val: any) => {
                setHiringCompany(val);
                setHiringCompanyError('');
              }}
              errorMsg={hiringCompanyError}
              isRight={isRight}
            />
          </View>
        </View>

        {/* Row: Job Site (Google Places) */}
        <View>
          <Text style={styles.Input_Heading}>
            Job Site
            <Text style={{color: colors.Error}}> *</Text>
          </Text>
          <CustomGooglePlacesInput
            apiKey={PLACE_API_KEY}
            value={jobSite}
            restrictToCity
            allowedCity={baseData?.city}
            country={baseData?.country}
            onChangeText={(address: string) => {
              setJobSite(address);
              setJobSiteError('');
            }}
            onPlaceSelected={(place: any) => {
              setJobSite(place?.address ?? '');
              setJobSiteCity(place?.city ?? '');
              setJobSiteState(place?.state ?? '');
              setJobSiteZip(place?.zipCode ?? '');
              setJobSiteCountry(place?.country ?? '');
              setJobSiteError('');
            }}
            placeholder="Search Job Site"
            placeholderColor={jobSiteError ? colors.Error : colors.Desc_Txt}
            debounceMs={300}
            minLength={2}
            maxResults={6}
            inputStyle={[
              styles.placesInput,
              {
                backgroundColor: jobSiteError
                  ? colors.redLight
                  : colors.Background,
                borderColor: jobSiteError ? colors.Error : colors.BorderColor,
              },
            ]}
          />
        </View>

        {/* Row: Job Site Supervisor / Time Officer Arrived */}
        <View
          style={[
            styles.Input_Row,
            {flexDirection: isRight ? 'row-reverse' : 'row'},
          ]}>
          <View style={{flex: 1}}>
            <Text style={styles.Input_Heading}>
              Job Site Supervisor
              <Text style={{color: colors.Error}}> *</Text>
            </Text>
            <CustomInput
              placeholder={'Enter Supervisor Name'}
              value={jobSiteSupervisor}
              setValue={(val: any) => {
                setJobSiteSupervisor(val);
                setJobSiteSupervisorError('');
              }}
              errorMsg={jobSiteSupervisorError}
              isRight={isRight}
            />
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.Input_Heading}>
              Time Officer Arrived
              <Text style={{color: colors.Error}}> *</Text>
            </Text>
            <DateTimeComp
              mode="time"
              timeValue={timeOfficerArrived}
              onTimeChange={onTimeArrivedChange}
              placeholderTime={'Select Time'}
              errorMsg={timeOfficerArrivedError}
            />
          </View>
        </View>

        {/* Row: Time Officer Quit / Total Hours Requested */}
        <View
          style={[
            styles.Input_Row,
            {flexDirection: isRight ? 'row-reverse' : 'row'},
          ]}>
          <View style={{flex: 1}}>
            <Text style={styles.Input_Heading}>
              Time Officer Quit
              <Text style={{color: colors.Error}}> *</Text>
            </Text>
            <DateTimeComp
              mode="time"
              timeValue={timeOfficerQuit}
              onTimeChange={onTimeQuitChange}
              placeholderTime={'Select Time'}
              errorMsg={timeOfficerQuitError}
            />
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.Input_Heading}>Total Hours Requested</Text>
            <CustomInput
              placeholder={'-'}
              value={totalHoursRequested}
              isEditable={false}
              isRight={isRight}
            />
          </View>
        </View>

        {/* Row: Cruiser Required (switch) */}
        <View>
          <Text style={styles.Input_Heading}>
            Cruiser Required
            <Text style={{color: colors.Error}}> *</Text>
          </Text>
          <YNComp
            selectedValue={cruiserRequired}
            options={['Yes', 'No']}
            onSelect={(val: any) => setCruiserRequired(val)}
            itemStyle={{flexDirection: isRight ? 'row-reverse' : 'row'}}
          />
        </View>

        {/* Row: Job Type */}
        <View>
          <Text style={styles.Input_Heading}>
            Job Type
            <Text style={{color: colors.Error}}> *</Text>
          </Text>
          <View style={{gap: normalized(8), marginTop: normalized(4)}}>
            {JOB_TYPE_OPTIONS.map((option, index) => (
              <RadioComp
                key={option.id}
                item={{id: index, txt: option.label}}
                selected={{
                  id: JOB_TYPE_OPTIONS.findIndex(o => o.id === jobType),
                }}
                onPress={() => {
                  setJobType(option.id);
                  setJobTypeError('');
                }}
              />
            ))}
          </View>
          {!!jobTypeError && (
            <Text style={styles.errorTxt}>{jobTypeError}</Text>
          )}
        </View>

        {/* Row: Project Name */}
        <View>
          <Text style={styles.Input_Heading}>
            Project Name
            <Text style={{color: colors.Error}}> *</Text>
          </Text>
          <CustomInput
            placeholder={'Enter Project Name'}
            value={projectName}
            setValue={(val: any) => {
              setProjectName(val);
              setProjectNameError('');
            }}
            errorMsg={projectNameError}
            isRight={isRight}
          />
        </View>

        {/* Position section */}
        <View
          style={[
            styles.rowCont,
            {
              marginLeft: isRight ? normalized(20) : 0,
              marginRight: isRight ? 0 : normalized(20),
              flexDirection: isRight ? 'row-reverse' : 'row',
            },
          ]}>
          <Text style={styles.Input_Heading}>Position</Text>
        </View>

        {positions.map((position, index) => (
          <View key={index}>
            <View
              style={[
                styles.rowCont,
                {marginTop: index > 0 ? normalized(12) : 0},
              ]}>
              <Text style={[styles.positionTxt, {flex: 1}]}>
                {`Position ${index + 1}`}
              </Text>
              {index > 0 && (
                <TouchableOpacity onPress={() => removePosition(index)}>
                  <MinusIcon />
                </TouchableOpacity>
              )}
            </View>

            <View
              style={[
                styles.Input_Row,
                {flexDirection: isRight ? 'row-reverse' : 'row'},
              ]}>
              <View style={{flex: 1}}>
                <Text style={styles.Input_Heading}>
                  Description
                  <Text style={{color: colors.Error}}> *</Text>
                </Text>
                <CustomInput
                  placeholder={'Enter Description'}
                  value={position.description}
                  setValue={(val: string) =>
                    updatePosition(index, 'description', val)
                  }
                  errorMsg={position.errors.description}
                  isRight={isRight}
                />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.Input_Heading}>
                  Hours Requested
                  <Text style={{color: colors.Error}}> *</Text>
                </Text>
                <CustomInput
                  placeholder={'-'}
                  value={totalHoursRequested}
                  isEditable={false}
                  isRight={isRight}
                />
              </View>
            </View>
          </View>
        ))}

        {/* Add position button */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={addPosition}
          style={[
            styles.addPositionRow,
            {flexDirection: isRight ? 'row-reverse' : 'row'},
          ]}>
          <PlusIcon />
          <Text style={styles.addPositionTxt}>Add Position</Text>
        </TouchableOpacity>

        <View
          style={[
            styles.nextBtnCont,
            {alignSelf: isRight ? 'flex-start' : 'flex-end'},
          ]}>
          <CustomButton
            text={'Submit'}
            onPress={onSubmit}
            loading={isLoading}
          />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default SubmitJobScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    nextBtnCont: {
      width: normalized(90),
      marginTop: normalized(20),
      marginBottom: normalized(20),
    },
    rowCont: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: normalized(16),
      marginBottom: normalized(6),
    },
    positionTxt: {
      fontSize: normalized(16),
      fontFamily: AppFonts.UbuntuMedium,
      color: colors.Primary,
    },
    placesInput: {
      borderWidth: 1,
      height: normalized(45),
      borderRadius: normalized(8),
      backgroundColor: colors.Background,
    },
    errorTxt: {
      marginTop: normalized(3),
      color: colors.ToastColors?.Error ?? colors.Error,
      fontSize: normalized(12),
      fontFamily: AppFonts.UbuntuRegular,
    },
    addPositionRow: {
      alignItems: 'center',
      gap: normalized(8),
      marginTop: normalized(10),
      marginBottom: normalized(10),
    },
    addPositionTxt: {
      fontSize: normalized(14),
      fontFamily: AppFonts.UbuntuMedium,
      color: colors.Primary,
    },
  });
