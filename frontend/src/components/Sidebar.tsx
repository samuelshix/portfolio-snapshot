import React from 'react';
import { TokenAccount } from '../types/tokenAccount';
import { observer } from 'mobx-react-lite';

interface SidebarProps {
    tokenAccounts: TokenAccount[];
}

const Sidebar: React.FC<SidebarProps> = observer(({ tokenAccounts }) => {

    return (
        <div className="w-60 p-4 overflow-y-scroll">
            <div className="mt-4 border border-indigo-200/50 p-2 px-3 rounded-sm">
                <h2 className="text-sm font-semibold">Tokens</h2>
                <div className="mt-1 space-y-1">
                    {tokenAccounts.map(account => {
                        let priceDelta = ((Number(account.token.tokenPrice[0].price) - Number(account.token.tokenPrice[1].price)) / Number(account.token.tokenPrice[1].price) * 100)
                        let deltaColor = priceDelta >= 0 ? "text-green-500" : "text-red-500";
                        console.log(deltaColor, priceDelta)
                        // Add null check for token and prices
                        if (!account.token || !account.token.tokenPrice || account.token.tokenPrice.length === 0) {
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
                                    <p className={"font-light"}>
                                        {account.token?.tokenPrice?.length > 0 && !isNaN(account.token.tokenPrice[0].price) && !isNaN(account.balance)
                                            ? (Number(account.balance) * Number(account.token.tokenPrice[0].price))
                                                .toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                                            : '$0.00'
                                        }
                                    </p>
                                </div>
                                <div className={"text-right font-light"}>
                                    {Number(account.token.tokenPrice[0].price).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                    <br />
                                    <span className={deltaColor}>
                                        {account.token?.tokenPrice?.length > 1 &&
                                            !isNaN(account.token.tokenPrice[0].price) &&
                                            !isNaN(account.token.tokenPrice[1].price) &&
                                            account.token.tokenPrice[1].price !== 0
                                            ? priceDelta.toFixed(2) + "%"
                                            : '0.00%'
                                        }
                                    </span>
                                </div>
                            </div>

                        );
                    })}
                </div>
            </div>
        </div>
    );
});

export default Sidebar;