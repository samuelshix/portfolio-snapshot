const getPriceMockData = (days: number) => {
    const oneDayInSeconds = 86400;
    const currentTime = Math.floor(Date.now() / 1000);
    let mockData: { data: { items: { unixTime: number, value: number }[] } } = {
        "data": { "items": [] },
    };

    for (let i = 0; i < days; i++) {
        mockData.data.items.push({
            unixTime: currentTime - (i * oneDayInSeconds),
            value: parseFloat(Math.random().toFixed(2))
        });
    }

    return mockData;
};

export default getPriceMockData;