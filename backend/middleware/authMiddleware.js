const jwt = require('jsonwebtoken');
// require('dotenv').config();

const authMiddleware = (req, res, next) => {

    console.log("headers ",req.headers);
    console.log("cookie ",req.cookies.token);
    const token = req.headers.cookie.token || req.headers.authorization.split(' ')[1];
    console.log(token)
    if(!token) {
        return res.status(401).json({error: {
            message: "Unauthorized",
            details: "You are not authorized to access this resource",
        }});
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;``
    console.log(decoded);
    next();
}

module.exports = authMiddleware;

