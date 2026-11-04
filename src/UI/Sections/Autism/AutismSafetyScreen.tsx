import {
  ActivityIndicator,
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
import {
  AppColors,
  AppFonts,
  AppImages,
  normalized,
  ScreenProps,
} from '../../../Utils/AppConstants';
import I18n from 'i18n-js';
import en from '../../../assets/translation/en.json';
import es from '../../../assets/translation/es.json';
import ar from '../../../assets/translation/ar.json';
import it from '../../../assets/translation/it.json';
import pl from '../../../assets/translation/pl.json';
import BackArrowIcon from '../../Svg/BackArrowIcon';
import LanguageComp from '../../Components/LanguageComp';
import {AutismStack} from '../../../Navigation/AutismStack';
import {setIsAutismPopped, setLanguage} from '../../../Redux/AppReducers';
import {Routes} from '../../../Utils/Routes';
import LinearGradient from 'react-native-linear-gradient';
import OfflineIcon from '../../Svg/OfflineIcon';

const AutismSafetyScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors, insects)}),
    [colors],
  );

  const dispatch = useDispatch();
  I18n.fallbacks = true;

  I18n.translations = {
    en: en,
    es: es,
    ar: ar,
    it: it,
    pl: pl,
  };
  // ----------------------->>>>>>>>  data states

  const [heightInches, setHeightInches] = useState('');
  const [communicationArray, setCommunicationArray] = useState([]);
  const [sensitiveArray, setSensitiveArray] = useState([]);
  const [dislikeArray, setDislikeArray] = useState([]);
  const [behaviorArray, setBehaviorArray] = useState<any>([]);
  const initialGuardian = {
    guardianFirstName: '',
    guardianMiddleName: '',
    guardianLastName: '',
    guardianEmail: '',
    guardianPhoneNumber: '',
    guardianAddress: '',
    errors: {
      guardianFirstName: '',
      guardianLastName: '',
      guardianEmail: '',
      guardianPhoneNumber: '',
      guardianAddress: '',
    },
  };

  const [selectedLanguage, setSelectedLanguage] = useState(selector?.language);
  I18n.locale = selectedLanguage;
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    if (selector?.isAutismPopped) {
      props?.navigation?.goBack();
      dispatch(setIsAutismPopped(false));
    }
  }, [selector?.isAutismPopped]);

  return (
    <View style={[styles.container, styles.safeArea]}>
      <View
        style={[
          styles.headerContainer,
          {
            flexDirection: selectedLanguage == 'ar' ? 'row-reverse' : 'row',
          },
        ]}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            props?.navigation?.goBack();
            dispatch(setLanguage('en'));
          }}
          style={
            selectedLanguage === 'ar' ? {transform: [{scaleX: -1}]} : undefined
          }>
          <BackArrowIcon
            primary={selector?.isDarkTheme ? colors.Desc_Txt : '#2E2F30'}
          />
        </TouchableOpacity>

        <Text
          style={[
            styles.headerTxt,
            {
              textAlign: selectedLanguage == 'ar' ? 'right' : 'left',
            },
          ]}>
          {I18n.t('FORM_TITLE')}
        </Text>

        <LinearGradient
          colors={[colors.Primary, colors.Secondary]}
          style={[
            styles.sidePanelCont,
            {
              width: normalized(30),
              height: normalized(30),
            },
          ]}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() =>
              props?.navigation?.navigate(Routes.AutismSafety.OfflineReqScreen)
            }>
            <OfflineIcon />
          </TouchableOpacity>
        </LinearGradient>

        <LanguageComp
          selectedLanguage={selectedLanguage}
          onChangeLanguage={(lang: any) => {
            setSelectedLanguage(lang);
            dispatch(setLanguage(lang));
          }}
          AppImages={AppImages}
          styles={styles}
        />
      </View>

      {showLoader ? (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: AppColors.White,
          }}>
          <ActivityIndicator size="large" color={colors.Primary} />
        </View>
      ) : (
        <AutismStack key={selectedLanguage} language={selectedLanguage} />
      )}
    </View>
  );
};

export default AutismSafetyScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    headerContainer: {
      width: '100%',
      height: normalized(52),
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: normalized(10),
      flexDirection: 'row',
      paddingHorizontal: normalized(20),
      borderWidth: 1,
      borderTopColor: 'transparent',
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderBottomColor: colors.BorderColor,
      fontFamily: AppFonts.UbuntuSemiBold,
    },
    headerTxt: {
      fontSize: normalized(20),
      color: colors.Heading_Txt,
      flex: 1,
    },
    rightCont: {
      flexDirection: 'row',
      gap: normalized(8),
      borderRadius: normalized(45 / 2),
      justifyContent: 'flex-start',
      alignItems: 'center',
    },

    divider: {
      backgroundColor: colors.Grey_2,
      height: 1,
    },
    menuStyle: {
      padding: normalized(5),
      width: normalized(100),
      borderRadius: normalized(8),
    },
    menuIcon: {
      resizeMode: 'contain',
      width: normalized(30),
      height: normalized(30),
    },
    menuIcontwo: {
      resizeMode: 'contain',
      width: normalized(20),
      height: normalized(20),
    },
    menuTxt: {
      color: colors.Black,
      fontSize: normalized(12),
      fontWeight: '400',
    },
    submitBtnCont: {
      width: normalized(90),
      alignSelf: 'flex-end',
    },
    infoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(10),
      marginTop: normalized(5),
      flex: 1,
    },
    checkboxTxt: {
      color: '#595D62',
      fontSize: normalized(12),
      fontFamily: AppFonts.InterRegular,
    },
    guardianTxt: {
      fontSize: normalized(18),
      fontFamily: AppFonts.UbuntuMedium,
      color: colors.Primary,
    },
    simpleTxt: {
      fontSize: normalized(14),
      fontFamily: AppFonts.UbuntuRegular,
      color: colors.Heading,
    },
  });
