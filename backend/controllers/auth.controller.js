const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
const jsonWebToken = require('jsonwebtoken');
const dotenv = require('dotenv');
const { sendToken } = require('../lib/sendToken');
const { findUserbyEmail,findUserbyId, findUserbyUsername, findUser } = require('../lib/findUser');
const { signupSchema } = require('../lib/zodSchema');
const { sanitizeString, sanitizeEmail } = require('../lib/sanitize');
dotenv.config();


const signup = async (req, res) => {
    try {
        const { email, username, firstName, lastName, password, name, profilePicture } = req.body;
        const sanitizedEmail = sanitizeEmail(email);
        const sanitizedUsername = sanitizeString(username);
        const sanitizedFirstName = sanitizeString(firstName);
        const sanitizedLastName = sanitizeString(lastName);
        const sanitizedName = sanitizeString(name);
        const sanitizedProfilePicture = sanitizeString(profilePicture);
        const hashedPassword = bcrypt.hashSync(password, 10);

        const userByEmail = await findUserbyEmail(sanitizedEmail);
        if (userByEmail) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const userByUsername = await findUserbyUsername(sanitizedUsername);
        if (userByUsername) {
            return res.status(400).json({ error: 'Username already taken' });
        }
        signupSchema.parse({
            email: sanitizedEmail,
            username: sanitizedUsername,
            firstName: sanitizedFirstName,
            lastName: sanitizedLastName,
            password
        });
        const createdUser = await prisma.user.create({
            data: {
                email: sanitizedEmail,
                username: sanitizedUsername,
                firstName: sanitizedFirstName,
                lastName: sanitizedLastName,
                name: sanitizedName || null,
                profilePicture: sanitizedProfilePicture || null,
                password: hashedPassword
            }
        });
        if(createdUser){
            await sendToken(res, createdUser.id, 201, createdUser.email, "verify-email");
        }
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ error: 'An error occurred during signup' });
    }
}

const login = async (req, res) => {
    const { search, password } = req.body;
    const sanitizedSearch = sanitizeString(search);
    findUser(sanitizedSearch).then(user => {
        if (!user) {
            return res.status(404).json({ error: 'User not found or Invalid Password' });
        }
        const passwordMatch = bcrypt.compareSync(password, user.password);
        if(!passwordMatch){
            return res.status(401).json({ error: 'User not found or Invalid Password' });
        }
        if(!user.isVerified){
            return res.status(401).json({ error: 'Email not verified' });
        }
        const token = jsonWebToken.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({ message: 'Login successful',user, token });
    }).catch(error => {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'An error occurred during login' });
    });
} 

const logout = (req, res) => {
    res.status(200);

    res.json({ message: 'Logout successful' });
}

const verifyEmail = async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ error: 'Token is required' });
    }
    jsonWebToken.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }
        const userTokenRecord = await prisma.userTokens.findUnique({
            where: { userId: decoded.userId }
        });
        
        if (!userTokenRecord || !bcrypt.compareSync(token, userTokenRecord.emailVerificationToken)) {
            return res.status(400).json({ error: 'Invalid token' });
        }
        await prisma.user.update({
            where: { id: decoded.userId },
            data: { isVerified: true }
        });
        await prisma.userTokens.delete({
            where: { userId: decoded.userId }
        });
        res.status(200).json({ message: 'Email verified successfully' });
    });
}
const forgotPassword = async (req, res) => {
    const email = sanitizeEmail(req?.body?.email);
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    try {
        const user = await findUserbyEmail(email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const existingToken = await prisma.userTokens.findUnique({
            where: {
                userId: user.id,
            }})
        console.log('Existing token:', existingToken);
        if (existingToken) {
            return res.status(400).json({ error: 'A reset token has already been sent. Please check your email.' });
        }
        await sendToken(res, user.id, 200, user.email, "reset-password");
    } catch (error) {
        console.error('Error during password reset:', error);
        return res.status(500).json({ error: 'An error occurred during password reset' });
    }
}

const resetPassword = async (req, res) => {
    const { token } = req.query;
    const { newPassword } = req.body;
    if (!token || !newPassword) {
        return res.status(400).json({ error: 'Token and new password are required' });
    }
    jsonWebToken.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }
        const userTokenRecord = await prisma.userTokens.findUnique({
            where: { userId: decoded.userId }
        });

        if (!userTokenRecord || !bcrypt.compareSync(token, userTokenRecord.passwordResetToken)) {
            return res.status(400).json({ error: 'Invalid token' });
        }
        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        await prisma.user.update({
            where: { id: decoded.userId },
            data: { password: hashedPassword }
        });
        await prisma.userTokens.delete({
            where: { userId: decoded.userId }
        });
        res.status(200).json({ message: 'Password reset successfully' });
    });
}
const resendVerificationEmail = async (req, res) => {
    const { email, type} = req.body;
    const sanitizedEmail = sanitizeEmail(email);
    try {
        const user = await findUserbyEmail(sanitizedEmail);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        await sendToken(res, user.id, 200, user.email, type);
    } catch (error) {
        console.error('Error during resending verification email:', error);
        return res.status(500).json({ error: 'An error occurred during resending verification email' });
    }
}

const userDetails = async (req, res) => {
    const userId = req.userId;
    try {
        const user = await findUserbyId(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ user });
    } catch (error) {
        console.error('Error fetching user details:', error);
        return res.status(500).json({ error: 'An error occurred while fetching user details' });
    }
}

module.exports = {
    signup,login,logout,verifyEmail,forgotPassword,resetPassword,resendVerificationEmail,userDetails
};

