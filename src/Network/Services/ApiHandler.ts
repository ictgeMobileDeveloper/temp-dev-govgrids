import {AppStrings, AuthContext} from '../../Utils/AppStrings';
import {Base_Url, ENDPOINTS, COOKIE_DOMAIN} from '../Urls';
import CookieManager from '@preeternal/react-native-cookie-manager';
import {
  notifyAuthTokenChanged,
  notifySessionExpired,
  resetSessionExpired,
} from './AuthTokenService';
import NetInfo from '@react-native-community/netinfo';
import store from '../../Redux/AppStore';
import {
  setIsShowNoti,
  setPushNotifiObj,
  setShowToast,
} from '../../Redux/AppReducers';
import {useCallback, useRef, useState} from 'react';
import {resetToWelcomeAndHome} from '../../Utils/Helper';

/**
 * ============================
 * TYPES
 * ============================
 */
export type ApiMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface ApiRequestOptions {
  endpoint: string;
  method?: ApiMethod;
  authContext?: AuthContext;
  token?: string; // 🔐 reCAPTCHA ONLY
  useRecaptcha?: boolean;
  recaptchaKey?: string;
  recaptchaAction?: string;
  queryParams?: Record<string, any>;
  payload?: any;
  requiresAuth?: boolean;
  isFormData?: boolean;
  onComplete?: (response: {
    status: boolean;
    httpStatus?: number;
    data?: any;
    error?: string;
  }) => void;
}
/**
 * ============================
 * LOG HELPERS
 * ============================
 */
const log = (...args: any[]) => console.log('🟢 [API]', ...args);
const errorLog = (...args: any[]) => console.log('🔴 [API ERROR]', ...args);
const OFFLINE_MESSAGE = 'You are Offline';
const RECAPTCHA_ERROR_MESSAGE = 'Recaptcha verification failed';
// const GENERIC_NETWORK_ERROR = 'Network request failed'; for developement
const GENERIC_NETWORK_ERROR =
  'Unable to connect. Please check your internet connection and try again.';
const RECAPTCHA_RETRY_DELAY_MS = 700;
const RECAPTCHA_MAX_ATTEMPTS = 8;
const RECAPTCHA_PROVIDER_TIMEOUT_MS = 5000;
const SESSION_COOKIE_NAMES = ['sessionid', 'csrftoken'] as const;

type RecaptchaTokenProvider = (
  action: string,
) => Promise<string | null | undefined>;
let recaptchaTokenProvider: RecaptchaTokenProvider | null = null;
const inFlightGetRequests = new Set<string>();

export const setRecaptchaTokenProvider = (
  provider: RecaptchaTokenProvider | null,
) => {
  recaptchaTokenProvider = provider;
};

const sleep = (ms: number): Promise<void> =>
  new Promise<void>(resolve => {
    setTimeout(() => resolve(), ms);
  });

const resolveRecaptchaAttempt = async (action: string) => {
  if (!recaptchaTokenProvider) {
    return '';
  }

  try {
    const token = await Promise.race([
      recaptchaTokenProvider(action),
      sleep(RECAPTCHA_PROVIDER_TIMEOUT_MS).then(() => null),
    ]);
    return token ?? '';
  } catch (err) {
    errorLog('reCAPTCHA provider threw an error', err);
    return '';
  }
};

const resolveRecaptchaTokenWithRetry = async (action: string) => {
  for (let attempt = 1; attempt <= RECAPTCHA_MAX_ATTEMPTS; attempt += 1) {
    const token = await resolveRecaptchaAttempt(action);
    if (token) {
      return token;
    }

    if (attempt < RECAPTCHA_MAX_ATTEMPTS) {
      await sleep(RECAPTCHA_RETRY_DELAY_MS);
    }
  }

  return '';
};

const isRecaptchaVerificationError = (value: any) => {
  const text = String(value ?? '').toLowerCase();
  return (
    text.includes('recaptcha') &&
    (text.includes('verification') ||
      text.includes('verify') ||
      text.includes('invalid'))
  );
};

const isActuallyOnline = async () => {
  const state = await NetInfo.fetch();
  return Boolean(
    state.isConnected &&
      (state.isInternetReachable == null || state.isInternetReachable),
  );
};

