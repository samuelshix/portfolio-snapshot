import { useWallet } from '@solana/wallet-adapter-react';
import { observer } from 'mobx-react-lite';
import { useEffect, useState, FC } from 'react';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import PriceChart from './PriceChart';
import { getPortfolioValueByDay } from '../util/portfolioValue';
import { tokenStore } from '../services/tokenStore';

const Portfolio: FC = observer(() => {
    const { publicKey } = useWallet();
    const [connectWalletMessage, setMessage] = useState<string>('');
    const [portfolioValueByDay, setPortfolioValueByDay] = useState<{ date: string, value: number }[]>([]);
    const [totalPortfolioValue, setTotalPortfolioValue] = useState<string>('0.00');

    useEffect(() => {
        const fetchAssets = async () => {
            if (publicKey) {
                setMessage('Loading...');
                tokenStore.loadUserTokens(publicKey.toString());
                setMessage('');
            } else {
                setMessage('Connect your wallet to view your portfolio');
            }
        };

        fetchAssets();
    }, [publicKey]);

    useEffect(() => {
        const calculatePortfolioValue = async () => {
            if (tokenStore.tokenAccounts.length > 0) {
                const valueByDay = getPortfolioValueByDay(tokenStore.tokenAccounts);
                console.log(valueByDay)
                setPortfolioValueByDay(valueByDay);

                const totalValue = valueByDay.reduce((total, dayValue) => {
                    return { date: dayValue.date, value: total.value + (dayValue.value || 0) };
                }, { date: '', value: 0 }).value;

                setTotalPortfolioValue(totalValue.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                }));
            }
        }
        calculatePortfolioValue();
    }, [tokenStore.tokenAccounts]);


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
                    <div className="text-green-500 mt-1">
                        {((portfolioValueByDay[0].value - portfolioValueByDay[1].value) / portfolioValueByDay[1].value * 100).toFixed(2)}%
                    </div>
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
                    <div className="font-semibold">0</div>
                </div>

                {/* Cash */}
                {/* <div className="mt-6">
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
                </div> */}
            </div>
            <Sidebar tokenAccounts={tokenStore.tokenAccounts} />
        </>
    );
});

export default Portfolio;

