import React from 'react';

interface Stock {
    name: string;
    price: string;
    change: string;
}

const stocks: Stock[] = [
    { name: 'TSLA', price: '$322.80', change: '+8.72%' },
    { name: 'MSTR', price: '$270.47', change: '-0.12%' },
    { name: 'META', price: '$588.16', change: '-0.60%' },
    { name: 'KTOS', price: '$26.32', change: '+10.49%' },
    { name: 'SPY', price: '$597.88', change: '+0.40%' },
    { name: 'QQQ', price: '$514.05', change: '+0.10%' },
    { name: 'ARKB', price: '$76.82', change: '+0.48%' },
    { name: 'AMD', price: '$148.16', change: '-1.11%' },
    { name: 'URNM', price: '$46.82', change: '-0.87%' },
    { name: 'INTC', price: '$26.10', change: '-0.50%' },
];

const StocksList: React.FC = () => {
    return (
        <div>
            <h2 className="text-sm font-semibold mb-2">Stocks</h2>
            <div className="space-y-2">
                {stocks.map((stock) => (
                    <div key={stock.name} className="flex justify-between">
                        <span>{stock.name}</span>
                        <div className="flex gap-2">
                            <span>{stock.price}</span>
                            <span className={stock.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
                                {stock.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StocksList;
