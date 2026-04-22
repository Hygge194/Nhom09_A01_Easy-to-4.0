const jwt = require('jsonwebtoken');


const verifyToken = (req, res, next) => {
    //lay token tu headers
    const authHeader = req.headers['authorization'];
    
    // cut token
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Lỗi xác thực. Vui lòng thử lại.' });
    }

    try {
        // ktra 
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // truyền data sang controller
        req.user = decoded; 
        
        // cho request đi tiếp
        next(); 
    } catch (error) {
        return res.status(403).json({ message: 'Hết hạn truy cập. Vui lòng thử lại.' });
    }
};

module.exports = { verifyToken };