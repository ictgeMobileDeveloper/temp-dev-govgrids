// SessionTimerSocket.tsx
import React, {useEffect, useRef, useState} from 'react';
import {AppState} from 'react-native';
import {SOCKET_ENDPOINTS, websocketUrl} from '../Urls';
import {AuthContext, AsyncKeyStrings} from '../../Utils/AppStrings';
import {useDispatch} from 'react-redux';
import {setResidentUserData, setIsAlertShow} from '../../Redux/AppReducers';
import {removeSingleData} from '../../Utils/AsyncStorage';
import {Routes} from '../../Utils/Routes';
import {resetToWelcomeAndHome} from '../../Utils/Helper';
import {
  getAccessToken,
  hasAccessToken,
  subscribeAuthTokenChange,
} from './AuthTokenService';

type WSStatus = 'idle' | 'connecting' | 'open' | 'closed' | 'error';

type Props = {
  authContext: AuthContext;
  navigation: any;
  residentState?: string;
};

export const SessionTimerSocket: React.FC<Props> = ({
  authContext,
  navigation,
  residentState,
}) => {
  const dispatch = useDispatch();
  const ws = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<WSStatus>('idle');
  const handledRef = useRef(false);

  const endpoint = `${websocketUrl}${SOCKET_ENDPOINTS.publicSessionTimer}`;

  /**
   * ============================
   * CONNECT SOCKET
   * ============================
   */
  const connect = async () => {
    const token = await getAccessToken(authContext);

    if (!token) {
      console.log('🟡 WS skipped — no token yet');
      return;
    }

    // Close existing
    ws.current?.close();

    const url = endpoint.includes('?')
      ? `${endpoint}&token=${encodeURIComponent(token)}`
      : `${endpoint}?token=${encodeURIComponent(token)}`;

    console.log('🔌 Connecting WS:', url);

    setStatus('connecting');
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      console.log('🟢 WS connected');
      setStatus('open');
    };

    ws.current.onmessage = e => {
      try {
        const data = JSON.parse(e.data);
        const remaining = Number(data?.remainingSeconds);

        if (
          remaining === 0 &&
          !handledRef.current &&
          ['PPP1', 'PPD1', 'PFR1', 'PCR1'].includes(residentState || '')
        ) {
          handledRef.current = true;

          console.log('🚪 Session expired → logout');

          resetToWelcomeAndHome(navigation, Routes.Resident.HomeScreen);

          dispatch(setResidentUserData(null));
          removeSingleData(AsyncKeyStrings.ResidentUserData);

          dispatch(
            setIsAlertShow({
              value: true,
              message: 'Session Expired. Login Again.',
            }),
          );

          disconnect();
        }
      } catch (err) {
        console.warn('WS parse error', err);
      }
    };

    ws.current.onerror = err => {
      console.error('🔴 WS error', err);
      setStatus('error');
    };

    ws.current.onclose = () => {
      console.log('🔴 WS closed');
      setStatus('closed');
    };
  };

  /**
   * ============================
   * DISCONNECT SOCKET
   * ============================
   */
  const disconnect = () => {
    ws.current?.close();
    ws.current = null;
    setStatus('closed');
  };

  /**
   * ============================
   * EFFECT: INITIAL + TOKEN CHANGE
   * ============================
   */
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    // Try immediately
    connect();

    // Reconnect on token update
    unsubscribe = subscribeAuthTokenChange(() => {
      console.log('🔁 Token changed → reconnect WS');
      handledRef.current = false;
      connect();
    });

    // App state handling
    const appStateSub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        handledRef.current = false;
        connect();
      } else if (state === 'background') {
        disconnect();
      }
    });

    return () => {
      unsubscribe?.();
      disconnect();
      appStateSub.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [residentState]);

  return null;
};
