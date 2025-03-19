const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const authenticateToken = (req, res, next) => {
    try {
        if (!req.cookies.auth) {
            return res.status(401).json({ message: 'No auth cookie found', success: false });
        }

        let tokenData;
        try {
            tokenData = JSON.parse(req.cookies.auth);
        } catch (err) {
            return res.status(400).json({ message: 'Malformed auth cookie', success: false });
        }

        const token = tokenData.token;
        // console.log("Extracted Token:", token);

        if (!token) {
            return res.status(401).json({ message: 'Authentication token missing', success: false });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET );
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token verification failed:', error.message);
        return res.status(403).json({ message: 'Invalid token', success: false });
    }
};

module.exports = authenticateToken;
