import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import React, { useEffect, useState } from 'react';
import { getAssetsByOwner } from '../api/getAssets';
import TopBar from './TopBar';
import { TokenAccount } from '../model/tokenAccount';
import { getPriceData } from '../api/getPriceData';
import Sidebar from './Sidebar';
import TokenAccountService from '../services/tokenAccountService';
import TokenService from '../services/tokenService';
import { createUserIfNotExists } from '../services/apiService';
import PriceChart from './PriceChart';
import { getPortfolioValueByDay } from '../util/portfolioValue';

const Portfolio: React.FC = () => {
    const { publicKey } = useWallet();
    const [connectWalletMessage, setMessage] = useState<string>('');
    const [assets, setAssets] = useState<TokenAccount[]>([]);
    const [portfolioValueByDay, setPortfolioValueByDay] = useState<{ date: string, value: number }[]>([]);
    const [totalPortfolioValue, setTotalPortfolioValue] = useState<string>('0.00');
    useEffect(() => {
        const fetchAssets = async () => {
            if (publicKey) {
                await createUserIfNotExists(publicKey.toString());
                setMessage('Loading...');
                setAssets(await TokenAccountService.initialize(publicKey.toString()));
                setMessage('');
            } else {
                setMessage('Connect your wallet to view your portfolio');
            }
        };

        fetchAssets();
    }, [publicKey]);

    useEffect(() => {
        // retrieve prices
        const fetchPrices = async () => {
            setPortfolioValueByDay(getPortfolioValueByDay(assets))
            console.log(portfolioValueByDay)
            const totalPortfolioValue = portfolioValueByDay.reduce((total, dayValue) => {
                return { date: dayValue.date, value: total.value + (dayValue.value || 0) };
            }, { date: '', value: 0 }).value;
            const formattedTotalPortfolioValue = totalPortfolioValue.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
            });
            console.log(totalPortfolioValue)
            setTotalPortfolioValue(formattedTotalPortfolioValue)
        }
        if (assets.length > 0) fetchPrices()
    }, [assets])


    return (
        <>
            <div className="flex-1 p-4">
                <TopBar />
                {connectWalletMessage &&
                    <p className='text-sm text-slate-500'>{connectWalletMessage}</p>
                }
                <div className="text-3xl font-bold mt-2">{totalPortfolioValue}</div>
                {
                    portfolioValueByDay.length > 1 &&
                    <div className="text-green-500 mt-1">{portfolioValueByDay[1].value - portfolioValueByDay[0].value / portfolioValueByDay[0].value} %</div>
                }
                {/* Chart */}
                <div className="mt-6">
                    <div className="h-40 bg-gray-800 rounded-md"> {/* Placeholder for Chart */}
                        <PriceChart portfolioValueByDay={portfolioValueByDay} />
                    </div>
                </div>

                {/* Buying Power */}
                <div className="mt-4">
                    <div className="text-sm text-gray-400">Buying Power</div>
                    <div className="font-semibold">$1,250.92</div>
                </div>

                {/* Cash */}
                <div className="mt-6">
                    <h2 className="text-lg font-semibold">Lending</h2>
                    <div className="flex justify-between items-center bg-gray-800 p-4 rounded-md mt-2">
                        <div>
                            <div className="text-xs text-gray-400">Cash earning interest</div>
                            <div className="text-lg font-semibold">$311.31</div>
                            <div className="text-xs text-gray-400">Interest rate: 0.01%</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-400">Interest accrued this month</div>
                            <div className="text-lg font-semibold">$0.00</div>
                        </div>
                    </div>
                </div>
            </div>
            <Sidebar tokenAccounts={assets} />
        </>
    );
};

export default Portfolio;

