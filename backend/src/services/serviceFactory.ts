import { TokenService } from './tokenService';
import { heliusClient } from '../clients/heliusClient';
import { mockHeliusClient } from '../clients/mock/mockHeliusClient';
import { birdeyeClient } from '../clients/birdeyeClient';
import { mockBirdeyeClient } from '../clients/mock/mockBirdeyeClient';
import { jupiterClient } from '../clients/jupiterClient';
import { mockJupiterClient } from '../clients/mock/mockJupiterClient';

export class ServiceFactory {
    static getTokenService(useMockData: boolean) {
        return new TokenService(
            useMockData ? mockJupiterClient : jupiterClient,
            useMockData ? mockBirdeyeClient : birdeyeClient
        );
    }

    static getHeliusClient(useMockData: boolean) {
        return useMockData ? mockHeliusClient : heliusClient;
    }
} 