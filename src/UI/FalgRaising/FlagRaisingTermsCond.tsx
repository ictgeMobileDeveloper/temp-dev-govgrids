import {
  ActivityIndicator,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {normalized, ScreenProps} from '../../Utils/AppConstants';
import CustomHeader from '../Components/CustomHeader';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {WebView} from 'react-native-webview';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {setShowToast} from '../../Redux/AppReducers';
import {AppStrings} from '../../Utils/AppStrings';
import {ENDPOINTS} from '../../Network/Urls';

const FlagRaisingTermsNCondiScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const dispatch = useDispatch();

  const selector: any = useSelector(
    (state: AppRootStore) => state.SliceReducer,
  );

  const colors = selector?.themeColors;

  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  const [isLoading, setIsLoading] = useState(false);
  const [termsHtml, setTermsHtml] = useState('');

  useEffect(() => {
    fetchTermsAndConditions();
  }, []);

  const fetchTermsAndConditions = () => {
    setIsLoading(true);

    apiHandler({
      endpoint: ENDPOINTS.FlagRaisingTerms,
      method: 'GET',
      authContext: 'RESIDENT',
      onComplete: (resp: any) => {
        setIsLoading(false);

        console.log('terms and condition', resp);

        if (resp?.status) {
          setTermsHtml(
            resp?.data?.data?.submissionFormTerms ??
              resp?.data?.submissionFormTerms ??
              resp?.data?.data?.termsAndConditions ??
              resp?.data?.termsAndConditions ??
              '',
          );
        } else {
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.error,
              message: resp?.error ?? resp?.message ?? 'Something went wrong',
            }),
          );
        }
      },
    });
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            margin: 0;
            padding: 16px;
            background-color: ${colors.Background};
            color: ${colors.Heading_Txt};
            font-size: 15px;
            line-height: 1.6;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
          }

          p {
            margin-top: 0;
            margin-bottom: 12px;
          }

          ul {
            padding-left: 22px;
            margin-top: 0;
            margin-bottom: 14px;
          }

          li {
            margin-bottom: 8px;
          }

          strong {
            font-weight: 700;
            color: ${colors.Heading_Txt};
          }
        </style>
      </head>
      <body>
        ${termsHtml || '<p>No terms and conditions found.</p>'}
      </body>
    </html>
  `;

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
        text={'Terms and Conditions'}
      />

      {isLoading ? (
        <View style={styles.loaderCont}>
          <ActivityIndicator size={'large'} color={colors.Primary} />
        </View>
      ) : (
        <View style={styles.contentCont}>
          <Text style={styles.descriptionTxt}>
            Review terms and conditions before submitting a request.
          </Text>

          <View style={styles.webViewCont}>
            <WebView
              originWhitelist={['*']}
              source={{html: htmlContent}}
              style={styles.webView}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      )}
    </View>
  );
};

export default FlagRaisingTermsNCondiScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    loaderCont: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    contentCont: {
      flex: 1,
    },
    descriptionTxt: {
      color: colors.Desc_Txt,
      fontSize: normalized(14),
      marginTop: normalized(12),
      marginHorizontal: normalized(20),
      marginBottom: normalized(5),
    },
    webViewCont: {
      flex: 1,
      marginHorizontal: normalized(20),
      marginTop: normalized(8),
      marginBottom: normalized(20),
      borderWidth: 1,
      borderColor: colors.BorderColor,
      borderRadius: normalized(12),
      overflow: 'hidden',
      backgroundColor: colors.Background,
    },
    webView: {
      flex: 1,
      backgroundColor: colors.Background,
    },
  });
