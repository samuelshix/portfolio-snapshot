import axios from 'axios';
import { Token } from '../types/token';
import { TokenAccount } from '../types/tokenAccount';
import { User } from '../types/user';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

interface UserWithTokenData {
    address: string;
    tokenAccounts: TokenAccount[];
}

export const api = {
    users: {
        getWithTokenData: (address: string) =>
            axios.get<UserWithTokenData>(`${API_BASE_URL}/users/withTokens`, { params: { address } }),
        create: (address: string) =>
            axios.post<User>(`${API_BASE_URL}/users/newUser`, { address }),
    },
    tokens: {
        get: (mint: string) =>
            axios.get<Token>(`${API_BASE_URL}/tokens/token`, { params: { mint } }),
        save: (token: Token) =>
            axios.post<Token>(`${API_BASE_URL}/tokens/setToken`, token),
    },
    tokenAccounts: {
        getBalances: (publicKey: string) =>
            axios.get(`${API_BASE_URL}/token-accounts/getBalances`, { params: { publicKey } }),
        save: (tokenAccount: TokenAccount, publicKey: string) =>
            axios.post(`${API_BASE_URL}/token-accounts/createTokenAccount`, {
                userAddress: publicKey,
                tokenMint: tokenAccount.token.mint,
                balance: tokenAccount.tokenAmount,
            })
    }
};

// In your React component or MobX store
export async function loadUserData(userAddress: string) {
    try {
        const { data } = await api.users.getWithTokenData(userAddress);
        // data will contain:
        // - User information
        // - All token accounts with balances
        // - Token information including prices
        return data;
    } catch (error) {
        console.error('Error loading user data:', error);
        throw error;
    }
}