
'use client';

/**
 * @fileOverview Institutional AI Service Manager v1.1.
 * Centralized hub for resilient AI requests with failover, retry logic, and health monitoring.
 * UPDATED: Enhanced diagnostic logging for missing credentials.
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
   * Reads multiple keys from environment variables.
   * Standardized for production deployment.
   */
  private initializeProviders() {
    if (typeof window === 'undefined') return;

    // Check for pool or individual keys
    const keyPool = process.env.NEXT_PUBLIC_AI_KEY_POOL || process.env.NEXT_PUBLIC_GOOGLE_GENAI_API_KEY || "";
    const keys = keyPool.split(',').filter(Boolean);

    this.providers = keys.map((key, idx) => ({
      id: `google-ai-${idx}`,
      apiKey: key.trim(),
      status: 'HEALTHY',
      lastUsedAt: 0,
      failureCount: 0
    }));

    if (this.providers.length === 0) {
      console.warn('[AI_MANAGER] CRITICAL: No AI credentials detected in registry. Please add NEXT_PUBLIC_GOOGLE_GENAI_API_KEY to your environment.');
    }
  }

  /**
   * Resilient wrapper for AI calls.
   */
  async execute<T>(
    operationName: string,
    operation: (apiKey: string) => Promise<T>,
    onRetry?: (count: number) => void
  ): Promise<T> {
    let attempt = 0;
    let lastError: any = null;

    // DIAGNOSTIC GUARD: If no keys are set, provide a helpful error instead of a generic "unavailable"
    if (this.providers.length === 0) {
       throw new Error('AI providers missing. Please set your GOOGLE_GENAI_API_KEY in the environment variables.');
    }

    while (attempt <= this.MAX_RETRIES) {
      const provider = this.getHealthyProvider();
      if (!provider) {
        throw new Error('All configured AI providers are currently exhausted or degraded.');
      }

      try {
        console.log(`[AI_MANAGER] [${operationName}] Request Started using ${provider.id}`);
        const result = await operation(provider.apiKey);
        
        // Success: Mark healthy and return
        this.markSuccess(provider.id);
        console.log(`[AI_MANAGER] [${operationName}] Request Success`);
        return result;

      } catch (error: any) {
        lastError = error;
        attempt++;
        
        const isTransient = this.isTransientError(error);
        console.warn(`[AI_MANAGER] [${operationName}] Attempt ${attempt} Failed: ${error.message}`);

        if (isTransient && attempt <= this.MAX_RETRIES) {
          this.markFailure(provider.id);
          const backoff = Math.pow(2, attempt) * 1000 + (Math.random() * 1000);
          console.log(`[AI_MANAGER] Retrying in ${Math.round(backoff)}ms...`);
          onRetry?.(attempt);
          await new Promise(r => setTimeout(r, backoff));
        } else {
          this.markFailure(provider.id);
          if (this.providers.length > 1 && attempt <= this.MAX_RETRIES) {
            this.rotateProvider();
            continue;
          }
          break;
        }
      }
    }

    throw lastError || new Error('AI Operation failed after maximum retries.');
  }

  private getHealthyProvider(): ProviderConfig | null {
    const healthy = this.providers.filter(p => p.status !== 'FAILED');
    if (healthy.length === 0) return null;
    return healthy[this.currentProviderIdx % healthy.length];
  }

  private rotateProvider() {
    this.currentProviderIdx++;
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

  private isTransientError(error: any): boolean {
    const msg = error.message?.toLowerCase() || "";
    return (
      msg.includes('rate limit') || 
      msg.includes('timeout') || 
      msg.includes('exhausted') || 
      msg.includes('fetch') ||
      error.status === 429 ||
      error.status >= 500
    );
  }

  getProviderHealth(): ProviderConfig[] {
    return this.providers.map(p => ({ ...p }));
  }
}

export const aiManager = new AIManager();
