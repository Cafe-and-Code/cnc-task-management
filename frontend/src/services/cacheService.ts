// Cache service for API calls and data management
interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  maxSize?: number // Maximum number of items in cache
  strategy?: 'lru' | 'fifo' | 'lfu' // Cache eviction strategy
  persist?: boolean // Whether to persist to localStorage
  compress?: boolean // Whether to compress cached data
  key?: string // Custom cache key
}

interface CacheEntry<T = any> {
  data: T
  timestamp: number
  ttl: number
  accessCount: number
  lastAccessed: number
  size: number
}

interface CacheStats {
  size: number
  maxSize: number
  hitRate: number
  missRate: number
  totalHits: number
  totalMisses: number
  evictions: number
  memoryUsage: number
}

class CacheManager {
  private cache = new Map<string, CacheEntry>()
  private maxSize: number
  private strategy: 'lru' | 'fifo' | 'lfu'
  private persist: boolean
  private compress: boolean
  private stats = {
    totalHits: 0,
    totalMisses: 0,
    evictions: 0
  }

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 100
    this.strategy = options.strategy || 'lru'
    this.persist = options.persist || false
    this.compress = options.compress || false

    // Load persisted cache if enabled
    if (this.persist) {
      this.loadFromStorage()
    }
  }

  // Set cache entry
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const ttl = options.ttl || 3600000 // Default 1 hour
    const now = Date.now()
    const size = this.calculateSize(data)

    // Check if we need to evict entries
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evict()
    }

    const entry: CacheEntry<T> = {
      data: this.compress ? this.compressData(data) : data,
      timestamp: now,
      ttl,
      accessCount: 0,
      lastAccessed: now,
      size
    }

    this.cache.set(key, entry)

    // Persist if enabled
    if (this.persist) {
      this.saveToStorage()
    }
  }

  // Get cache entry
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T>

    if (!entry) {
      this.stats.totalMisses++
      return null
    }

    const now = Date.now()

    // Check if entry has expired
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      this.stats.totalMisses++
      if (this.persist) {
        this.saveToStorage()
      }
      return null
    }

    // Update access information
    entry.accessCount++
    entry.lastAccessed = now

    this.stats.totalHits++

    return this.compress ? this.decompressData(entry.data) : entry.data
  }

  // Check if key exists and is not expired
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      if (this.persist) {
        this.saveToStorage()
      }
      return false
    }

    return true
  }

  // Delete cache entry
  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted && this.persist) {
      this.saveToStorage()
    }
    return deleted
  }

  // Clear all cache entries
  clear(): void {
    this.cache.clear()
    this.stats = {
      totalHits: 0,
      totalMisses: 0,
      evictions: 0
    }
    if (this.persist) {
      this.saveToStorage()
    }
  }

  // Get cache statistics
  getStats(): CacheStats {
    const total = this.stats.totalHits + this.stats.totalMisses
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: total > 0 ? this.stats.totalHits / total : 0,
      missRate: total > 0 ? this.stats.totalMisses / total : 0,
      totalHits: this.stats.totalHits,
      totalMisses: this.stats.totalMisses,
      evictions: this.stats.evictions,
      memoryUsage: this.calculateMemoryUsage()
    }
  }

  // Evict entries based on strategy
  private evict(): void {
    if (this.cache.size === 0) return

    let keyToDelete: string

    switch (this.strategy) {
      case 'lru': // Least Recently Used
        keyToDelete = this.findLRU()
        break
      case 'fifo': // First In First Out
        keyToDelete = this.findFIFO()
        break
      case 'lfu': // Least Frequently Used
        keyToDelete = this.findLFU()
        break
      default:
        keyToDelete = this.findLRU()
    }

    if (keyToDelete) {
      this.cache.delete(keyToDelete)
      this.stats.evictions++
    }
  }

  // Find Least Recently Used entry
  private findLRU(): string {
    let oldestKey = ''
    let oldestTime = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed
        oldestKey = key
      }
    }

    return oldestKey
  }

  // Find First In First Out entry
  private findFIFO(): string {
    let oldestKey = ''
    let oldestTime = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp
        oldestKey = key
      }
    }

    return oldestKey
  }

  // Find Least Frequently Used entry
  private findLFU(): string {
    let leastUsedKey = ''
    let leastAccessCount = Infinity

    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessCount < leastAccessCount) {
        leastAccessCount = entry.accessCount
        leastUsedKey = key
      }
    }

    return leastUsedKey
  }

  // Calculate approximate size of data
  private calculateSize(data: any): number {
    try {
      return JSON.stringify(data).length * 2 // Rough estimation in bytes
    } catch {
      return 1000 // Default size if JSON.stringify fails
    }
  }

  // Calculate total memory usage
  private calculateMemoryUsage(): number {
    let totalSize = 0
    for (const entry of this.cache.values()) {
      totalSize += entry.size
    }
    return totalSize
  }

  // Compress data (simple implementation)
  private compressData(data: any): any {
    // In a real implementation, you might use a compression library
    // For now, just return the data as-is
    return data
  }

  // Decompress data (simple implementation)
  private decompressData(data: any): any {
    // In a real implementation, you might use a compression library
    // For now, just return the data as-is
    return data
  }

  // Save cache to localStorage
  private saveToStorage(): void {
    try {
      const cacheData = {
        entries: Array.from(this.cache.entries()),
        stats: this.stats,
        timestamp: Date.now()
      }
      localStorage.setItem('cache_manager', JSON.stringify(cacheData))
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error)
    }
  }

  // Load cache from localStorage
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('cache_manager')
      if (stored) {
        const cacheData = JSON.parse(stored)

        // Check if cache is not too old (24 hours)
        if (Date.now() - cacheData.timestamp < 86400000) {
          this.cache = new Map(cacheData.entries)
          this.stats = cacheData.stats
        }
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error)
    }
  }
}