const showOfflineToast = () => {
  const currentToast = store.getState()?.SliceReducer?.showToast;

  if (
    currentToast?.type === AppStrings.ToastType.error &&
    currentToast?.message === OFFLINE_MESSAGE
  ) {
    return;
  }

  store.dispatch(
    setShowToast({
      type: AppStrings.ToastType.error,
      message: OFFLINE_MESSAGE,
    }),
  );
};

const resolveThrownErrorMessage = async (err: any, endpoint: string) => {
  const nestedMessage =
    err?.response?.data?.message ||
    err?.response?.data?.detail ||
    err?.response?.data?.error ||
    err?.cause?.message ||
    err?.description;

  const message =
    nestedMessage || err?.message || String(err) || 'Unexpected error';

  if (String(message).toLowerCase() === GENERIC_NETWORK_ERROR.toLowerCase()) {
    const hasNetwork = await isActuallyOnline();
    if (!hasNetwork) {
      showOfflineToast();
      return OFFLINE_MESSAGE;
    }

    if (err?.code) {
      return `${GENERIC_NETWORK_ERROR} (${err.code})`;
    }

    return `${GENERIC_NETWORK_ERROR} at ${endpoint}`;
  }

  return String(message);
};

/**
 * ============================
 * TOKEN CONTEXT MAP
 * ============================
 */
const TOKEN_KEY_MAP: Record<AuthContext, string> = {
  RESIDENT: '__resident_access_token',
  CDR: '__cdr_access_token',
  SIR: '__sir_access_token',
  DAM: '__dam_access_token',
  TIMEKEEPING: '__timekeeping_access_token',
  HELPDESK: '__helpdesk_access_token',
};

/**
 * ============================
 * CSRF HANDLING
 * ============================
 */
export const initializeSecurityContext = async (
  onReady?: () => Promise<void> | void,
) => {
  log('🔐 Initializing security context...');
  await setCsrfCookies();
  log('✅ CSRF ready');
  await onReady?.();
};

const expires = new Date(Date.now() + 8 * 60 * 60 * 1000);

const setCsrfCookies = async () => {
  const res = await fetch(`${Base_Url}/api/csrf/`, {
    method: 'GET',
  });

  log('CSRF endpoint status:::', res.status);

  if (res.status >= 500) {
    log('⚠️ CSRF unavailable, continuing');
    return;
  }

  const cookies = await CookieManager.get(Base_Url);

  log('Raw cookies after CSRF:', cookies);

  if (!cookies?.csrftoken?.value) {
    throw new Error('csrftoken not found after CSRF call');
  }

  await CookieManager.set(Base_Url, {
    name: 'csrftoken',
    value: cookies.csrftoken.value,
    domain: COOKIE_DOMAIN,
    path: '/',
    secure: true,
    httpOnly: false,
    sameSite: 'none',
    expires: expires?.toISOString(),
  });

  log('✅ CSRF cookie normalized');
};
const persistResponseCookies = async (setCookieHeader: string | null) => {
  if (!setCookieHeader) return;

  for (const name of SESSION_COOKIE_NAMES) {
    const match = setCookieHeader.match(
      new RegExp(`(?:^|[,\\s])${name}=([^;,\\s]+)`),
    );
    const value = match?.[1];
    if (!value) continue;

    await CookieManager.set(Base_Url, {
      name,
      value,
      domain: COOKIE_DOMAIN,
      path: '/',
      secure: true,
      httpOnly: name === 'sessionid',
      sameSite: 'none',
      expires: expires.toISOString(),
    });
    log(`✅ ${name} persisted from Set-Cookie`);
  }
};

/**
 * ============================
 * ACCESS TOKEN HELPERS
 * ============================
 */
export const storeAccessToken = async (
  tokenValue: string,
  context: AuthContext,
) => {
  const internalKey = TOKEN_KEY_MAP[context];
  const domain = COOKIE_DOMAIN;

  log(`🔐 Mapping accessToken → ${internalKey}`);

  await CookieManager.set(Base_Url, {
    name: internalKey,
    value: tokenValue,
    domain,
    path: '/',
    secure: true,
    httpOnly: true,
    sameSite: 'none',
    expires: expires?.toISOString(),
  });

  await CookieManager.set(Base_Url, {
    name: 'accessToken',
    value: tokenValue,
    domain,
    path: '/',
    secure: true,
    httpOnly: true,
    sameSite: 'none',
    expires: expires?.toISOString(),
  });

  resetSessionExpired(context);
  notifyAuthTokenChanged(context);
};

