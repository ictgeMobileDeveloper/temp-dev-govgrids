import {
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../../Redux/AppStore';
import {AppStyles} from '../../../Utils/AppStyles';
import Stepper from '../../Components/Stepper';
import {
  AppFonts,
  normalized,
  PP_STEPPER_LIST,
  PPGuestoptionList,
  RIP_STEPPER_LIST,
  ScreenProps,
} from '../../../Utils/AppConstants';
import CustomButton from '../../Components/CustomButton';
import SimpleButton from '../../Components/SimpleButton';
import {Routes} from '../../../Utils/Routes';

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

const ParkingPermitGuestSubmission = (props: ScreenProps) => {
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;
  const userData = selector.residentUserData;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  const [listIndex, setListIndex] = useState<number | null>(null);

  useEffect(() => {
    if (userData?.id) {
      props.navigation.pop(1);
      props.navigation.navigate(Routes.ParkingPermit.TermsNCondi);
    }
  }, [userData?.id, listIndex]);

  const OnNext = () => {
    if (listIndex === 0) {
      props.navigation.navigate(Routes.ParkingPermit.TermsNCondi);
      return;
    }

    props.navigation.navigate(Routes.Auth.Login, {
      route: Routes.ParkingPermit.GuestSubmission,
    });
  };

  return (
    <View style={styles.container}>
      <Stepper
        list={PP_STEPPER_LIST}
        completedSteps={[
          PP_STEPPER_LIST[0],
          PP_STEPPER_LIST[1],
          PP_STEPPER_LIST[2],
        ]}
        activeStep={PP_STEPPER_LIST[3]}
      />
      <View style={{marginHorizontal: normalized(20)}}>
        <FlatList
          data={PPGuestoptionList}
          renderItem={({item, index}) => (
            <SubmitReqItem
              item={item}
              styles={styles}
              colors={colors}
              onPress={() => setListIndex(index)}
              isSelected={index === listIndex}
            />
          )}
          contentContainerStyle={{gap: normalized(10)}}
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
              <CustomButton text={'Next'} onPress={OnNext} />
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default ParkingPermitGuestSubmission;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    nextBtnCont: {
      width: '100%',
      alignSelf: 'flex-end',
    },
    boxCont: {
      flexDirection: 'column',
      flex: 1,
      borderWidth: 1,
      borderRadius: normalized(8),
      borderColor: colors.BorderColor,
      padding: normalized(8),
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
