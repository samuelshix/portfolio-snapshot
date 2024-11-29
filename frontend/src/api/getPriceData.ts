import axios from 'axios';
import generateMockData from '../mockData/mockPriceData';
import getPriceMockData from '../mockData/mockPriceData';

const BIRDEYE_URL = 'https://public-api.birdeye.so';
export const getPriceData = async (mintAddress: string): Promise<any> => {
    const { data } = await axios.get(
        `${BIRDEYE_URL}/defi/price?address=${mintAddress}`,
        {
            headers: {
                'X-API-KEY': process.env.REACT_APP_BIRDEYE_API_KEY,
                Accept: 'application/json',
            }
        }
    );
    return data;
}

export const getHistoricalPriceData = async (mintAddress: string, fromTime: number, toTime: number): Promise<{ items: { unixTime: number, value: number }[] }> => {
    if (process.env.REACT_APP_MOCKS_FLAG === 'true') {
        const { data } = getPriceMockData(30);
        return data;
    } else {
        const { data } = await axios.get(
            `${BIRDEYE_URL}/defi/history_price?address=${mintAddress}&address_type=token&type=1D&time_from=${fromTime}&time_to=${toTime}`,
            {
                headers: {
                    'X-API-KEY': process.env.REACT_APP_BIRDEYE_API_KEY,
                    Accept: 'application/json',
                }
            }
        );
        return data;
    }
}