export const hasValidAccessToken = async (context: AuthContext) => {
  const cookies = await CookieManager.get(Base_Url);
  return Boolean(cookies?.[TOKEN_KEY_MAP[context]]?.value);
};

export const resolveAccessToken = async (context?: AuthContext) => {
  if (!context) return null;
  const cookies = await CookieManager.get(Base_Url);
  return cookies?.[TOKEN_KEY_MAP[context]]?.value || null;
};

const buildCookieHeader = async (authContext?: AuthContext) => {
  const cookies = await CookieManager.get(Base_Url);
  const parts: string[] = [];

  if (cookies?.csrftoken?.value) {
    parts.push(`csrftoken=${cookies.csrftoken.value}`);
  }

  if (cookies?.sessionid?.value) {
    parts.push(`sessionid=${cookies.sessionid.value}`);
  } else if (cookies?.sessionId?.value) {
    parts.push(`sessionId=${cookies.sessionId.value}`);
  }

  if (authContext) {
    const token = await resolveAccessToken(authContext);
    if (token) {
      parts.push(`accessToken=${token}`);
    }
  }

  const header = parts.join('; ');
  log('🍪 Cookie header:', header);
  return header;
};

export const useRecaptchaRemount = (cooldownMs = 10000) => {
  const [instanceKey, setInstanceKey] = useState(0);
  const lastRemountAt = useRef(0);

  const remountRecaptcha = useCallback(
    (force = false) => {
      const now = Date.now();
      if (!force && now - lastRemountAt.current < cooldownMs) return;
      lastRemountAt.current = now;
      setInstanceKey(k => k + 1);
    },
    [cooldownMs],
  );

  return {instanceKey, remountRecaptcha};
};

/**
 * ============================
 * MAIN API HANDLER
 * ============================
 */
