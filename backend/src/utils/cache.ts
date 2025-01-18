export class Cache {
    private cache: Map<string, { value: any; expiry: number }>;

    constructor() {
        this.cache = new Map();
    }

    async get<T>(key: string): Promise<T | null> {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }

        return item.value as T;
    }

    async set(key: string, value: any, ttlSeconds: number): Promise<void> {
        const expiry = Date.now() + (ttlSeconds * 1000);
        this.cache.set(key, { value, expiry });
    }
}