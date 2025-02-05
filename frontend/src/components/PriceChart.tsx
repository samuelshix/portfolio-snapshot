import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TooltipItem } from 'chart.js';


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


interface PriceChartProps {
    portfolioValueByDay: { date: string, value: number }[];
    deltaColor: string;
}


const PriceChart: React.FC<PriceChartProps> = ({ portfolioValueByDay, deltaColor }) => {
    const portfolioValueList = portfolioValueByDay
        .map(entry => ({
            date: entry.date,
            totalValue: entry.value,
        }))
        .reverse();

    const chartData = {
        labels: portfolioValueList.map(entry => entry.date),
        datasets: [
            {
                label: 'Portfolio Value',
                data: portfolioValueList.map(entry => entry.totalValue),
                borderColor: deltaColor, // Green line color
                backgroundColor: 'rgba(0, 255, 0, 0.2)', // Optional area below the line
                tension: 0.2, // Smoother curve
                pointRadius: 0, // No points visible
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                grid: {
                    display: false, // Hides grid lines
                },
                ticks: {
                    color: '#ffffff', // White text for labels
                    maxTicksLimit: 5,
                    font: {
                        size: 10
                    },
                    align: 'center' as const
                },
            },
            y: {
                grid: {
                    display: false, // Hides grid lines
                },
                ticks: {
                    color: '#ffffff', // White text for labels
                    display: false
                },
            },
        },
        interaction: {
            mode: 'nearest' as const, // Tooltip triggers for the nearest data point
            intersect: false, // Allows tooltip to show when hovering anywhere on the graph
        },
        plugins: {
            legend: {
                display: false, // Hide legend
            },
            tooltip: {
                callbacks: {
                    label: function (context: TooltipItem<'line'>): string {
                        const value = context.raw as number; // Cast 'unknown' to 'number'

                        return `$${value.toFixed(2)}`; // Add dollar formatting to tooltip
                    },
                },
            },
        },
    };

    return <div className='rounded-xl p-5'>
        <Line data={chartData} options={chartOptions} />
    </div>;

}

export default PriceChart;