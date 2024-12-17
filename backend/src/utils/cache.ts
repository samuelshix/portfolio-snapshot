interface CacheItem<T> {
    value: T;
    expiresAt: number;
}

export class Cache {
    private store: Map<string, CacheItem<any>>;

    constructor() {
        this.store = new Map();
        // Clean up expired items periodically
        setInterval(() => this.cleanup(), 60000); // Run cleanup every minute
    }

    async get<T>(key: string): Promise<T | null> {
        const item = this.store.get(key);
        if (!item) return null;

        // Check if item has expired
        if (Date.now() > item.expiresAt) {
            this.store.delete(key);
            return null;
        }

        return item.value;
    }

    async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
        const expiresAt = Date.now() + (ttlSeconds * 1000);
        this.store.set(key, {
            value,
            expiresAt
        });
    }

    async delete(key: string): Promise<void> {
        this.store.delete(key);
    }

    private cleanup(): void {
        const now = Date.now();
        for (const [key, item] of this.store.entries()) {
            if (now > item.expiresAt) {
                this.store.delete(key);
            }
        }
    }
}