import React from 'react';
import StocksList from './StocksList';
import { TokenAccount } from '../types/tokenAccount';


interface SidebarProps {
    tokenAccounts: TokenAccount[];
}
const Sidebar: React.FC<SidebarProps> = ({ tokenAccounts }) => {
    return (
        <div className="w-60 p-4 overflow-y-scroll">
            <div className="mt-4 border border-indigo-200/50 p-2 px-3 rounded-sm">
                <h2 className="text-sm font-semibold">Tokens</h2>
                <div className="mt-1 space-y-1">
                    {tokenAccounts.map(account => {
                        // Add null check for token and prices
                        if (!account.token || !account.token.prices || account.token.prices.length === 0) {
                            return (
                                <div key={account.token?.mint || 'unknown'} className="flex justify-between items-center border-b border-gray-700 py-3 text-[10px] last:border-none">
                                    <div>
                                        <p className="font-bold">{account.token?.symbol || 'Unknown'}</p>
                                        <p className="font-light">No price data</p>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div
                                key={account.token.mint}
                                className="flex justify-between items-center border-b border-gray-700 py-3 text-[10px] last:border-none"
                            >
                                <div>
                                    <p className="font-bold">{account.token.symbol}</p>
                                    <p className="font-light">
                                        {(account.tokenAmount / Math.pow(10, account.token.decimals) * account.token.prices[0].price)
                                            .toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                    </p>
                                </div>
                                <div className="text-right font-light">
                                    {account.token.prices[0].price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                    <p>~%</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;