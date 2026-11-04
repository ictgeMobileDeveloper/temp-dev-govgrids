import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useMemo, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import Stepper from '../Components/Stepper';
import {
  AppFonts,
  normalized,
  RIP_STEPPER_LIST,
  ScreenProps,
} from '../../Utils/AppConstants';
import CustomButton from '../Components/CustomButton';
import SimpleButton from '../Components/SimpleButton';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../Network/Urls';
import {setisRIPPopped, setShowToast} from '../../Redux/AppReducers';
import {AppStrings} from '../../Utils/AppStrings';
import {getErrorMessage} from '../../Utils/Helper';
import {Routes} from '../../Utils/Routes';
import {clearRipDraft} from '../../Redux/AppReducers';
import {
  buildRipAnswers,
  getFieldKey,
  getFiles,
  normalizeDynamicFields,
  toUploadFile,
} from '../dynamic_form_shared/DynamicFormCore';

const SubmitReqItem = ({
  item,
  styles,
  colors,
  isSelected = true,
  onPress,
}: any) => {
  return (
    <TouchableOpacity
      style={styles.boxCont}
      activeOpacity={1}
      onPress={onPress}>
      <View
        style={[
          styles.circle,
          {
            borderWidth: isSelected ? 4 : 1,
            borderColor: isSelected ? colors.Primary : colors.Heading_Txt,
          },
        ]}
      />
      <Text style={styles.headint}>{item?.title}</Text>
      <Text
        style={[
          styles.Desc_Txt,
          {textAlign: 'left', fontSize: normalized(12)},
        ]}>
        {item?.description}
      </Text>
    </TouchableOpacity>
  );
};

const RIPSubmitScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const dispatch = useDispatch();
  const draft = selector?.ripDraft ?? {};
  const [listIndex, setListIndex] = useState(null);
  const data = {
    ...draft,
    ...(props?.route?.params?.data ?? {}),
  };
  const userData = selector?.residentUserData;
  const [submitLoading, setSubmitLoading] = useState(false);

  const baseData = selector?.baseData || {};

  const cityName = baseData?.cityName || 'City Name';

  const optionList = [
    {
      id: 1,
      type: 'guest',
      title: 'Submit as a guest',
      description:
        'You can file this request without creating an account. However, you won’t be able to track its status or receive updates.',
    },
    {
      id: 2,
      type: 'anonymouse',
      title: 'Remain anonymous',
      description:
        'Your personal details, including username and email, will not be visible to the public or shared with the city.',
    },
    {
      id: 3,
      type: 'yourself',
      title: 'Submit as yourself',
      description: `Your username will be publicly visible and your email address will be shared with the ${cityName}.`,
    },
  ];

  const buildFullFormDataFromParams = () => {
    const formData = new FormData();
    const answerFields =
      data?.requestCategory?.questions && data?.rawAnswers
        ? normalizeDynamicFields(data.requestCategory.questions)
        : [];

    if (answerFields.length && data?.rawAnswers) {
      const answers = buildRipAnswers(answerFields, data.rawAnswers);

      answerFields.forEach((field: any, index: number) => {
        formData.append(`answers[${index}][question]`, String(field.id));

        if (field.type === 'file') {
          getFiles(data.rawAnswers[getFieldKey(field)]).forEach(
            (file: any, fileIndex: number) => {
              const uploadFile = toUploadFile(file);
              if (!uploadFile) return;
              formData.append(
                `answers[${index}][file][${fileIndex}]`,
                uploadFile,
              );
            },
          );
          return;
        }

        const answer = Array.isArray(answers[index]?.answer)
          ? answers[index].answer.join(', ')
          : answers[index]?.answer ?? '';

        formData.append(`answers[${index}][answer]`, answer);
      });
    } else {
      (data.answers ?? []).forEach((item: any, index: any) => {
        formData.append(`answers[${index}][question]`, item.question);

        const answer = Array.isArray(item.answer)
          ? item.answer.join(', ')
          : item.answer ?? '';

        formData.append(`answers[${index}][answer]`, answer);
      });
    }

    formData.append(
      'requestCategory',
      data?.requestCategory?.id?.toString() || '',
    );
    formData.append('address', data?.address || '');
    formData.append('city', data?.city || '');
    formData.append('state', data?.state || '');
    formData.append('country', data?.country || 'United States');
    formData.append('zipCode', data?.zipCode || '');
    formData.append('description', data?.description || '');
    formData.append(
      'addressCoords[lat]',
      data?.location?.lat?.toString() || '',
    );
    formData.append(
      'addressCoords[lng]',
      data?.location?.lng?.toString() || '',
    );
    formData.append(
      'submitAs',
      listIndex == 0 ? 'guest' : listIndex == 1 ? 'hideIdentity' : 'yourself',
    );
    formData.append('source', 'mobile');
    formData.append('platform', Platform.OS);

    const images = Array.isArray(data?.images)
      ? data.images
      : Array.isArray(data?.image)
      ? data.image
      : [];

    images.forEach((img: any, index: number) => {
      if (!img?.uri) return;

      const uploadImage = toUploadFile({
        ...img,
        type: img.type || 'image/jpeg',
        name: img.name || img.filename || `image-${index}.jpg`,
      });
      if (uploadImage) {
        formData.append(`image[${index}]`, uploadImage);
      }
    });
    return formData;
  };

  const onSubmit = () => {
    if ((listIndex == 1 || listIndex == 2) && !userData?.id) {
      props?.navigation?.navigate(Routes.Auth.Login, {
        route: Routes.RIP.SubmitScreen,
      });
      return;
    }
    const formData = buildFullFormDataFromParams();

    setSubmitLoading(true);
    apiHandler({
      endpoint: ENDPOINTS.submitRequest,
      method: 'POST',
      token: listIndex == 1 || listIndex == 2 ? userData?.token : '',
      payload: formData,
      isFormData: true,
      authContext: 'RESIDENT',
      onComplete: (resp: any) => {
        if (resp?.status) {
          props?.navigation?.pop(5);
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.success,
              message: resp?.message
                ? resp?.message
                : 'Request Submit Successfully',
            }),
          );
          dispatch(setisRIPPopped(true));
          setSubmitLoading(false);
          dispatch(clearRipDraft());
        } else {
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.error,
              message: getErrorMessage(resp),
            }),
          );
          setSubmitLoading(false);
        }
      },
    });
  };

  return (
    <View style={styles.container}>
      <Stepper
        list={RIP_STEPPER_LIST}
        completedSteps={[
          RIP_STEPPER_LIST[0],
          RIP_STEPPER_LIST[1],
          RIP_STEPPER_LIST[2],
        ]}
        activeStep={RIP_STEPPER_LIST[3]}
        isLastItem={true}
      />
      <View style={{marginHorizontal: normalized(20)}}>
        <FlatList
          data={optionList}
          numColumns={2}
          columnWrapperStyle={{gap: normalized(10)}}
          contentContainerStyle={{gap: normalized(10)}}
          renderItem={({item, index}: any) => {
            return (
              <SubmitReqItem
                item={item}
                styles={styles}
                colors={colors}
                onPress={() => setListIndex(index)}
                isSelected={index == listIndex}
              />
            );
          }}
        />

        <View style={styles.btnRow}>
          <View style={styles.nextBtnCont}>
            <SimpleButton
              text={'Back'}
              onPress={() => props?.navigation?.goBack()}
              loading={false}
            />
          </View>
          {listIndex != null && (
            <View style={styles.nextBtnCont}>
              <CustomButton
                text={
                  (listIndex == 1 || listIndex == 2) && !userData?.id
                    ? 'Login'
                    : 'Submit'
                }
                onPress={onSubmit}
                loading={submitLoading}
              />
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default RIPSubmitScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    nextBtnCont: {
      width: normalized(90),
      alignSelf: 'flex-end',
    },
    boxCont: {
      borderWidth: 1,
      borderRadius: normalized(8),
      borderColor: colors.BorderColor,
      justifyContent: 'center',
      padding: normalized(8),
      flex: 1,
    },
    circle: {
      width: normalized(16),
      height: normalized(16),
      borderRadius: normalized(24),
      marginBottom: normalized(8),
    },
    btnRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    headint: {
      color: colors.Heading_Txt,
      fontFamily: AppFonts.UbuntuSemiBold,
      fontSize: normalized(14),
    },
  });
