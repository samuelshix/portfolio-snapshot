import { TokenService } from './tokenService';
import { MockTokenService } from './mock/mockTokenService';
import { heliusClient } from '@/clients/heliusClient';
import { mockHeliusClient } from '@/clients/mock/mockHeliusClient';

export class ServiceFactory {
    static getTokenService(useMockData: boolean) {
        if (useMockData) {
            return new MockTokenService();
        }
        return new TokenService();
    }

    static getHeliusClient(useMockData: boolean) {
        if (useMockData) {
            return mockHeliusClient as typeof heliusClient;
        }
        return heliusClient;
    }
} 