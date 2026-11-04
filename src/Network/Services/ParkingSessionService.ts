import {apiHandler} from './ApiHandler';
import {ENDPOINTS} from '../Urls';
import {getDataAsync, setDataInAsync} from '../../Utils/AsyncStorage';
import {AsyncKeyStrings} from '../../Utils/AppStrings';
import {
  setActiveParkingSessions,
  setGuestParkingSessions,
} from '../../Redux/AppReducers';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';

const GRACE_MS = 24 * 60 * 60 * 1000;
const isStillRelevant = (s: any) => {
  const end = new Date(s?.endTime).getTime();
  return !isNaN(end) && end > Date.now() - GRACE_MS;
};

export const fetchActiveParkingSessions = (dispatch: any, residentId?: any) => {
  console.log(
    '[DEBUG] fetchActiveParkingSessions called, residentId:',
    residentId,
  );
  if (!residentId) {
    console.log('[DEBUG] skipped — no residentId yet');
    return;
  }
  apiHandler({
    endpoint: ENDPOINTS.allParkingSession,
    method: 'GET',
    queryParams: {page: 1, pageSize: 10},
    authContext: 'RESIDENT',
    onComplete: (resp: any) => {
      console.log('[DEBUG] allParkingSession response:', resp);
      if (!resp?.status) return;
      const active = (resp?.data?.data?.data ?? []).filter(
        (s: any) => s?.status?.toLowerCase() === 'active',
      );
      console.log('[DEBUG] filtered active sessions:', active);
      dispatch(setActiveParkingSessions(active));
    },
  });
};

export const rehydrateGuestParkingSessions = async (dispatch: any) => {
  const stored =
    (await getDataAsync<any[]>(AsyncKeyStrings.GuestParkingSessions)) ?? [];
  const pruned = stored.filter(isStillRelevant);

  if (pruned.length !== stored.length) {
    await setDataInAsync(AsyncKeyStrings.GuestParkingSessions, pruned);
  }
  dispatch(setGuestParkingSessions(pruned));
};

// Called from the session-creation success handler (guest path only)
export const appendGuestParkingSession = async (
  dispatch: any,
  existing: any[],
  newSession: any,
) => {
  console.log('[DEBUG] appendGuestParkingSession called with:', newSession);
  if (!newSession?.sessionId) {
    console.warn(
      'appendGuestParkingSession called without a valid session',
      newSession,
    );
    return;
  }
  const updated = [newSession, ...existing];
  await setDataInAsync(AsyncKeyStrings.GuestParkingSessions, updated);
  dispatch(setGuestParkingSessions(updated));
};

export const updateParkingSessionInStore = async (
  dispatch: any,
  authSessions: any[],
  guestSessions: any[],
  updatedSession: any,
) => {
  const sessionId = updatedSession?.sessionId;
  if (!sessionId) {
    console.warn(
      'updateParkingSessionInStore called without a sessionId',
      updatedSession,
    );
    return;
  }

  const isAuthSession = authSessions.some(
    (s: any) => s.sessionId === sessionId,
  );
  if (isAuthSession) {
    const updated = authSessions.map((s: any) =>
      s.sessionId === sessionId ? {...s, ...updatedSession} : s,
    );
    dispatch(setActiveParkingSessions(updated));
    return;
  }

  const isGuestSession = guestSessions.some(
    (s: any) => s.sessionId === sessionId,
  );
  if (isGuestSession) {
    const updated = guestSessions.map((s: any) =>
      s.sessionId === sessionId ? {...s, ...updatedSession} : s,
    );
    dispatch(setGuestParkingSessions(updated));
    await setDataInAsync(AsyncKeyStrings.GuestParkingSessions, updated);
  }
};
