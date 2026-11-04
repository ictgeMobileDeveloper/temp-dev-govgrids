import {AuthContext} from '../../Utils/AppStrings';
import {activateAuthContextCookie, getAccessToken} from './AuthTokenService';

type WSStatus = 'connecting' | 'open' | 'closed' | 'error';

type MessageCallback = (data: any) => void;

type RegistryEntry = {
  socket: WebSocket;
  status: WSStatus;
  latestMessage?: any;
  listeners: Set<MessageCallback>;
};

class SessionSocketRegistry {
  private sockets = new Map<string, RegistryEntry>();

  private makeKey(authContext: AuthContext, endpoint: string) {
    return `${endpoint}::${authContext}`;
  }

  async connect(
    authContext: AuthContext,
    endpoint: string,
    onMessage?: MessageCallback,
  ) {
    console.log('listener attached');

    const key = this.makeKey(authContext, endpoint);

    if (this.sockets.has(key)) {
      const existing = this.sockets.get(key)!;
      if (
        existing.socket.readyState === WebSocket.CLOSING ||
        existing.socket.readyState === WebSocket.CLOSED
      ) {
        this.sockets.delete(key); // it's dead, clear it so we fall through and make a real new one
      } else {
        if (onMessage) existing.listeners.add(onMessage);
        return existing;
      }
    }
    const token = await activateAuthContextCookie(authContext);

    // const token = await getAccessToken(authContext);

    if (!token) {
      console.log(`🟡 WS skipped — no token for ${authContext}`);
      return null;
    }
    const url = endpoint.includes('?')
      ? `${endpoint}&token=${encodeURIComponent(token)}`
      : `${endpoint}?token=${encodeURIComponent(token)}`;

    // const url = endpoint.includes('?')
    //   ? `${endpoint}&token=${encodeURIComponent(token)}`
    //   : `${endpoint}?token=${encodeURIComponent(token)}`;

    console.log(`🔌 ${authContext} WS URL:`, url);

    const ws = new WebSocket(url);

    const entry: RegistryEntry = {
      socket: ws,
      status: 'connecting',
      listeners: new Set(),
    };

    if (onMessage) {
      entry.listeners.add(onMessage);
    }

    this.sockets.set(key, entry);

    ws.onopen = () => {
      entry.status = 'open';
      console.log('🟢 WS connected:', endpoint);
    };

    ws.onmessage = e => {
      try {
        const data = JSON.parse(e.data);
        entry.latestMessage = data;
        entry.listeners.forEach(cb => cb(data));
      } catch (err) {
        console.warn('WS message parse error:', err);
      }
    };

    ws.onerror = err => {
      entry.status = 'error';
      console.error('WS error:', err);
    };
    ws.onclose = () => {
      entry.status = 'closed';
      entry.listeners.clear();
      if (this.sockets.get(key) === entry) {
        // ← ADD THIS CHECK
        this.sockets.delete(key);
      }
      console.log('🔴 WS closed:', endpoint);
    };

    return entry;
  }

  get(authContext: AuthContext, endpoint: string) {
    return this.sockets.get(this.makeKey(authContext, endpoint));
  }

  send(authContext: AuthContext, endpoint: string, msg: any) {
    const entry = this.get(authContext, endpoint);
    if (entry?.socket.readyState === WebSocket.OPEN) {
      entry.socket.send(JSON.stringify(msg));
    }
  }

  removeListener(
    authContext: AuthContext,
    endpoint: string,
    callback: MessageCallback,
  ) {
    const entry = this.get(authContext, endpoint);
    entry?.listeners.delete(callback);
  }

  disconnect(authContext: AuthContext, endpoint: string) {
    const key = this.makeKey(authContext, endpoint);
    const entry = this.sockets.get(key);

    if (!entry) return;

    entry.listeners.clear();
    entry.socket.close();
    this.sockets.delete(key);
  }

  disconnectAll() {
    this.sockets.forEach(entry => {
      entry.listeners.clear();
      entry.socket.close();
    });
    this.sockets.clear();
  }
}

export const sessionSocketRegistry = new SessionSocketRegistry();
