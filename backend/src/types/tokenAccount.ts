import { Token } from "./token";

export interface TokenAccount {
    id?: number;
    userAddress: string;
    balance: number;
    tokenMint: string;
}

export interface CreateTokenAccountDto {
    userAddress: string;
    tokenMint: string;
    balance: number;
}
