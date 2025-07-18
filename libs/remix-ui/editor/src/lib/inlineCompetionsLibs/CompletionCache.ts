/**
 * Completion Cache for Inline Completions
 *
 */

import { monacoTypes } from '@remix-ui/editor';

interface CacheEntry {
  result: any;
  timestamp: number;
}

interface CompletionCacheOptions {
  cacheTimeout?: number;
  maxCacheSize?: number;
}

interface CompletionCacheStats {
  cacheSize: number;
  pendingRequests: number;
  hitRate: number;
}

export class CompletionCache {
  private cache: Map<string, CacheEntry> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();

  private readonly cacheTimeout: number = 30000; // 30 seconds
  private readonly maxCacheSize: number = 100;

  constructor(options?: CompletionCacheOptions) {
    if (options) {
      this.cacheTimeout = options.cacheTimeout ?? this.cacheTimeout;
      this.maxCacheSize = options.maxCacheSize ?? this.maxCacheSize;
    }
  }

  createCacheKey(
    word: string,
    wordAfter: string,
    position: monacoTypes.Position,
    task?: string
  ): string {
    // truncate context
    const contextHash = `${word.slice(-100)}_${wordAfter.slice(0, 100)}_${position.lineNumber}_${position.column}`;
    return task ? `${task}_${contextHash}` : contextHash;
  }

  /**
   * Get cached result if available and not expired
   */
  getCachedResult(cacheKey: string): any | null {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.result;
    }

    // Remove expired cache entry
    if (cached) {
      this.cache.delete(cacheKey);
    }

    return null;
  }

  /**
   * Cache a completion result
   */
  cacheResult(cacheKey: string, result: any): void {
    // Clean up old cache entries periodically
    if (this.cache.size >= this.maxCacheSize) {
      this.cleanupExpiredEntries();
    }

    // If still at capacity, remove oldest entries
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(cacheKey, {
      result: result,
      timestamp: Date.now()
    });
  }

  /**
   * Check if a request is already pending
   */
  isPending(cacheKey: string): boolean {
    return this.pendingRequests.has(cacheKey);
  }

  /**
   * Get pending request promise
   */
  getPendingRequest(cacheKey: string): Promise<any> | null {
    return this.pendingRequests.get(cacheKey) || null;
  }

  /**
   * Set a pending request
   */
  setPendingRequest(cacheKey: string, promise: Promise<any>): void {
    this.pendingRequests.set(cacheKey, promise);
  }

  /**
   * Remove a pending request
   */
  removePendingRequest(cacheKey: string): void {
    this.pendingRequests.delete(cacheKey);
  }

  /**
   * Handle a request with caching and deduplication
   */
  async handleRequest<T>(
    cacheKey: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    // Check cache first
    const cachedResult = this.getCachedResult(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // Check if same request is already pending
    const pendingRequest = this.getPendingRequest(cacheKey);
    if (pendingRequest) {
      return await pendingRequest;
    }

    // Create and store pending request
    const promise = requestFn();
    this.setPendingRequest(cacheKey, promise);

    try {
      const result = await promise;
      this.cacheResult(cacheKey, result);
      return result;
    } finally {
      this.removePendingRequest(cacheKey);
    }
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.cacheTimeout) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  getStats(): CompletionCacheStats {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      hitRate: 0 // Would need to track hits/misses to calculate this
    };
  }

  cleanup(): void {
    this.cleanupExpiredEntries();
  }
}