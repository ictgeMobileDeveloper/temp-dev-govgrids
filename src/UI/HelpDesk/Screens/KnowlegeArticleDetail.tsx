import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Platform,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import {WebView} from 'react-native-webview';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';

import {AppRootStore} from '../../../Redux/AppStore';
import {AppStyles} from '../../../Utils/AppStyles';
import {
  AppFonts,
  AppHorizontalMargin,
  normalized,
  ScreenProps,
} from '../../../Utils/AppConstants';
import CustomHeader from '../../Components/CustomHeader';
import {apiHandler} from '../../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../../Network/Urls';
import {setShowToast} from '../../../Redux/AppReducers';
import {AppStrings} from '../../../Utils/AppStrings';
import {getErrorMessage} from '../../../Utils/Helper';

const KnowledgeArticleDetailScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const dispatch = useDispatch();

  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );

  const selector: any = useSelector(
    (state: AppRootStore) => state.SliceReducer,
  );

  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  const articleId = props?.route?.params?.articleId;
  const headerTitle = props?.route?.params?.title || 'Article';

  const [loading, setLoading] = useState(false);
  const [articleHtml, setArticleHtml] = useState('');
  const [articleTitle, setArticleTitle] = useState(headerTitle);

  const fetchArticleDetail = () => {
    if (!articleId) {
      return;
    }

    setLoading(true);

    apiHandler({
      endpoint: ENDPOINTS.helpDeskArticleDetail,
      method: 'GET',
      authContext: 'HELPDESK',
      queryParams: {
        id: articleId,
      },
      onComplete: (resp: any) => {
        console.log('Article Detail API:', resp);
        setLoading(false);

        if (resp?.status) {
          const articleData = resp?.data?.data || resp?.data || {};

          setArticleTitle(articleData?.title || headerTitle);
          setArticleHtml(articleData?.article || '');
        } else {
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

  useEffect(() => {
    fetchArticleDetail();
  }, [articleId]);

  const html = `
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
            font-family: Arial, sans-serif;
            font-size: 15px;
            line-height: 1.6;
          }

          img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 12px 0;
          }

          p, div, span {
            color: ${colors.Heading_Txt};
          }

          a {
            color: ${colors.Primary};
          }
        </style>
      </head>
      <body>
        ${articleHtml}
      </body>
    </html>
  `;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insects.top - normalized(Platform.OS === 'ios' ? 15 : 0),
          paddingBottom: Platform.OS === 'android' ? insects.bottom : 0,
        },
      ]}>
      <StatusBar
        barStyle={selector?.isDarkTheme ? 'light-content' : 'dark-content'}
      />

      <CustomHeader
        onBackPress={() => props?.navigation?.goBack()}
        text={articleTitle}
      />

      {loading ? (
        <View style={styles.loaderCont}>
          <ActivityIndicator color={colors.Primary} size="large" />
        </View>
      ) : (
        <WebView
          originWhitelist={['*']}
          source={{html}}
          style={styles.webView}
          startInLoadingState
          renderLoading={() => (
            <ActivityIndicator color={colors.Primary} size="large" />
          )}
        />
      )}
    </View>
  );
};

export default KnowledgeArticleDetailScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.ScreenBackground,
    },

    loaderCont: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },

    webView: {
      flex: 1,
      backgroundColor: colors.Background,
      marginHorizontal: AppHorizontalMargin,
      marginTop: normalized(12),
      borderRadius: normalized(12),
    },
  });
