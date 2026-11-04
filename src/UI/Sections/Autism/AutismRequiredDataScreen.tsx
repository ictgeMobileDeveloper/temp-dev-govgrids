import {Animated, ScrollView, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {AppRootStore} from '../../../Redux/AppStore';
import {AppStyles} from '../../../Utils/AppStyles';
import {
  AUTISM_STEPPER_LIST,
  normalized,
  ScreenProps,
} from '../../../Utils/AppConstants';
import I18n from 'i18n-js';
import en from '../../../assets/translation/en.json';
import es from '../../../assets/translation/es.json';
import ar from '../../../assets/translation/ar.json';
import it from '../../../assets/translation/it.json';
import pl from '../../../assets/translation/pl.json';
import CustomInput from '../../Components/CustomInput';
import CustomDocumentPicker from '../../Components/CustomDocumentPicker';
import CustomButton from '../../Components/CustomButton';
import SimpleButton from '../../Components/SimpleButton';
import Stepper from '../../Components/Stepper';
import {Routes} from '../../../Utils/Routes';
import {useIsFocused} from '@react-navigation/native';
import {updateAutismDraft} from '../../../Redux/AppReducers';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';

const AutismRequiredDataScreen = (props: ScreenProps) => {
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const dispatch = useDispatch();
  const draft = selector?.autismDraft ?? {};
  const scrollRef = useRef(null);
  const IdenfifyMarksRef = useRef(null);
  const isRight = selector?.language == 'ar';
  I18n.locale = selector?.language;
  I18n.fallbacks = true;
  I18n.translations = {
    en: en,
    es: es,
    ar: ar,
    it: it,
    pl: pl,
  };

  const focusNextField = (inputRef: any) => {
    if (inputRef?.current) {
      inputRef?.current?.focus();
    }
  };

  const [wornItems, setWornItems] = useState(draft.wornItems ?? '');
  const [identifyingMarks, setIdentifyingMarks] = useState(
    draft.identifyingMarks ?? '',
  );
  const [image, setImage] = useState<any[]>(
    Array.isArray(draft.image)
      ? draft.image
      : draft.photoGraph
      ? [draft.photoGraph]
      : [],
  );
  const [selectedLanguage, setSelectedLanguage] = useState(selector?.language);

  const [wornItemsError, setWornItemsError] = useState('');
  const [IdentifyingMarksError, setIdentifyingMarksError] = useState('');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    dispatch(
      updateAutismDraft({
        wornItems,
        identifyingMarks,
        image,
        photoGraph: image?.[0],
      }),
    );
  }, [wornItems, identifyingMarks, image, dispatch]);

  const onNext = async () => {
    let isFormValid = true;

    if (!wornItems?.trim()) {
      setWornItemsError('...');
      isFormValid = false;
    }

    if (!identifyingMarks?.trim()) {
      setIdentifyingMarksError('...');
      isFormValid = false;
    }

    const selectedImage = Array.isArray(image) ? image?.[0] : image;

    if (!selectedImage?.uri) {
      setImageError(true);
      isFormValid = false;
    }

    if (!isFormValid) {
      return;
    }

    const cleanImage = {
      ...selectedImage,
    };

    delete cleanImage.size;

    const obj = {
      wornItems,
      identifyingMarks,
      image: [cleanImage],
      photoGraph: cleanImage,
    };

    const data = {
      ...(selector?.autismDraft ?? {}),
      ...(props?.route?.params?.data ?? {}),
      ...obj,
    };

    dispatch(updateAutismDraft(data));

    props?.navigation?.navigate(Routes.AutismSafety.FeaturesScreen, {
      data,
    });
  };
  const translatedStepperList = useMemo(() => {
    const order: string[] = I18n.t('AUTISM_STEPPER.ORDER') || [];
    return order.map(key => I18n.t(`AUTISM_STEPPER.${key}`));
  }, [selector?.language]);

  return (
    <View style={{flex: 1, backgroundColor: colors.Background}}>
      <Stepper
        list={translatedStepperList}
        completedSteps={[translatedStepperList[0]]}
        activeStep={translatedStepperList[1]}
        isRight={isRight}
      />
      <KeyboardAwareScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
        contentContainerStyle={{
          paddingHorizontal: normalized(20),
          paddingBottom: normalized(12),
        }}>
        <View style={{flex: 1}}>
          <Text
            style={[
              styles.Input_Heading,
              {
                textAlign: isRight ? 'right' : 'left',
              },
            ]}>
            {I18n.t('LABELS_WORN_ITEMS')}
            <Text style={{color: colors.Error}}> *</Text>
          </Text>
          <CustomInput
            placeholder={I18n.t('WORN_ITEMS_PLACEHOLDER')}
            isMultiLine
            onSubmitEditing={() => focusNextField(IdenfifyMarksRef)}
            value={wornItems}
            setValue={(val: string) => {
              setWornItems(val);
              setWornItemsError('');
            }}
            errorMsg={wornItemsError}
            isRight={isRight}
          />
        </View>

        <View style={{flex: 1}}>
          <Text
            style={[
              styles.Input_Heading,
              {
                textAlign: isRight ? 'right' : 'left',
              },
            ]}>
            {I18n.t('LABELS_IDENTIFICATION_MARKS')}
            <Text style={{color: colors.Error}}> *</Text>
          </Text>
          <CustomInput
            placeholder={I18n.t('IDENTIFICATION_MARKS_PLACEHOLDER')}
            isMultiLine
            ref={IdenfifyMarksRef}
            value={identifyingMarks}
            setValue={(val: string) => {
              setIdentifyingMarks(val);
              setIdentifyingMarksError('');
            }}
            errorMsg={IdentifyingMarksError}
            isRight={isRight}
          />
        </View>

        <Animated.View
          style={{
            flex: 1,
          }}>
          <Text
            style={[
              styles.Input_Heading,
              {
                textAlign: isRight ? 'right' : 'left',
              },
            ]}>
            {I18n.t('UPLOAD_IMAGES')}
            <Text style={{color: colors.Error}}> *</Text>
          </Text>
          <CustomDocumentPicker
            language={selectedLanguage}
            text1={I18n.t('CHOOSE_IMAGES_TO_UPLOAD')}
            text2={I18n.t('ATTACH_UP_TO_1_FILE_20MB')}
            type={'image'}
            limit={1}
            defaultValue={image?.length > 0 ? image : []}
            maxSize={20 * 1000000}
            onSelect={(obj: any) => {
              const files = Array.isArray(obj) ? obj : obj ? [obj] : [];

              setImage(files);
              setImageError(false);

              dispatch(
                updateAutismDraft({
                  image: files,
                  photoGraph: files?.[0],
                }),
              );
            }}
            isError={imageError}
          />
        </Animated.View>
        <View
          style={[
            styles.btnRow,
            {
              flexDirection: isRight ? 'row-reverse' : 'row',
            },
          ]}>
          <View style={styles.nextBtnCont}>
            <SimpleButton
              text={I18n.t('BACK')}
              onPress={() => props?.navigation?.goBack()}
              loading={false}
            />
          </View>
          <View style={styles.nextBtnCont}>
            <CustomButton
              text={I18n.t('NEXT')}
              onPress={onNext}
              loading={false}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default AutismRequiredDataScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    nextBtnCont: {
      width: normalized(90),
    },
    btnRow: {
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  });
