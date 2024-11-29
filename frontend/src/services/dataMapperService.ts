import { PublicKey } from "@solana/web3.js";
import { getAllTokens } from "../api/getAssets";
import { getPriceData } from "../api/getPriceData";
import { HeliusBalancesResponse } from "../model/heliusBalancesResponse";
import { TokenAccount } from "../model/tokenAccount";
import { Token } from "../model/token";
import tokenService from "./tokenService";

/**
 * Service for transforming raw API data into frontend interfaces.
 */
class DataMapperService {
    private rawTokenData: any[] = [];
    private rawTokenAccountData: HeliusBalancesResponse;
    constructor(rawTokenData: any[], rawTokenAccountData: HeliusBalancesResponse) {
        this.rawTokenData = rawTokenData;
        this.rawTokenAccountData = rawTokenAccountData;
    }

    convertTokenAmountDecimals(token: Token, amount: number): TokenAccount {
        return {
            token: token,
            tokenAmount: amount / Math.pow(10, token.decimals),
        }
    }

    async apiDataToTokenAccounts(tokens: Token[]): Promise<TokenAccount[]> {
        const tokenWithPrices = await tokenService.initialize(tokens);
        console.log("Token with prices:", tokenWithPrices)
        const tokenAccounts: TokenAccount[] = [];
        tokenWithPrices.forEach((token: Token) => {
            tokenAccounts.push({
                token: token,
                tokenAmount: this.rawTokenAccountData.tokens.find((tokenAccount) => tokenAccount.mint === token.mint)?.amount || 0
            })
        })
        return tokenAccounts;
    }

    apiDataToTokens(): Token[] {
        return this.rawTokenData.map((token: { "address": string, "name": string, "symbol": string, "decimals": number, "logoURI": string }) => {
            return {
                mint: token.address,
                name: token.name,
                symbol: token.symbol,
                decimals: token.decimals,
                logoURI: token.logoURI,
                prices: []
            }
        });
    }
    // /**
    //  * Converts Helius API data to Token interface.
    //  * @param data - The Helius API data.
    //  * @param publicKey - The public key of the user.
    //  * @returns An array of Token objects.
    //  */
    // apiDataToTokens(): Token[] {
    //     const tokens: Token[] = [];
    //     for (const token of this.tokens) {
    //         const tokenMetadata = this.tokenData.find((token: { "address": string, "name": string, "symbol": string }) => token.address === tokenAccount.mint);
    //         if (!tokenMetadata) {
    //             continue;
    //         }
    //         const token: Token = {
    //             mint: tokenAccount.mint,
    //             name: tokenMetadata.name,
    //             symbol: tokenMetadata.symbol,
    //             decimals: tokenAccount.decimals,
    //             logoURI: tokenMetadata.logoURI,
    //             prices: []
    //         };
    //         tokens.push(token);
    //     }
    //     const solToken = {
    //         mint: "So11111111111111111111111111111111111111112",
    //         name: "Solana",
    //         symbol: "SOL",
    //         decimals: 9,
    //         logoURI: "",
    //         prices: []
    //     }
    //     return tokens
    // }


}
export default DataMapperService;