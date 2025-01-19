import { makeAutoObservable } from 'mobx';
import { TokenAccount } from "../types/tokenAccount";
import { api } from "./api";

class TokenAccountStore {
    tokenAccounts: TokenAccount[] = [];

    constructor() {
        makeAutoObservable(this);
    }

    async loadUserTokens(address: string) {
        try {
            const { data } = await api.users.getWithTokenData(address);
            console.log(data)
            this.tokenAccounts = data.tokenAccounts;
            return this.tokenAccounts;
        } catch (error) {
            console.error('Failed to load user tokens:', error);
            throw error;
        }
    }

    getToken(mint: string): TokenAccount | undefined {
        return this.tokenAccounts.find(t => t.token.mint === mint);
    }

    getAllTokens(): TokenAccount[] {
        return this.tokenAccounts;
    }

    hasToken(mint: string): boolean {
        return this.tokenAccounts.some(t => t.token.mint === mint);
    }
}

// Export a singleton instance
export const tokenStore = new TokenAccountStore();