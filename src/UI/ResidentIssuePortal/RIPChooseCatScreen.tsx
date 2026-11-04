import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
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
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../Network/Urls';
import {
  clearRipDraft,
  setisRIPPopped,
  setShowToast,
} from '../../Redux/AppReducers';
import {AppStrings} from '../../Utils/AppStrings';
import {getErrorMessage} from '../../Utils/Helper';
import CustomDropDownList from '../Components/CustomDropDownList';
import CustomButton from '../Components/CustomButton';
import {Routes} from '../../Utils/Routes';
import {updateRipDraft} from '../../Redux/AppReducers';
import CustomDocumentPicker from '../Components/CustomDocumentPicker';
import CustomInput from '../Components/CustomInput';
import {serializeDynamicValue} from '../dynamic_form_shared/DynamicFormCore';

const RIPChooseCatScreen = (props: ScreenProps) => {
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [catList, setCatList] = useState([]);
  const draft = selector?.ripDraft ?? {};

  const [catIndex, setCatIndex] = useState(null);
  const [selectedCat, setSelectedCat] = useState(
    draft?.requestCategory ?? null,
  );
  const [catError, setCatError] = useState(false);
  const [image, setImage] = useState<any[]>(draft?.image ?? []);
  const [imageError, setImageError] = useState(false);
  const [description, setDescription] = useState(draft?.description ?? '');
  const [descriptionError, setDescriptionError] = useState('');

  useEffect(() => {
    const unsubscribe = props.navigation.addListener('beforeRemove', e => {
      const actionType = e.data.action.type;

      if (
        actionType === 'GO_BACK' ||
        actionType === 'POP' ||
        actionType === 'POP_TO_TOP'
      ) {
        dispatch(clearRipDraft());
      }
    });

    return unsubscribe;
  }, [props.navigation, dispatch]);

  const onNext = () => {
    let hasError = false;

    if (!selectedCat?.id) {
      setCatError(true);
      hasError = true;
    }

    if (!String(description ?? '').trim()) {
      setDescriptionError('Description is required');
      hasError = true;
    }

    if (hasError) return;

    const data = {
      ...draft,
      requestCategory: selectedCat,
      image,
      photoGraph: image?.[0],
      description: description.trim(),
    };

    const serializableData = serializeDynamicValue(data);

    dispatch(updateRipDraft(serializableData));

    props?.navigation?.navigate(Routes.RIP.submitReqDetail, {
      data: serializableData,
    });
  };

  const fetchCatList = useCallback(() => {
    const payload = {
      page: 1,
      pageSize: 'all',
      type: '[Resident Issue Portal]  Load Requests Categories',
    };
    setIsLoading(true);
    apiHandler({
      endpoint: ENDPOINTS.RIPCatList,
      method: 'GET',
      payload,
      authContext: 'RESIDENT',
      onComplete: (resp: any) => {
        if (resp?.status) {
          const categories = resp?.data?.data || [];
          setCatList(categories);

          if (draft?.requestCategory?.id) {
            const draftIndex = categories.findIndex(
              (item: any) => item?.id === draft.requestCategory.id,
            );

            if (draftIndex >= 0) {
              setCatIndex(draftIndex);
            }
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
        }
      },
    });
  }, [dispatch, draft?.requestCategory?.id]);
  useEffect(() => {
    fetchCatList();
  }, [fetchCatList]);

  useEffect(() => {
    if (selector?.isRIPPopped) {
      props?.navigation?.goBack();
      dispatch(setisRIPPopped(false));
    }
  }, [dispatch, props?.navigation, selector?.isRIPPopped]);

  return (
    <View style={styles.container}>
      <Stepper
        list={RIP_STEPPER_LIST}
        completedSteps={[]}
        activeStep={RIP_STEPPER_LIST[0]}
      />

      {isLoading ? (
        <View style={styles.loaderCont}>
          <ActivityIndicator color={colors.Primary} size={'large'} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: normalized(20),
            paddingBottom: normalized(40),
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.Input_Heading}>{'Select Category'}</Text>
          <CustomDropDownList
            list={catList.map(o => o.title)}
            selectedIndex={catIndex}
            onChange={i => {
              setCatIndex(i);
              setSelectedCat(catList[i]);
              setCatError(false);
            }}
            placeholder="Choose Category"
            error={catError}
          />

          <Text style={styles.Input_Heading}>{'Pictures'}</Text>
          <CustomDocumentPicker
            text1={'Choose Image to upload'}
            text2={'Attach image upto 20 MB'}
            type={'image'}
            limit={5}
            defaultValue={image?.length > 0 ? image : []}
            maxSize={20 * 1000000}
            onSelect={(obj: any) => {
              const files = Array.isArray(obj) ? obj : obj ? [obj] : [];

              setImage(files);
              setImageError(false);

              dispatch(
                updateRipDraft(
                  serializeDynamicValue({
                    image: files,
                    photoGraph: files?.[0],
                  }),
                ),
              );
            }}
            isError={imageError}
          />

          <Text style={styles.Input_Heading}>{'Description *'}</Text>
          <CustomInput
            placeholder="Enter description"
            value={description}
            setValue={(val: string) => {
              setDescription(val);
              setDescriptionError('');
            }}
            isMultiLine
            errorMsg={descriptionError}
          />

          <View style={styles.nextBtnCont}>
            <CustomButton text={'Next'} onPress={onNext} loading={false} />
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default RIPChooseCatScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    middleTownInfoCont: {
      borderWidth: 1,
      borderColor: colors.BorderColor,
      backgroundColor: colors.ScreenBackground,
      borderRadius: normalized(8),
      paddingVertical: normalized(12),

      paddingHorizontal: normalized(5),
    },

    middleTownInfoTxt: {
      fontSize: normalized(13),
      color: colors.Desc_Txt,
      fontFamily: AppFonts.UbuntuMedium,
      lineHeight: normalized(18),
    },
    loaderCont: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },

    errorTxt: {
      color: colors.ToastColors?.Error ?? colors.Error,
      fontSize: normalized(12),
      fontFamily: AppFonts.UbuntuRegular,
      marginTop: normalized(4),
    },
  });
