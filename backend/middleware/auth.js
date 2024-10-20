const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', 'config', '.env') });

const authenticateToken = (req, res, next) => {
    try {
        // Check if the token cookie exists
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: 'Authentication token missing', success: false });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "hamza1");

        // Attach the decoded user data to the request object
        req.user = decoded;

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(403).json({ message: 'Invalid token', success: false });
    }
};

module.exports = authenticateToken;
