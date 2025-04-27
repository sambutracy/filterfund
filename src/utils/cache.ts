// src/utils/cache.ts
type CacheEntry<T> = {
  data: T;
  timestamp: number;
  expiry: number;
}

class MemoryCache {
  private cache: Record<string, CacheEntry<any>> = {};
  
  get<T>(key: string): T | null {
    const entry = this.cache[key];
    if (!entry) return null;
    
    // Check if the cache entry has expired
    if (Date.now() > entry.expiry) {
      this.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  set<T>(key: string, data: T, ttlSeconds: number = 60): void {
    this.cache[key] = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + (ttlSeconds * 1000)
    };
  }
  
  delete(key: string): void {
    delete this.cache[key];
  }
  
  clear(): void {
    this.cache = {};
  }
}

export const globalCache = new MemoryCache();