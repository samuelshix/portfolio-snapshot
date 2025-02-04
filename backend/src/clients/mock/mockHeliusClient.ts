import { HeliusBalancesResponse } from '@/types/heliusBalancesResponse';
import { HeliusClient } from '../heliusClient';
import { heliusBalancesResponse } from '../../mockData/mockAPIDData';

export class MockHeliusClient extends HeliusClient {
    async getTokenBalances(address: string): Promise<HeliusBalancesResponse> {
        return heliusBalancesResponse.data;
    }
}

export const mockHeliusClient = new MockHeliusClient(); 