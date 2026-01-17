const jsonwebtoken = require('jsonwebtoken');
const {findUserbyId} = require('../lib/findUser');

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        const user = await findUserbyId(decoded.userId);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized: User not found' });
        }
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
}
module.exports = authMiddleware;
