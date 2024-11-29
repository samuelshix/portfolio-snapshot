// src/services/tokenAccountService.ts

import { PublicKey } from "@solana/web3.js";
import { getAllTokens, getAssetsByOwner } from "../api/getAssets";
import DataMapperService from "./dataMapperService";
import { createUserIfNotExists, getUser, saveToken, saveTokenAccountsRequest } from "./apiService";
import { TokenAccount } from "../model/tokenAccount";
import { get } from "http";
import { User } from "../model/user";
import { heliusBalancesResponse } from "../mockData/tokenAccounts";
import tokenService from "./tokenService";
import TokenService from "./tokenService";
import { HeliusBalancesResponse } from "../model/heliusBalancesResponse";
import { Token } from "../model/token";

/**
 * Service for handling token account operations.
 */
class TokenAccountService {
    private dataMapperService: DataMapperService | undefined;
    private tokenAccounts: TokenAccount[] = [];
    /**
     * Initializes the service with token account data and token data.
     * @param publicKey - The public key of the user.
     * @returns A promise that resolves when initialization is complete.
     */
    async initialize(publicKey: string): Promise<TokenAccount[]> {
        let tokenAccountData: HeliusBalancesResponse;
        tokenAccountData = await getAssetsByOwner(publicKey);
        // convert helius api response to token accounts[]
        const rawUserTokens = await this.getRawUserTokens(tokenAccountData);
        this.dataMapperService = new DataMapperService(rawUserTokens, heliusBalancesResponse);
        // convert birdeye api price data to token[]
        const userTokens: Token[] = await this.dataMapperService.apiDataToTokens();
        this.tokenAccounts = await this.dataMapperService.apiDataToTokenAccounts(userTokens);
        console.log("Final enriched tokenaccounts:", this.tokenAccounts)
        await this.saveTokenAccountsForAddress(publicKey, this.tokenAccounts);
        return this.tokenAccounts;
    }

    private async getRawUserTokens(tokenAccountData: HeliusBalancesResponse) {
        const tokenData = await getAllTokens();
        const rawUserTokens = []
        for (const tokenAccount of tokenAccountData.tokens) {
            const tokenMetadata = tokenData.find((token: { address: string }) => token.address === tokenAccount.mint);
            if (!tokenMetadata) {
                continue;
            }
            rawUserTokens.push(tokenMetadata);
        }
        return rawUserTokens;

    }
    private async saveTokenAccounts(enrichedTokenAccounts: TokenAccount[]): Promise<void> {
        for (const tokenAccount of enrichedTokenAccounts) {
            await saveToken(tokenAccount.token);
        }
    }

    /**
     * Fetches, enriches, and saves token accounts for a given public key.
     * Also creates a user if they do not exist.
     * @param publicKey - The public key of the user.
     * @returns A promise that resolves when all operations are complete.
     */
    private async saveTokenAccountsForAddress(publicKey: string, tokenAccounts: TokenAccount[]): Promise<void> {
        await this.saveTokenAccounts(tokenAccounts);
        try {
            // const user: User = await getUser(publicKey);
            // if (!user) {
            //     await createUserIfNotExists(publicKey);
            // }
            await Promise.all(tokenAccounts.map(async (tokenAccount) => {
                await saveTokenAccountsRequest(tokenAccount, publicKey);
            }));
        } catch (error) {
            console.error('Error saving token accounts:', error);
        }
    }
}

export default new TokenAccountService();