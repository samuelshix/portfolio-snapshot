import axios from 'axios';
import { Token } from '../types/token';
import { TokenAccount } from '../types/tokenAccount';
import { User } from '../types/user';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

interface UserWithTokenData {
    address: string;
    tokenAccounts: TokenAccount[];
}

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
});

axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // Handle unauthorized
        }
        return Promise.reject(error);
    }
);

export const api = {
    users: {
        getWithTokenData: (address: string) =>
            axiosInstance.get<UserWithTokenData>(`/api/users`, {
                params: { address }
            }),
        create: (address: string) =>
            axiosInstance.post<User>(`/api/users`, { address }),
    },
    // tokens: {
    //     get: (mint: string) =>
    //         axiosInstance.get<Token>(`/api/tokens/token`, { params: { mint } }),
    //     save: (token: Token) =>
    //         axiosInstance.post<Token>(`/api/tokens/setToken`, token),
    // },
    // tokenAccounts: {
    //     getBalances: (publicKey: string) =>
    //         axiosInstance.get(`/api/token-accounts/getBalances`, { params: { publicKey } }),
    //     save: (tokenAccount: TokenAccount, publicKey: string) =>
    //         axiosInstance.post(`/api/token-accounts/createTokenAccount`, {
    //             userAddress: publicKey,
    //             tokenMint: tokenAccount.token.mint,
    //             balance: tokenAccount.tokenAmount,
    //         })
    // }
};

export async function loadUserData(userAddress: string) {
    try {
        const { data } = await api.users.getWithTokenData(userAddress);

        return data;
    } catch (error) {
        console.error('Error loading user data:', error);
        throw error;
    }
}