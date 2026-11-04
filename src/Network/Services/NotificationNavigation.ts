import {navigationRef} from '../../Utils/AppConstants';

let pending: Record<string, any> | null = null;

const go = (data: Record<string, any>) => {
  navigationRef.navigate({name: data.screen, params: data} as never);
};

export const handleNotificationTap = (data?: Record<string, any>) => {
  if (!data?.screen) return;
  if (navigationRef.isReady()) {
    go(data);
  } else {
    pending = data; // cold start: navigator not mounted yet
  }
};

// call this once the user is past splash/login
export const flushPendingNotification = () => {
  if (pending && navigationRef.isReady()) {
    const d = pending;
    pending = null;
    go(d);
  }
};
