import {Platform, StatusBar, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import CustomHeader from '../Components/CustomHeader';
import {normalized, ScreenProps} from '../../Utils/AppConstants';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import WebView from 'react-native-webview';
import {resolveAccessToken} from '../../Network/Services/ApiHandler';
import {Base_Url} from '../../Network/Urls';

const VersionsScreen = (props: ScreenProps) => {
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector?.themeColors;
  const insects = useSafeAreaInsets();
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const id = props?.route?.params?.id;
  const version = props?.route?.params?.version;
  const [token, setToken] = useState('');

  useEffect(() => {
    const loadToken = async () => {
      const token: any = await resolveAccessToken('DAM');
      setToken(token);
    };

    loadToken();
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insects.top - normalized(Platform.OS == 'ios' ? 15 : 0),
          paddingBottom: Platform.OS === 'android' ? insects.bottom : 0,
        },
      ]}>
      <StatusBar
        barStyle={selector?.isDarkTheme ? 'light-content' : 'dark-content'}
      />

      <CustomHeader
        onBackPress={() => props?.navigation?.goBack()}
        text={'Version'}
      />

      {token && (
        <WebView
          source={{
            uri: `${Base_Url}/staff/dam/mobile-annotate/${id}/${version}?token=${token}`,
          }}
          style={{flex: 1}}
        />
      )}
    </View>
  );
};

export default VersionsScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
  });
