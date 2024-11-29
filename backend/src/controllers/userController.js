const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();


const getUser = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { address: req.address },
            include: { tokenAccounts: true }
        });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const createUserIfNotExists = async (req, res) => {
    const { address } = req.body;

    let user = await prisma.user.findUnique({
        where: { address },
    });

    if (!user) {
        user = await prisma.user.create({
            data: {
                address,
            },
        });
    }

    res.status(201).json(user);
}

module.exports = { getUser, createUserIfNotExists };
