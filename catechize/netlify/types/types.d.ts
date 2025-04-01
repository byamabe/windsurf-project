declare module '@netlify/edge-functions' {
  export interface Context {
    ip: string;
    request: Request;
    next: () => Promise<Response>;
    env: {
      get(key: string): Promise<string | null>;
      set(key: string, value: string, options?: { ttl?: number }): Promise<void>;
    };
  }
}
