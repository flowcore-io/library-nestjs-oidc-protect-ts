export interface ICache {
  set: (key: string, value: unknown, ttl?: number) => Promise<void>;
  get: <T>(key: string) => Promise<T | undefined>;
}
