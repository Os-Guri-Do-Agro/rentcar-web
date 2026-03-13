import { toast } from '@/components/ui/use-toast';

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Request queue to prevent simultaneous duplicates
const pendingRequests = new Map();

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds have elapsed
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Creates a throttled function that only invokes func at most once per every limit milliseconds
 */
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

/**
 * Handles errors with special case for 429 Too Many Requests
 */
export function handleApiError(error, customMessage = null) {
  console.error(`API Error:`, error);
  
  if (error?.status === 429 || (error?.message && error.message.includes('429'))) {
    toast({
      title: "Muitas requisições",
      description: "Aguarde um momento antes de tentar novamente...",
      variant: "destructive",
      duration: 5000,
    });
    throw new Error('Muitas requisições. Aguarde um momento...');
  }
  
  if (error?.code === '42501') {
    throw new Error('Acesso negado. Você não tem permissão para realizar esta ação.');
  }

  throw error;
}

/**
 * Wraps an async function with retry logic and caching
 * @param {Function} apiCall - The async function to call
 * @param {string} cacheKey - Unique key for caching results
 * @param {boolean} useCache - Whether to use the cache
 * @param {number} retries - Number of retries on failure
 */
export async function fetchWithRetry(apiCall, cacheKey = null, useCache = true, retries = 3) {
  // Check cache
  if (useCache && cacheKey) {
    const cached = cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      console.log(`[Cache Hit] ${cacheKey}`);
      return cached.data;
    }
  }

  // Check pending requests (deduplication)
  if (cacheKey && pendingRequests.has(cacheKey)) {
    console.log(`[Request Queue] Waiting for pending request: ${cacheKey}`);
    return pendingRequests.get(cacheKey);
  }

  const execute = async () => {
    let lastError;
    let delay = 1000; // Initial delay 1s

    for (let i = 0; i < retries; i++) {
      try {
        const start = Date.now();
        console.log(`[API Start] ${cacheKey || 'Anonymous Request'} - Attempt ${i + 1}`);
        
        const result = await apiCall();
        
        console.log(`[API Success] ${cacheKey || 'Anonymous Request'} - ${Date.now() - start}ms`);
        
        if (useCache && cacheKey) {
          cache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
          });
        }
        return result;

      } catch (error) {
        lastError = error;
        console.warn(`[API Fail] ${cacheKey || 'Anonymous Request'} - Attempt ${i + 1}`, error);
        
        if (error?.status === 429) {
          // Exponential backoff for 429
          await new Promise(r => setTimeout(r, delay));
          delay *= 2; 
        } else {
          // Break immediately for non-transient errors like 400, 401, 403, 404
           if ([400, 401, 403, 404, 422].includes(error?.status)) throw error;
           // If it's a network error or 5xx, retry
           await new Promise(r => setTimeout(r, delay));
           delay *= 1.5;
        }
      }
    }
    
    // Cleanup pending if failed
    if (cacheKey) pendingRequests.delete(cacheKey);
    
    handleApiError(lastError);
  };

  const promise = execute();
  
  if (cacheKey) {
    pendingRequests.set(cacheKey, promise);
    // Cleanup pending after completion (success or fail)
    promise.finally(() => {
      pendingRequests.delete(cacheKey);
    });
  }

  return promise;
}

export function clearCache(key) {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}