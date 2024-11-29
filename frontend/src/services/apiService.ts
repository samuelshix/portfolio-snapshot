import axios from "axios";
import { TokenAccount } from "../model/tokenAccount";
import { Token } from "../model/token";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const getUser = async (publicKey: string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/users`, {
            params: { address: publicKey }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
};

const createUserIfNotExists = async (publicKey: string) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/users/newUser`, { address: publicKey });
        return response.data;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

const saveTokenAccountsRequest = async (tokenAccount: TokenAccount, publicKey: string) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/token-accounts/createTokenAccount`,
            {
                userAddress: publicKey,
                tokenMint: tokenAccount.token.mint,
                balance: tokenAccount.tokenAmount,
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error saving token accounts:', error);
        throw error;
    }
};


const getToken = async (mint: string) => {
    try {
        console.log(mint)
        const response = await axios.get(`${API_BASE_URL}/tokens/token`, {
            params: { mint }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching token:', error);
        throw error;
    }
};

const saveToken = async (token: Token) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/tokens/setToken`, token);
        return response.data;
    } catch (error) {
        console.error('Error setting token:', error);
        throw error;
    }
};

const getTokenPrices = async (tokenMint: string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/tokens/tokenPrices`, {
            params: { tokenMint }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching token prices:', error);
        throw error;
    }
};

const saveTokenPrice = async (tokenPriceData: { mint: string, price: number, date: string }) => {
    console.log("saving token price", tokenPriceData);
    try {
        const response = await axios.post(`${API_BASE_URL}/tokens/createTokenPrice`, tokenPriceData);
        return response.data;
    } catch (error) {
        console.error('Error creating token price:', error);
        throw error;
    }
};

export {
    getUser,
    createUserIfNotExists,
    saveTokenAccountsRequest,
    getToken,
    saveToken,
    getTokenPrices,
    saveTokenPrice
};