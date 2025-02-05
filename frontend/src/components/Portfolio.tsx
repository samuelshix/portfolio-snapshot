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
    const [deltaColor, setDeltaColor] = useState<string>('rgb(0, 255, 0)');

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
                setDeltaColor(valueByDay[0].value > valueByDay[1].value ? 'rgb(0, 255, 0)' : 'rgb(255, 0, 0)');
                const totalValue = valueByDay[0].value


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
                <div className='grid grid-cols-10 my-10'>
                    <div className='col-span-9'>
                        <div className="text-5xl font-semibold mt-2">{totalPortfolioValue}</div>
                        <div className="mt-1" style={{ color: deltaColor }}>
                            {((portfolioValueByDay[0].value - portfolioValueByDay[1].value) / portfolioValueByDay[1].value * 100).toFixed(2)}%
                        </div>
                        {/* Chart */}
                        <div className="h-40 rounded-md mr-10">
                            <PriceChart portfolioValueByDay={portfolioValueByDay} deltaColor={deltaColor} />
                        </div>
                    </div>
                    <div className='col-span-1'>

                        <Sidebar tokenAccounts={tokenStore.tokenAccounts} />
                    </div>
                    {/* Buying Power */}
                </div>
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
        </>
    );
});

export default Portfolio;

