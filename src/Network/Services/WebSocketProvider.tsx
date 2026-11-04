import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react';
import {AppState} from 'react-native';
import {SOCKET_ENDPOINTS, websocketUrl} from '../Urls';
import {AuthContext} from '../../Utils/AppStrings';
import {
  activateAuthContextCookie,
  hasAccessToken,
  subscribeAuthTokenChange,
} from './AuthTokenService';

type WSStatus = 'idle' | 'connecting' | 'open' | 'closed' | 'error';

type Notification = {
  id: string | number;
  isRead?: boolean;
  [k: string]: any;
};

type SocketStore = {
  ws: WebSocket | null;
  notifications: Notification[];
  status: WSStatus;
  connectionId: number;
  initialized: boolean;
  shouldReconnectOnActive: boolean;
  version: number;
  listeners: Set<() => void>;
};

type WebSocketProviderProps = {
  children: React.ReactNode;
};

type WebSocketContextValue = {
  getStore: (authContext: AuthContext) => SocketStore;
  subscribe: (authContext: AuthContext, listener: () => void) => () => void;
  connect: (authContext: AuthContext) => Promise<void>;
  reconnect: (authContext: AuthContext) => Promise<void>;
  disconnect: (authContext: AuthContext) => void;
  sendMessage: (authContext: AuthContext, msg: any) => void;
  markNotificationAsRead: (
    authContext: AuthContext,
    id: string | number,
  ) => void;
  markAllAsRead: (authContext: AuthContext) => void;
};

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

const isNotificationRead = (value: any): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();

    if (normalized === 'true' || normalized === '1' || normalized === 'read') {
      return true;
    }

    if (
      normalized === 'false' ||
      normalized === '0' ||
      normalized === 'unread' ||
      normalized === ''
    ) {
      return false;
    }
  }

  return Boolean(value);
};

const normalizeNotification = (notification: Notification): Notification => ({
  ...notification,
  isRead: isNotificationRead(notification?.isRead),
});

const createStore = (): SocketStore => ({
  ws: null,
  notifications: [],
  status: 'idle',
  connectionId: 0,
  initialized: false,
  shouldReconnectOnActive: false,
  version: 0,
  listeners: new Set(),
});

