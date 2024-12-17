interface TokenBucket {
    tokens: number;
    lastRefill: number;
}

export class RateLimiter {
    private buckets: Map<string, TokenBucket>;
    private readonly maxTokens: number;
    private readonly refillRate: number; // tokens per second
    private readonly refillInterval: number; // milliseconds

    constructor(
        maxTokens: number = 10,
        refillRate: number = 2, // 2 tokens per second
        refillInterval: number = 1000 // 1 second
    ) {
        this.buckets = new Map();
        this.maxTokens = maxTokens;
        this.refillRate = refillRate;
        this.refillInterval = refillInterval;
    }

    async consume(key: string, tokens: number = 1): Promise<boolean> {
        let bucket = this.buckets.get(key);
        const now = Date.now();

        if (!bucket) {
            bucket = {
                tokens: this.maxTokens,
                lastRefill: now
            };
            this.buckets.set(key, bucket);
        }

        // Refill tokens based on time elapsed
        const timePassed = now - bucket.lastRefill;
        const refillAmount = (timePassed / this.refillInterval) * this.refillRate;
        bucket.tokens = Math.min(this.maxTokens, bucket.tokens + refillAmount);
        bucket.lastRefill = now;

        // Check if we have enough tokens
        if (bucket.tokens < tokens) {
            return false; // Rate limit exceeded
        }

        // Consume tokens
        bucket.tokens -= tokens;
        return true;
    }

    async getDelay(key: string, tokens: number = 1): Promise<number> {
        const bucket = this.buckets.get(key);
        if (!bucket) return 0;

        const tokensNeeded = tokens - bucket.tokens;
        if (tokensNeeded <= 0) return 0;

        return (tokensNeeded / this.refillRate) * this.refillInterval;
    }

    async reset(key: string): Promise<void> {
        this.buckets.delete(key);
    }
}