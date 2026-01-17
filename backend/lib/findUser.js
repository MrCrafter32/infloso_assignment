const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


const findUserbyId = (userID) => {
    return prisma.user.findUnique({
        where: {
            id: userID
        }
    });
}    

const findUserbyEmail = (email) => {
    return prisma.user.findUnique({
        where: {
            email: email
        }
    });
}

const findUserbyUsername = (username) => {
    return prisma.user.findUnique({
        where: {
            username: username
        }
    });
}

const findUser = (search) => {
    return prisma.user.findFirst({
        where:{
            OR: [
                { email: search },
                { username: search }
            ]
        }
})}

module.exports = { findUserbyId, findUserbyEmail, findUserbyUsername, findUser };