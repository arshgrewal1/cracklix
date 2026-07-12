
'use client';

/**
 * @fileOverview Institutional AI Service Manager v1.5.
 * Supports Multi-Key Rotation & Automatic Failover.
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

  private initializeProviders() {
    if (typeof window === 'undefined') return;

    // Detect key pool from environment
    const keyPool = process.env.NEXT_PUBLIC_GOOGLE_GENAI_API_KEY || "";
    const keys = keyPool.split(',').map(k => k.trim()).filter(Boolean);

    this.providers = keys.map((key, idx) => ({
      id: `node-${idx + 1}`,
      apiKey: key,
      status: 'HEALTHY',
      lastUsedAt: 0,
      failureCount: 0
    }));

    if (this.providers.length === 0) {
      console.warn('[AI_MANAGER] WARNING: AI Provider Registry Empty. Check .env file.');
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
       throw new Error('AI Provider Registry is empty. Please add your keys to the .env file.');
    }

    while (attempt <= this.MAX_RETRIES) {
      const provider = this.getHealthyProvider();
      if (!provider) {
        throw new Error('All AI nodes are currently exhausted. Please add more keys or wait.');
      }

      try {
        const result = await operation(provider.apiKey);
        this.markSuccess(provider.id);
        return result;

      } catch (error: any) {
        lastError = error;
        attempt++;
        
        // Failover Logic: If rate limited or error, try next key immediately
        const isRateLimit = error.status === 429 || error.message?.toLowerCase().includes('rate');
        
        this.markFailure(provider.id);
        this.rotateProvider();

        if (attempt <= this.MAX_RETRIES) {
          const backoff = Math.pow(2, attempt) * 1000 + (Math.random() * 500);
          onRetry?.(attempt);
          await new Promise(r => setTimeout(r, backoff));
        } else {
          break;
        }
      }
    }

    throw lastError || new Error('AI Operation failed after cycling through available nodes.');
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
      if (p.failureCount >= 3) p.status = 'FAILED';
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
