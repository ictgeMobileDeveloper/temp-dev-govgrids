// locationWhileInUse.ts
import {Alert, Linking, Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {
  check,
  request,
  openSettings,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';
import {promptForEnableLocationIfNeeded} from 'react-native-android-location-enabler';

/** Prompt user to Settings when permission is blocked */
function showBlockedAlert() {
  Alert.alert(
    'Permission Required',
    'Location permission is blocked. Please enable it in Settings to continue.',
    [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Open Settings',
        onPress: () => openSettings().catch(() => Linking.openSettings()),
      },
    ],
  );
}

/** iOS: prompt to Settings when Location Services (GPS) are off */
function showEnableServicesAlertIOS() {
  Alert.alert(
    'Turn On Location',
    'Location Services are disabled. Please enable Location in Settings.',
    [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Open Settings',
        onPress: () => Linking.openURL('App-Prefs:root=Privacy&path=LOCATION'),
      },
    ],
  );
}

/** Ensure GPS/Location Services are ON. Returns true if enabled after the flow. */
async function ensureServicesOn(): Promise<boolean> {
  const on = await DeviceInfo.isLocationEnabled();
  if (on) return true;

  if (Platform.OS == 'android') {
    try {
      await promptForEnableLocationIfNeeded({
        interval: 10_000,
        // fastInterval: 5_000,
        // forceHighAccuracy: true,
        // openLocationSettings: true,
      });
      return true; // user enabled
    } catch {
      return false; // user canceled
    }
  }

  // iOS: no system toggle dialog—must go to Settings
  return false;
}

/**
 * Main entry: ensures "While Using the App" permission + services ON.
 * Resolves true only when fully ready; otherwise shows the appropriate UI and resolves false.
 */
export async function LocationHandler(): Promise<boolean> {
  const perm =
    Platform.OS === 'ios'
      ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
      : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

  let status = await check(perm);

  if (status === RESULTS.DENIED) {
    status = await request(perm);
  }

  if (status === RESULTS.BLOCKED) {
    showBlockedAlert();
    return false;
  }

  if (status !== RESULTS.GRANTED && status !== RESULTS.LIMITED) {
    return false;
  }

  // 2) Ensure Location Services are ON
  const servicesOn = await ensureServicesOn();
  if (!servicesOn) {
    if (Platform.OS === 'ios') {
      showEnableServicesAlertIOS();
    } else {
      Alert.alert('Location Required', 'Please enable Location to continue.', [
        {text: 'OK'},
      ]);
    }
    return false;
  }

  return true; // ✅ ready: permission OK + services ON
}
