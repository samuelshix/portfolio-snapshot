import { TokenAccount } from "../model/tokenAccount";
import { createUserIfNotExists, getUser } from "./apiService";
import tokenAccountService from "./tokenAccountService";

class UserService {
    constructor() {

    }
    // async getUserData(publicKey: string): Promise<TokenAccount[]> {
    //     await createUserIfNotExists(publicKey)
    //     await tokenAccountService.initialize(publicKey)
    //     return tokenAccountService.getTokenAccounts()
    // }
}

export default new UserService();