const getSocketEndpoint = (authContext: AuthContext) => {
  if (authContext === 'HELPDESK') {
    return `${websocketUrl}${SOCKET_ENDPOINTS.helpDeskNotifications}`;
  }

  return `${websocketUrl}${SOCKET_ENDPOINTS.notifications}`;
};

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
}) => {
  const storesRef = useRef<Record<string, SocketStore>>({});

  const getStore = useCallback((authContext: AuthContext) => {
    if (!storesRef.current[authContext]) {
      storesRef.current[authContext] = createStore();
    }

    return storesRef.current[authContext];
  }, []);

  const emit = useCallback((store: SocketStore) => {
    store.version += 1;
    store.listeners.forEach(listener => listener());
  }, []);

  const closeSocket = useCallback(
    (authContext: AuthContext) => {
      const store = getStore(authContext);

      if (!store.ws) return;

      store.connectionId += 1;

      store.ws.onopen = null;
      store.ws.onmessage = null;
      store.ws.onerror = null;
      store.ws.onclose = null;
      store.ws.close();

      store.ws = null;
      store.status = 'closed';

      emit(store);
    },
    [emit, getStore],
  );

  const connect = useCallback(
    async (authContext: AuthContext) => {
      const store = getStore(authContext);

      store.shouldReconnectOnActive = true;

      if (
        store.ws?.readyState === WebSocket.OPEN ||
        store.ws?.readyState === WebSocket.CONNECTING
      ) {
        return;
      }

      const nextConnectionId = store.connectionId + 1;
      store.connectionId = nextConnectionId;

      const token = await activateAuthContextCookie(authContext);

      if (store.connectionId !== nextConnectionId) return;

      if (!token) {
        store.status = 'idle';
        emit(store);
        return;
      }

      if (store.ws) {
        store.ws.onopen = null;
        store.ws.onmessage = null;
        store.ws.onerror = null;
        store.ws.onclose = null;
        store.ws.close();
        store.ws = null;
      }

      const endpoint = getSocketEndpoint(authContext);
      const socketUrl = `${endpoint}?token=${encodeURIComponent(token)}`;

      store.status = 'connecting';
      emit(store);

      console.log('WS connecting:', authContext);

      const socket = new WebSocket(socketUrl);
      store.ws = socket;

      socket.onopen = () => {
        if (store.ws !== socket || store.connectionId !== nextConnectionId) {
          return;
        }

        store.status = 'open';
        emit(store);
      };

      socket.onmessage = event => {
        if (store.ws !== socket || store.connectionId !== nextConnectionId) {
          return;
        }

        try {
          const data = JSON.parse(event.data);
          console.log('🔔 WS raw message received:', {
            authContext,
            data,
          });

          if (Array.isArray(data?.notifications)) {
            const incoming = data.notifications.map(normalizeNotification);

            if (!store.initialized || store.notifications.length === 0) {
              store.notifications = incoming;
              store.initialized = true;
            } else {
              const notificationMap = new Map<string | number, Notification>();

              [...store.notifications, ...incoming].forEach(notification => {
                notificationMap.set(notification.id, notification);
              });

              store.notifications = Array.from(notificationMap.values());
            }

            emit(store);
            return;
          }

          if (data?.id !== undefined) {
            const incoming = normalizeNotification(data);

            if (!store.notifications.some(item => item.id === incoming.id)) {
              store.notifications = [incoming, ...store.notifications];
              emit(store);
            }
          }
        } catch (error) {
          console.warn('WS parse error:', error);
        }
      };

      socket.onerror = () => {
        if (store.ws !== socket || store.connectionId !== nextConnectionId) {
          return;
        }

        store.status = 'error';
        emit(store);
      };

      socket.onclose = () => {
        if (store.ws !== socket || store.connectionId !== nextConnectionId) {
          return;
        }

        store.ws = null;
        store.status = 'closed';
        emit(store);
      };
    },
    [emit, getStore],
  );

  const reconnect = useCallback(
    async (authContext: AuthContext) => {
      const store = getStore(authContext);

      store.initialized = false;
      store.notifications = [];
      store.shouldReconnectOnActive = true;

      closeSocket(authContext);
      await connect(authContext);
    },
    [closeSocket, connect, getStore],
  );

  const disconnect = useCallback(
    (authContext: AuthContext) => {
      const store = getStore(authContext);
      store.shouldReconnectOnActive = false;
      closeSocket(authContext);
    },
    [closeSocket, getStore],
  );

  const sendMessage = useCallback(
    (authContext: AuthContext, msg: any) => {
      const store = getStore(authContext);

      if (store.ws?.readyState === WebSocket.OPEN) {
        store.ws.send(JSON.stringify(msg));
      }
    },
    [getStore],
  );

  const markNotificationAsRead = useCallback(
    (authContext: AuthContext, id: string | number) => {
      const store = getStore(authContext);

      store.notifications = store.notifications.map(notification =>
        notification.id === id ? {...notification, isRead: true} : notification,
      );

      emit(store);
      sendMessage(authContext, {
        type: 'MARK_READ',
        notificationId: id,
      });
    },
    [emit, getStore, sendMessage],
  );

  const markAllAsRead = useCallback(
    (authContext: AuthContext) => {
      const store = getStore(authContext);

      store.notifications = store.notifications.map(notification => ({
        ...notification,
        isRead: true,
      }));

      emit(store);
      sendMessage(authContext, {type: 'MARK_ALL_READ'});
    },
    [emit, getStore, sendMessage],
  );

  const subscribe = useCallback(
    (authContext: AuthContext, listener: () => void) => {
      const store = getStore(authContext);

      store.listeners.add(listener);

      return () => {
        store.listeners.delete(listener);
      };
    },
    [getStore],
  );

  useEffect(() => {
    const unsubscribe = subscribeAuthTokenChange(changedContext => {
      const store = getStore(changedContext);

      store.initialized = false;
      store.notifications = [];

      reconnect(changedContext);
    });

    const appStateSub = AppState.addEventListener('change', state => {
      if (state === 'background') {
        Object.keys(storesRef.current).forEach(context => {
          closeSocket(context as AuthContext);
        });

        return;
      }

      if (state === 'active') {
        Object.keys(storesRef.current).forEach(context => {
          const authContext = context as AuthContext;
          const store = getStore(authContext);

          if (store.shouldReconnectOnActive) {
            connect(authContext);
          }
        });
      }
    });

    return () => {
      unsubscribe();
      appStateSub.remove();

      Object.keys(storesRef.current).forEach(context => {
        closeSocket(context as AuthContext);
      });
    };
  }, [closeSocket, connect, getStore, reconnect]);

  const value = useMemo<WebSocketContextValue>(
    () => ({
      getStore,
      subscribe,
      connect,
      reconnect,
      disconnect,
      sendMessage,
      markNotificationAsRead,
      markAllAsRead,
    }),
    [
      getStore,
      subscribe,
      connect,
      reconnect,
      disconnect,
      sendMessage,
      markNotificationAsRead,
      markAllAsRead,
    ],
  );

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (authContext: AuthContext) => {
  const ctx = useContext(WebSocketContext);

  if (!ctx) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }

  const version = useSyncExternalStore(
    listener => ctx.subscribe(authContext, listener),
    () => ctx.getStore(authContext).version,
  );

  const store = ctx.getStore(authContext);

  useEffect(() => {
    hasAccessToken(authContext).then(has => {
      if (has) {
        ctx.connect(authContext);
      }
    });
  }, [authContext, ctx]);

  return useMemo(() => {
    const notifications = store.notifications;

    return {
      notifications,
      status: store.status,
      readyState: store.ws?.readyState,

      sendMessage: (msg: any) => ctx.sendMessage(authContext, msg),

      markNotificationAsRead: (id: string | number) =>
        ctx.markNotificationAsRead(authContext, id),

      markAllAsRead: () => ctx.markAllAsRead(authContext),

      getUnreadCount: () =>
        notifications.reduce(
          (acc, notification) =>
            acc + (isNotificationRead(notification?.isRead) ? 0 : 1),
          0,
        ),

      getUnreadNotifications: () =>
        notifications.filter(
          notification => !isNotificationRead(notification?.isRead),
        ),

      getAllNotifications: () => notifications,

      disconnect: () => ctx.disconnect(authContext),

      reconnect: () => ctx.reconnect(authContext),
    };
  }, [authContext, ctx, store, version]);
};
