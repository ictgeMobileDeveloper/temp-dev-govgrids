/**
 * @format
 */
import 'react-native-reanimated';
import {AppRegistry} from 'react-native';
import {getApp} from '@react-native-firebase/app';
import {
  getMessaging,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import App from './App';
import {name as appName} from './app.json';
import {Provider} from 'react-redux';
import store from './src/Redux/AppStore';
import 'react-native-get-random-values';
import {MenuProvider} from 'react-native-popup-menu';
import notifee, {EventType} from 'react-native-notify-kit';
import ReactNativeBlobUtil from 'react-native-blob-util';

const firebaseApp = getApp();
const messagingInstance = getMessaging(firebaseApp);
ErrorUtils.setGlobalHandler((e, fatal) =>
  console.log('GLOBAL', fatal, e?.message, e?.stack),
);

notifee.onBackgroundEvent(async ({type, detail}) => {
  if (type === EventType.PRESS) {
    const filePath = detail.notification?.data?.filePath;
    const mimeType = detail.notification?.data?.mimeType;

    if (filePath) {
      ReactNativeBlobUtil.android.actionViewIntent(
        filePath,
        mimeType || 'application/zip',
      );
    }
  }
});

setBackgroundMessageHandler(messagingInstance, async remoteMessage => {
  console.log('[Push] Background message:', remoteMessage);
});

const AppRedux = () => (
  <Provider store={store}>
    <MenuProvider>
      <App />
    </MenuProvider>
  </Provider>
);

AppRegistry.registerComponent(appName, () => AppRedux);
