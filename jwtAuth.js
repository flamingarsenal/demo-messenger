const jwt = require('jsonwebtoken');

function verifyJWT(req) {
    const authHeader = req.header('Authorization');
    if (!authHeader) return 'No token provided';
    
    const token = authHeader.replace('Bearer ', '').trim();
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const username = decoded.sub;
        return username;
    } catch (e) {
        console.log(e);
        return "Invalid or expired token";
    }
}

module.exports = {verifyJWT};