// API Cache Service
class APICacheService {
  private cache = new CacheManager({
    maxSize: 200,
    ttl: 300000, // 5 minutes default
    strategy: 'lru',
    persist: true,
    compress: false
  })

  private requestCache = new Map<string, Promise<any>>()

  // Cache GET requests
  async get<T>(url: string, options: RequestInit = {}): Promise<T> {
    const cacheKey = this.getCacheKey('GET', url, options)

    // Try to get from cache first
    const cached = this.cache.get<T>(cacheKey)
    if (cached) {
      return cached
    }

    // Check if request is already in progress
    const ongoingRequest = this.requestCache.get(cacheKey)
    if (ongoingRequest) {
      return ongoingRequest
    }

    // Make new request
    const requestPromise = this.makeRequest<T>(url, options)
    this.requestCache.set(cacheKey, requestPromise)

    try {
      const data = await requestPromise
      this.cache.set(cacheKey, data, {
        ttl: this.getTTLForURL(url),
        key: cacheKey
      })
      return data
    } finally {
      this.requestCache.delete(cacheKey)
    }
  }

  // Cache POST requests (with caution)
  async post<T>(url: string, data: any, options: RequestInit = {}): Promise<T> {
    const cacheKey = this.getCacheKey('POST', url, { ...options, body: data })

    // For POST requests, we might want to cache based on the request body
    // but be careful about caching mutating operations
    const cached = this.cache.get<T>(cacheKey)
    if (cached) {
      return cached
    }

    const result = await this.makeRequest<T>(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    // Cache POST results for a shorter time
    this.cache.set(cacheKey, result, {
      ttl: 60000, // 1 minute
      key: cacheKey
    })

    return result
  }

  // Invalidate cache entries
  invalidate(pattern: string | RegExp): void {
    if (typeof pattern === 'string') {
      // Exact match
      this.cache.delete(pattern)
    } else {
      // Regex pattern
      for (const key of this.cache.cache.keys()) {
        if (pattern.test(key)) {
          this.cache.delete(key)
        }
      }
    }
  }

  // Clear all cache
  clear(): void {
    this.cache.clear()
    this.requestCache.clear()
  }

  // Get cache statistics
  getStats(): CacheStats {
    return this.cache.getStats()
  }

  // Prefetch data
  async prefetch<T>(url: string, options: RequestInit = {}): Promise<void> {
    const cacheKey = this.getCacheKey('GET', url, options)

    // Don't prefetch if already cached
    if (this.cache.has(cacheKey)) {
      return
    }

    try {
      await this.get<T>(url, options)
    } catch (error) {
      console.warn('Failed to prefetch data:', error)
    }
  }

  // Make actual HTTP request
  private async makeRequest<T>(url: string, options: RequestInit): Promise<T> {
    const response = await fetch(url, options)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // Generate cache key
  private getCacheKey(method: string, url: string, options: RequestInit): string {
    const keyParts = [method, url]

    // Include relevant headers in cache key
    if (options.headers) {
      const relevantHeaders = ['Authorization', 'Accept-Language']
      for (const header of relevantHeaders) {
        if (options.headers[header]) {
          keyParts.push(`${header}:${options.headers[header]}`)
        }
      }
    }

    // Include query parameters
    if (options.body && method !== 'GET') {
      keyParts.push(`body:${typeof options.body === 'string' ? options.body : JSON.stringify(options.body)}`)
    }

    return keyParts.join('|')
  }

  // Get TTL based on URL pattern
  private getTTLForURL(url: string): number {
    // Different TTLs for different types of data
    if (url.includes('/projects/')) {
      return 600000 // 10 minutes for project data
    } else if (url.includes('/tasks/')) {
      return 300000 // 5 minutes for task data
    } else if (url.includes('/users/')) {
      return 900000 // 15 minutes for user data
    } else if (url.includes('/reports/')) {
      return 1800000 // 30 minutes for reports
    } else {
      return 300000 // Default 5 minutes
    }
  }
}

// React Hook for API caching
export const useAPICache = () => {
  const cacheService = new APICacheService()

  return {
    get: <T>(url: string, options?: RequestInit) => cacheService.get<T>(url, options),
    post: <T>(url: string, data: any, options?: RequestInit) => cacheService.post<T>(url, data, options),
    invalidate: (pattern: string | RegExp) => cacheService.invalidate(pattern),
    clear: () => cacheService.clear(),
    prefetch: <T>(url: string, options?: RequestInit) => cacheService.prefetch<T>(url, options),
    getStats: () => cacheService.getStats()
  }
}

// Global cache service instance
export const apiCache = new APICacheService()

// React Context for cache
export const CacheContext = React.createContext<APICacheService>(apiCache)

export const CacheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <CacheContext.Provider value={apiCache}>
    {children}
  </CacheContext.Provider>
)

export const useCache = () => React.useContext(CacheContext)

export default APICacheService