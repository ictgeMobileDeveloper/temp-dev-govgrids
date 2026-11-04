import React, {useRef, useState, useCallback, useEffect} from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  Text,
  StatusBar,
} from 'react-native';
import {WebView, WebViewNavigation} from 'react-native-webview';
import {useNavigation, useRoute, StackActions} from '@react-navigation/native';
import Config from 'react-native-config';
import {parseCallbackUrlParams, tryClaimSamlCallback} from '../../Utils/Helper';
import {Routes} from '../../Utils/Routes';
import {normalized} from '../../Utils/AppConstants';

interface SSOWebViewParams {
  redirectUrl: string;
  role?: 'helpDesk' | 'SIR';
  fallbackLoginScreen: string;
}

const isCallbackUrl = (url: string) =>
  url.startsWith(`${Config.CUSTOM_URL}://`);

const SSOWebViewScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {redirectUrl, role, fallbackLoginScreen} = (route.params ||
    {}) as SSOWebViewParams;

  const [loading, setLoading] = useState(true);

  const handleCallback = useCallback(
    (url: string) => {
      if (!tryClaimSamlCallback()) return;
      const {
        accessToken,
        expiresIn,
        role: parsedRole,
      } = parseCallbackUrlParams(url);
      if (accessToken) {
        navigation.dispatch(
          StackActions.replace('SAMLCallback', {
            accessToken,
            expiresIn,
            role: parsedRole || role,
          }),
        );
      }
    },
    [navigation, role],
  );

  const onShouldStartLoadWithRequest = useCallback(
    (request: {url: string}) => {
      if (isCallbackUrl(request.url)) {
        handleCallback(request.url);
        return false; // block the webview from trying to load it
      }
      return true;
    },
    [handleCallback],
  );

  const onNavigationStateChange = useCallback(
    (navState: WebViewNavigation) => {
      if (isCallbackUrl(navState.url)) {
        handleCallback(navState.url);
      }
    },
    [handleCallback],
  );

  useEffect(() => {
    if (!redirectUrl) {
      navigation.dispatch(StackActions.replace(fallbackLoginScreen));
    }
  }, [redirectUrl, navigation, fallbackLoginScreen]);

  if (!redirectUrl) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Pressable
          onPress={() =>
            navigation.dispatch(StackActions.replace(fallbackLoginScreen))
          }
          hitSlop={12}>
          <Text style={styles.closeText}>Cancel</Text>
        </Pressable>
      </View>

      <WebView
        source={{uri: redirectUrl}}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        onNavigationStateChange={onNavigationStateChange}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          navigation.dispatch(StackActions.replace(fallbackLoginScreen));
        }}
        startInLoadingState
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
      />

      {/* {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0A66C2" />
        </View>
      )} */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  header: {
    marginTop: normalized(10),
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
  },
  closeText: {color: '#0A66C2', fontSize: 16},
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
});

export default SSOWebViewScreen;
