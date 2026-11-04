import {useEffect, useRef} from 'react';
import {AppState} from 'react-native';
import {AuthContext} from '../../Utils/AppStrings';
import {websocketUrl} from '../Urls';
import {hasValidAccessToken, resolveAccessToken} from './ApiHandler';
import {hasAccessToken, subscribeAuthTokenChange} from './AuthTokenService';
import {sessionSocketRegistry} from './SessionSocketRegistry';
import {Buffer} from 'buffer';

type UseSessionExpirySocketParams = {
  authContext: AuthContext;
  endpoint: string;
  enabled?: boolean;
  label?: string;
  dependencyKey?: any;
  onExpired: () => void;
};

export const useSessionExpirySocket = ({
  authContext,
  endpoint,
  enabled = true,
  label = authContext,
  dependencyKey,
  onExpired,
}: UseSessionExpirySocketParams) => {
  const onExpiredRef = useRef(onExpired);

  useEffect(() => {
    onExpiredRef.current = onExpired;
  }, [onExpired]);

  useEffect(() => {
    if (!enabled) return;

    const fullEndpoint = `${websocketUrl}${endpoint}`;

    let handled = false;
    let unsubscribe: (() => void) | null = null;

    const forceExpire = (reason: string) => {
      if (handled) return;

      console.log(`🔴 ${label} session expired:`, reason);
      handled = true;
      onExpiredRef.current();
    };

    const onMessage = (data: any) => {
      console.log(`📩 ${label} raw timer message:`, data);

      const remaining = Number(data?.remainingSeconds);
      console.log(data);
      console.log(
        `⏱️ ${label} remainingSeconds:`,
        data?.remainingSeconds,
        '→',
        remaining,
      );

      const isUnauthorized =
        data?.status === 'unauthorized' ||
        data?.status === 'expired' ||
        data?.status === 'logged_out' ||
        data?.message === 'Invalid or expired session' ||
        data?.message === 'Session expired';

      if (isUnauthorized) {
        console.log(authContext, hasAccessToken);
        forceExpire(data?.message || data?.status || 'unauthorized');
        return;
      }

      if (Number.isFinite(remaining) && remaining === 0) {
        forceExpire('remainingSeconds === 0');
      }
    };

    const connectIfPossible = async () => {
      const hasToken = await hasValidAccessToken(authContext);

      console.log(`${label} has token:`, hasToken);

      if (!hasToken) {
        console.log(`🟡 ${label} WS skipped — no token`);
        return;
      }
      const decodeJwtPayload = (jwt: string) => {
        try {
          const payload = jwt.split('.')[1];
          const decoded = Buffer.from(payload, 'base64').toString('utf8');
          return JSON.parse(decoded);
        } catch {
          return null;
        }
      };

      const token = await resolveAccessToken(authContext);
      if (!token) {
        return null;
      }
      const tokenPayload = decodeJwtPayload(token);

      console.log(`${label} token payload:`, tokenPayload);
      if (!token) return;

      sessionSocketRegistry.connect(authContext, fullEndpoint, onMessage);
    };

    connectIfPossible();

    unsubscribe = subscribeAuthTokenChange(changedContext => {
      if (changedContext !== authContext) return;

      console.log(`🔁 ${label} token changed → reconnect session socket`);
      handled = false;
      connectIfPossible();
    });

    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        handled = false;
        connectIfPossible();
      }
    });

    return () => {
      unsubscribe?.();
      sessionSocketRegistry.removeListener(
        authContext,
        fullEndpoint,
        onMessage,
      );
      sessionSocketRegistry.disconnect(authContext, fullEndpoint);
      subscription.remove();
    };
  }, [authContext, endpoint, enabled, dependencyKey, label]);
};
