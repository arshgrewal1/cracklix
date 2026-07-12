
'use client';

/**
 * @fileOverview Institutional AI Service Manager v1.3.
 * Supports Multi-Key Rotation (Failover Architecture).
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
  private readonly MAX_RETRIES = 3;

  constructor() {
    this.initializeProviders();
  }

  /**
   * Reads multiple keys from the environment pool.
   * Format expected: "key1,key2,key3..."
   */
  private initializeProviders() {
    if (typeof window === 'undefined') return;

    // Supports both direct keys and comma-separated pools
    const keyPool = process.env.NEXT_PUBLIC_GOOGLE_GENAI_API_KEY || "";
    const keys = keyPool.split(',').filter(Boolean);

    this.providers = keys.map((key, idx) => ({
      id: `gemini-node-${idx + 1}`,
      apiKey: key.trim(),
      status: 'HEALTHY',
      lastUsedAt: 0,
      failureCount: 0
    }));

    if (this.providers.length === 0) {
      console.warn('[AI_MANAGER] WARNING: No Gemini credentials detected in .env registry.');
    } else {
      console.log(`[AI_MANAGER] Registry Initialized with ${this.providers.length} provider nodes.`);
    }
  }

  /**
   * Resilient execution engine with automatic rotation.
   */
  async execute<T>(
    operationName: string,
    operation: (apiKey: string) => Promise<T>,
    onRetry?: (count: number) => void
  ): Promise<T> {
    let attempt = 0;
    let lastError: any = null;

    if (this.providers.length === 0) {
       throw new Error('AI Provider Registry Empty. Please add NEXT_PUBLIC_GOOGLE_GENAI_API_KEY in your .env file. (Supports comma-separated keys for rotation)');
    }

    while (attempt <= this.MAX_RETRIES) {
      const provider = this.getHealthyProvider();
      if (!provider) {
        throw new Error('All configured AI nodes are currently exhausted or disconnected.');
      }

      try {
        console.log(`[AI_MANAGER] [${operationName}] Executing via ${provider.id}`);
        const result = await operation(provider.apiKey);
        
        this.markSuccess(provider.id);
        return result;

      } catch (error: any) {
        lastError = error;
        attempt++;
        
        const isRateLimit = error.status === 429 || error.message?.toLowerCase().includes('rate');
        console.warn(`[AI_MANAGER] [${operationName}] Node ${provider.id} Failure: ${error.message}`);

        if (isRateLimit || attempt <= this.MAX_RETRIES) {
          this.markFailure(provider.id);
          this.rotateProvider(); // Immediately move to next key on rate limit
          
          const backoff = Math.pow(2, attempt) * 1000 + (Math.random() * 500);
          onRetry?.(attempt);
          await new Promise(r => setTimeout(r, backoff));
        } else {
          this.markFailure(provider.id);
          break;
        }
      }
    }

    throw lastError || new Error('AI Operation failed after full cycle of provider nodes.');
  }

  private getHealthyProvider(): ProviderConfig | null {
    const healthy = this.providers.filter(p => p.status !== 'FAILED');
    if (healthy.length === 0) return null;
    return healthy[this.currentProviderIdx % healthy.length];
  }

  private rotateProvider() {
    this.currentProviderIdx = (this.currentProviderIdx + 1) % this.providers.length;
  }

  private markFailure(id: string) {
    const p = this.providers.find(p => p.id === id);
    if (p) {
      p.failureCount++;
      p.lastUsedAt = Date.now();
      if (p.failureCount >= 3) p.status = 'FAILED';
      else p.status = 'DEGRADED';
    }
  }

  private markSuccess(id: string) {
    const p = this.providers.find(p => p.id === id);
    if (p) {
      p.failureCount = 0;
      p.status = 'HEALTHY';
      p.lastUsedAt = Date.now();
    }
  }

  getPoolHealth() {
    return this.providers.map(p => ({ id: p.id, status: p.status }));
  }
}

export const aiManager = new AIManager();
