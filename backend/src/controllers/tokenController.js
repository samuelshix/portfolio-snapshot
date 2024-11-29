const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();


const getToken = async (req, res) => {
    try {
        const token = await prisma.token.findUnique({
            where: { mint: req.query.mint }
        });
        if (!token) {
            return res.status(200).json({ message: 'Token not found' });
        } else {
            return res.json(token);
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Server Error' });
    }
};

const setToken = async (req, res) => {
    const { mint, name, symbol, decimals, logoURI } = req.body;
    let token = await prisma.token.findUnique({
        where: { mint: mint }
    });
    try {
        if (!token) {
            console.log(mint, name, symbol, decimals, logoURI);
            token = await prisma.token.create({
                data: {
                    mint,
                    name,
                    symbol,
                    decimals,
                    logoURI
                }
            })
            console.log(token);
            return res.json({ data: token });
        } else {
            return res.json({ message: 'Token already created', data: token });
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: err });
    }
};

const getPricesForToken = async (req, res) => {
    const { mint: tokenMint } = req.params;

    try {
        const tokenPrices = await prisma.tokenPrice.findMany({
            where: { tokenMint },
            orderBy: { timestamp: 'desc' }
        });

        res.json(tokenPrices);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
}

const createTokenPrice = async (req, res) => {
    const { mint: tokenMint, date: timestamp, price } = req.body;
    // find if there is a token price already on the same day
    const startOfDay = new Date(new Date(timestamp).setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date(timestamp).setHours(23, 59, 59, 999));
    const tokenPrice = await prisma.tokenPrice.findMany({
        where: {
            tokenMint,
            timestamp: {
                gte: startOfDay,
                lte: endOfDay
            }
        }
    });

    if (tokenPrice.length > 0) return res.status(201).json({ message: 'Token price already created', data: tokenPrice });
    console.log(tokenPrice)
    try {
        const tokenPrice = await prisma.tokenPrice.create({
            data: {
                tokenMint,
                price,
                timestamp
            }
        });
        console.log("price created", tokenPrice)
        return res.status(201).json(tokenPrice);
    } catch (err) {
        return res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getToken, setToken, getPricesForToken, createTokenPrice };
