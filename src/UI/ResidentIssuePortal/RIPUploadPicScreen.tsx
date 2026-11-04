import {Platform, StyleSheet, Text, View} from 'react-native';
import React, {useMemo, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {
  normalized,
  RIP_STEPPER_LIST,
  ScreenProps,
} from '../../Utils/AppConstants';
import SimpleButton from '../Components/SimpleButton';
import CustomButton from '../Components/CustomButton';
import Stepper from '../Components/Stepper';
import CustomDocumentPicker from '../Components/CustomDocumentPicker';
import {Routes} from '../../Utils/Routes';
import {updateRipDraft} from '../../Redux/AppReducers';

const RIPUploadPicScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const draft = selector?.ripDraft ?? {};
  const [file, setFile] = useState<any>(draft?.image ?? {});

  const dispatch = useDispatch();

  const onNext = () => {
    const data = {
      ...(selector?.ripDraft ?? {}),
      ...(props?.route?.params?.data ?? {}),
      image: file?.uri ? file : undefined,
    };

    dispatch(updateRipDraft(data));

    props?.navigation?.navigate(Routes.RIP.SubmitScreen, {data});
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
      />
      <View style={{marginHorizontal: normalized(20)}}>
        <Text style={styles.Input_Heading}>{'Upload Image (Optional)'}</Text>

        <CustomDocumentPicker
          uploading={uploading}
          progress={progress}
          type={'image'}
          useImagePickerModal
          limit={1}
          defaultValue={
            file?.uri
              ? [
                  {
                    filename: file?.name,
                    type: file?.type,
                    uri: file?.uri,
                    size: 0,
                  },
                ]
              : []
          }
          onSelect={(obj: any) => {
            const data = obj?.[0];
            if (!data?.uri) return;
            const image = {
              uri: data?.uri,
              type: data?.type ?? 'image/jpeg',
              name: data?.filename ?? data?.name ?? 'image.jpg',
            };

            setFile(image);
            dispatch(updateRipDraft({...(selector?.ripDraft ?? {}), image}));
          }}
          isError={false}
        />

        <View
          style={[
            styles.btnRow,
            {
              marginBottom:
                Platform.OS === 'android'
                  ? insects.bottom + normalized(20)
                  : normalized(20),
            },
          ]}>
          <View style={styles.nextBtnCont}>
            <SimpleButton
              text={'Back'}
              onPress={() => props?.navigation?.goBack()}
              loading={false}
            />
          </View>
          <View style={styles.nextBtnCont}>
            <CustomButton text={'Next'} onPress={onNext} loading={false} />
          </View>
        </View>
      </View>
    </View>
  );
};

export default RIPUploadPicScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    nextBtnCont: {
      width: normalized(90),
    },
    btnRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  });
