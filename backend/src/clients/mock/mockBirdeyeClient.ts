import { BirdeyeClient } from '../birdeyeClient';
import getPriceMockData from '@/mockData/mockPriceData';

export class MockBirdeyeClient extends BirdeyeClient {
    async getCurrentPrice(): Promise<number> {
        // random price between 200 and 300
        return Math.floor(Math.random() * (300 - 200 + 1)) + 200;
    }

    async getHistoricalPrices(): Promise<{ date: string; price: number }[]> {
        const mockData = getPriceMockData(30);
        return mockData.data.items.map(item => ({
            date: new Date(item.unixTime * 1000).toISOString(),
            price: item.value
        }));
    }
}

export const mockBirdeyeClient = new MockBirdeyeClient(); 