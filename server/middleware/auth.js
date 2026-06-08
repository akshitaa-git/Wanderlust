const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authentication required. No token provided.' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Authentication required. Token missing.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user payload to the request
        next();
    } catch (error) {
        console.error('JWT Verification error:', error);
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
};

module.exports = authMiddleware;
