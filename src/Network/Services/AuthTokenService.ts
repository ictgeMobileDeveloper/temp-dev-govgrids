import CookieManager from '@preeternal/react-native-cookie-manager';
import {Base_Url, COOKIE_DOMAIN} from '../Urls';
import {AuthContext} from '../../Utils/AppStrings';

/**
 * Internal cookie keys per auth context
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
 * Check if access token exists for context
 */
export const hasAccessToken = async (
  context: AuthContext,
): Promise<boolean> => {
  const cookies = await CookieManager.get(Base_Url);
  console.log('cookies-->>>. ', cookies);

  return Boolean(cookies?.[TOKEN_KEY_MAP[context]]?.value);
};

/**
 * Resolve access token value (for sockets / low-level use)
 */
export const getAccessToken = async (
  context: AuthContext,
): Promise<string | null> => {
  const cookies = await CookieManager.get(Base_Url);
  return cookies?.[TOKEN_KEY_MAP[context]]?.value || null;
};

/**
 * Native WebSocket requests can include the domain cookie jar in addition to
 * the query token. Keep the generic backend cookie aligned with the active
 * module before opening a socket so server-side cookie auth cannot override the
 * query token with a stale module token.
 */
export const activateAuthContextCookie = async (
  context: AuthContext,
): Promise<string | null> => {
  const token = await getAccessToken(context);

  if (!token) return null;

  await CookieManager.set(Base_Url, {
    name: 'accessToken',
    value: token,
    domain: COOKIE_DOMAIN,
    path: '/',
    secure: true,
    httpOnly: true,
    sameSite: 'none',
    expires: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
  });

  return token;
};

type AuthListener = (context: AuthContext) => void;

// service for navigation to login
const listeners = new Set<AuthListener>();
type SessionExpiredListener = (context: AuthContext) => void;

const sessionExpiredListeners = new Set<SessionExpiredListener>();
const expiredContexts = new Set<AuthContext>();

export const notifySessionExpired = (context: AuthContext) => {
  if (expiredContexts.has(context)) return;

  expiredContexts.add(context);
  sessionExpiredListeners.forEach(listener => listener(context));
};
export const subscribeSessionExpired = (listener: SessionExpiredListener) => {
  sessionExpiredListeners.add(listener);
  return () => {
    sessionExpiredListeners.delete(listener);
  };
};

export const resetSessionExpired = (context: AuthContext) => {
  expiredContexts.delete(context);
};

export const notifyAuthTokenChanged = (context: AuthContext) => {
  listeners.forEach(cb => cb(context));
};

export const subscribeAuthTokenChange = (cb: AuthListener) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
export const clearAuthContext = async (context: AuthContext) => {
  const internalKey = TOKEN_KEY_MAP[context];
  const domain = COOKIE_DOMAIN;

  console.log(`🧹 Clearing auth context: ${context}`);

  const expiredDate = new Date(0).toISOString();

  // 🔥 Clear context-specific token
  await CookieManager.set(Base_Url, {
    name: internalKey,
    value: '',
    domain,
    path: '/',
    secure: true,
    httpOnly: true,
    sameSite: 'none',
    expires: expiredDate,
  });

  // 🔥 Clear generic backend token
  await CookieManager.set(Base_Url, {
    name: 'accessToken',
    value: '',
    domain,
    path: '/',
    secure: true,
    httpOnly: true,
    sameSite: 'none',
    expires: expiredDate,
  });

  notifyAuthTokenChanged(context);
};
