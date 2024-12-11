import React from 'react';
import StocksList from './StocksList';
import { TokenAccount } from '../types/tokenAccount';


interface SidebarProps {
    tokenAccounts: TokenAccount[];
}

const Sidebar: React.FC<SidebarProps> = ({ tokenAccounts }) => {
    console.log(tokenAccounts);
    return (
        <div className="w-60 p-4 overflow-y-scroll">
            {/* <StocksList /> */}
            {/* Token Accounts Section */}
            <div className="mt-4 border border-indigo-200/50 p-2 px-3 rounded-sm">
                <h2 className="text-sm font-semibold">Tokens</h2>
                <div className="mt-1 space-y-1">
                    {tokenAccounts.map(account => (account.token.prices.length > 0 &&
                        <div
                            key={account.token.mint}
                            className="flex justify-between items-center border-b border-gray-700 py-3 text-[10px] last:border-none"
                        >
                            <div>
                                <p className="font-bold">{account.token.symbol}</p>
                                <p className="font-light">{(account.tokenAmount / Math.pow(10, account.token.decimals) * account.token.prices[0].price).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                            </div>
                            <div className="text-right font-light">
                                {account.token.prices[0].price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                <p>~%</p>
                                {/* <p
                                    className={`text-sm ${crypto.trend === "positive"
                                            ? "text-green-500"
                                            : crypto.trend === "negative"
                                                ? "text-red-500"
                                                : "text-gray-400"
                                        }`}
                                >
                                    {crypto.change}
                                </p> */}
                            </div>
                        </div>
                    ))}

                </div>
            </div>
        </div>
    );
};

export default Sidebar;