export const apiHandler = async ({
  endpoint,
  method = 'GET',
  authContext,
  token,
  useRecaptcha = false,
  recaptchaKey,
  recaptchaAction = recaptchaKey ?? 'login',
  queryParams,
  payload,
  requiresAuth = true,
  isFormData = false,
  onComplete,
}: ApiRequestOptions) => {
  let inFlightRequestKey: string | null = null;

  try {
    const isOnline = store.getState()?.SliceReducer?.isNetConnected;
    if (isOnline === false) {
      const hasNetwork = await isActuallyOnline();
      if (!hasNetwork) {
        showOfflineToast();
        onComplete?.({
          status: false,
          error: OFFLINE_MESSAGE,
        });
        return;
      }
    }
    console.log('endpoint-->>>>.   ', endpoint);

    let fullUrl = `${Base_Url}${endpoint}`;
    if (queryParams) {
      fullUrl += `?${new URLSearchParams(queryParams).toString()}`;
    }

    if (method === 'GET') {
      inFlightRequestKey = `${method}:${fullUrl}`;
      // if (inFlightGetRequests.has(inFlightRequestKey)) {
      //   log(`⏭️ Skip duplicate in-flight request: ${fullUrl}`);
      //   return;
      // }
      inFlightGetRequests.add(inFlightRequestKey);
    }

    const headers: Record<string, string> = {};

    if (!isFormData && method !== 'GET') {
      headers['Content-Type'] = 'application/json';
    }

    const cookieHeader = await buildCookieHeader(
      requiresAuth ? authContext : undefined,
    );

    let hasRetriedRecaptcha = false;

    while (true) {
      const requestHeaders: Record<string, string> = {...headers};
      let requestToken = token;
      if (!requestToken && useRecaptcha) {
        requestToken = await resolveRecaptchaTokenWithRetry(recaptchaAction);
        if (!requestToken) {
          onComplete?.({
            status: false,
            error: RECAPTCHA_ERROR_MESSAGE,
          });
          return;
        }
      }

      if (requestToken) {
        requestHeaders['X-Recaptcha-Token'] = requestToken;
        log('🤖 reCAPTCHA attached');
      }

      if (endpoint != ENDPOINTS.getModules && cookieHeader) {
        requestHeaders['Cookie'] = cookieHeader;
      }

      log(`[${method}] → ${fullUrl}`);
      log('Headers:', requestHeaders);

      const response = await fetch(fullUrl, {
        method,
        headers: requestHeaders,
        credentials: 'omit',
        body:
          method !== 'GET' && payload
            ? isFormData
              ? payload
              : JSON.stringify(payload)
            : undefined,
      });

      console.log('response ---  ', response);

      /**
       * 🔴 SERVER DOWN HANDLING
       */
      if (response.status >= 500) {
        errorLog(`Server error ${response.status} at ${endpoint}`);
        onComplete?.({
          status: false,
          error: 'Server is down. Please try again later.',
        });
        return;
      }

      /**
       * 🍪 TOKEN CAPTURE (LOGIN / REFRESH)
       */
      const setCookieHeader = response.headers.get('set-cookie');
      await persistResponseCookies(setCookieHeader);
      if (setCookieHeader?.includes('accessToken=') && authContext) {
        const match = setCookieHeader.match(/accessToken=([^;]+)/);

        if (match?.[1]) {
          await storeAccessToken(match[1], authContext);
          console.log(`✅ accessToken stored for ${authContext}`);
        }
      }

      /**
       * ✅ RESPONSE PARSING
       */
      let data: any = null;
      try {
        data = await response.json();
        console.log('data ----  ', data);
      } catch {
        data = null;
      }

      if (response.ok) {
        onComplete?.({status: true, data});
        return;
      }

      const backendError =
        data?.message ||
        data?.detail ||
        data?.error ||
        `HTTP ${response.status}`;

      if (
        useRecaptcha &&
        !hasRetriedRecaptcha &&
        isRecaptchaVerificationError(backendError)
      ) {
        hasRetriedRecaptcha = true;
        await sleep(RECAPTCHA_RETRY_DELAY_MS);
        continue;
      }
      /**
       * 🔐 403 HANDLING (RETURN ACTUAL MESSAGE)
       */
      if (response.status === 401) {
        if (requiresAuth && authContext) {
          notifySessionExpired(authContext);
        }

        onComplete?.({
          status: false,
          error:
            data?.message ||
            data?.detail ||
            data?.error ||
            'Token Expired , Login again.',
        });
        return;
      }

      if (response.status === 403) {
        onComplete?.({
          status: false,
          httpStatus: response.status,
          error:
            data?.message ||
            data?.detail ||
            data?.error ||
            'You do not have permission to perform this action.',
        });
        return;
      }

      // 502 server error
      if (response.status === 502) {
        errorLog(`Server error ${response.status} at ${endpoint}`);

        store.dispatch(
          setPushNotifiObj({
            notification: {
              title: 'Server Unavailable',
              body: 'Server is down. Please try again later.',
            },
          }),
        );

        store.dispatch(setIsShowNoti(true));

        onComplete?.({
          status: false,
          httpStatus: response.status,
          error: 'Server is down. Please try again later.',
        });

        return;
      }

      /**
       * ❌ 404 HANDLING
       */
      if (response.status === 404) {
        onComplete?.({
          status: false,
          error: 'No matching record found.',
          data,
        });
        return;
      }
      // if (response.status === 400) {
      //   onComplete?.({
      //     status: false,
      //     error: 'Something went wrong. Please try again later.',
      //     data,
      //   });
      //   return;
      // }
      /**
       * ❌ OTHER CLIENT ERRORS
       */
      console.log('data--', data);

      onComplete?.({
        status: false,
        error: backendError,
        httpStatus: response.status,
      });
      return;
    }
  } catch (err: any) {
    const message = await resolveThrownErrorMessage(err, endpoint);
    errorLog('Unhandled API error', err);
    onComplete?.({
      status: false,
      error: message,
    });
  } finally {
    if (inFlightRequestKey) {
      inFlightGetRequests.delete(inFlightRequestKey);
    }
  }
};
