
'use client';

/**
 * @fileOverview Institutional AI Service Manager v1.6.
 * Supports Multi-Key Rotation & Automatic Failover.
 * FIXED: Filters pool for valid API keys (AIzaSy) and handles 404/Invalid Key errors.
 */

export type AIProviderStatus = 'HEALTHY' | 'DEGRADED' | 'FAILED';

interface ProviderConfig {
  id: string;
  apiKey: string;
  status: AIProviderStatus;
  lastUsedAt: number;
  failureCount: number;
}

class AIManager {
  private providers: ProviderConfig[] = [];
  private currentProviderIdx: number = 0;
  private readonly MAX_RETRIES = 5; // Increased retries for larger pools

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    if (typeof window === 'undefined') return;

    // Detect key pool from environment
    const keyPool = process.env.NEXT_PUBLIC_GOOGLE_GENAI_API_KEY || "";
    
    // FILTER: Only keep keys starting with AIzaSy. Ignore session tokens starting with AQ.
    const keys = keyPool.split(',')
      .map(k => k.trim())
      .filter(k => k.startsWith('AIzaSy'));

    this.providers = keys.map((key, idx) => ({
      id: `node-${idx + 1}`,
      apiKey: key,
      status: 'HEALTHY',
      lastUsedAt: 0,
      failureCount: 0
    }));

    if (this.providers.length === 0) {
      console.warn('[AI_MANAGER] CRITICAL: No valid Gemini API keys found in pool.');
    } else {
      console.log(`[AI_MANAGER] Registry initialized with ${this.providers.length} healthy nodes.`);
    }
  }

  async execute<T>(
    operationName: string,
    operation: (apiKey: string) => Promise<T>,
    onRetry?: (count: number) => void
  ): Promise<T> {
    let attempt = 0;
    let lastError: any = null;

    if (this.providers.length === 0) {
       throw new Error('AI Registry is offline. No valid API keys configured.');
    }

    while (attempt <= this.MAX_RETRIES) {
      const provider = this.getHealthyProvider();
      if (!provider) {
        throw new Error('AI Pool Exhausted. All configured nodes have returned errors.');
      }

      try {
        console.log(`[AI_MANAGER] Routing ${operationName} through ${provider.id}...`);
        const result = await operation(provider.apiKey);
        this.markSuccess(provider.id);
        return result;

      } catch (error: any) {
        lastError = error;
        attempt++;
        
        console.warn(`[AI_MANAGER] Node ${provider.id} reported error:`, error.message);
        
        // If it's a 404 or Unauthorized, the key is likely invalid or misconfigured
        const isCritical = error.status === 404 || error.status === 401 || error.message?.includes('404');
        
        if (isCritical) {
           this.markFailure(provider.id, true); // Immediate permanent failure
        } else {
           this.markFailure(provider.id);
        }

        this.rotateProvider();

        if (attempt <= this.MAX_RETRIES) {
          const backoff = Math.pow(2, attempt) * 1000;
          onRetry?.(attempt);
          await new Promise(r => setTimeout(r, backoff));
        } else {
          break;
        }
      }
    }

    throw lastError || new Error('AI Operations failed across all pool nodes.');
  }

  private getHealthyProvider(): ProviderConfig | null {
    const healthy = this.providers.filter(p => p.status !== 'FAILED');
    if (healthy.length === 0) return null;
    return healthy[this.currentProviderIdx % healthy.length];
  }

  private rotateProvider() {
    this.currentProviderIdx = (this.currentProviderIdx + 1) % this.providers.length;
  }

  private markFailure(id: string, permanent: boolean = false) {
    const p = this.providers.find(p => p.id === id);
    if (p) {
      p.failureCount++;
      if (permanent || p.failureCount >= 3) p.status = 'FAILED';
      else p.status = 'DEGRADED';
    }
  }

  private markSuccess(id: string) {
    const p = this.providers.find(p => p.id === id);
    if (p) {
      p.failureCount = 0;
      p.status = 'HEALTHY';
    }
  }
}

export const aiManager = new AIManager();
