import {useEffect} from 'react';
import {useRoute} from '@react-navigation/native';
import {CommonActions} from '@react-navigation/native';
import {navigationRef} from '../Utils/AppConstants';
import {Routes} from '../Utils/Routes';
import {useDispatch} from 'react-redux';
import {setShowToast} from '../Redux/AppReducers';
import {AppStrings} from '../Utils/AppStrings';

export function useDeepLinkGuard(userData: any) {
  const dispatch = useDispatch();

  const route = useRoute<any>();

  const linkEmail = route.params?.user;

  const isDeepLink = !!linkEmail;

  const loggedInEmail = userData?.email;

  const isMatch =
    !isDeepLink ||
    (!!loggedInEmail &&
      loggedInEmail.toLowerCase() === String(linkEmail).toLowerCase());

  useEffect(() => {
    if (!isDeepLink || isMatch) {
      return;
    }

    const resetToMain = () => {
      navigationRef.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: Routes.MainScreen,
            },
          ],
        }),
      );
      dispatch(
        setShowToast({
          type: AppStrings.ToastType.warning,
          message:
            'Please sign in with the account associated with this request to view its details.',
        }),
      );
    };

    if (navigationRef.isReady()) {
      resetToMain();
      return;
    }

    const timer = setTimeout(() => {
      if (navigationRef.isReady()) {
        resetToMain();
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [isDeepLink, isMatch]);

  return {
    isBlocked: isDeepLink && !isMatch,
  };
}
