import { heliusBalancesResponse } from "../mockData/tokenAccounts";

const HELIUS_KEY = process.env.REACT_APP_HELIUS_API_KEY;

const getAssetsByOwner = async (walletAddress: String) => {
    if (process.env.REACT_APP_MOCKS_FLAG === 'true') {
        return heliusBalancesResponse
    } else {
        const url = `https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${HELIUS_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        return data;
    }
}

const getAllTokens = async () => {
    const url = 'https://token.jup.ag/all';
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

export { getAssetsByOwner };
export { getAllTokens };

// const getPriceByMintAddress = async (mintAddress) => {
//     const url = `https://price.jup.ag/v4/price?ids=${mintAddress}`;
//     const response = await fetch(url);
//     const data = await response.json();
//     return data;
// }