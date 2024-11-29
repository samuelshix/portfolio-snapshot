const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const createTokenAccount = async (req, res) => {
    const tokenAccount = await prisma.tokenAccount.findMany({
        where: {
            userAddress: req.body.userAddress,
            tokenMint: req.body.tokenMint,
        },
    })
    if (tokenAccount) {
        res.status(201).json({ message: 'Token Account already exists' });
        return;
    }
    const { userAddress, balance, tokenMint } = req.body;
    try {
        const tokenAccount = await prisma.tokenAccount.create({
            data: {
                userAddress,
                tokenMint,
                balance,
            },
        });

        res.status(201).json(tokenAccount);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
}

module.exports = {
    createTokenAccount,
};