import { TokenAccount } from "./tokenAccount";

export interface User {
    publicKey: string;
    tokenAccounts: TokenAccount[];
}