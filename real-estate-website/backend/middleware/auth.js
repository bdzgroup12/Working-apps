const jwt = require('jsonwebtoken');

const secretKey = process.env.JWT_SECRET || 'your-secret-key';

// Middleware for verifying JWT token
const verifyToken = (req, res, next) => {
  console.log('⭐ verifyToken middleware called');
  console.log('⭐ Headers:', req.headers);
  
  const token = req.headers.authorization?.split(' ')[1];
  
  console.log('⭐ Token:', token ? `${token.substring(0, 10)}...` : 'No token');
  
  if (!token) {
    return res.status(403).json({ error: 'No token provided' });
  }
  
  try {
    console.log('⭐ Verifying token');
    const decoded = jwt.verify(token, secretKey);
    console.log('⭐ Decoded token:', decoded);
    
    req.userId = decoded.id;
    req.userRole = decoded.role;
    
    console.log('⭐ User ID set to:', req.userId);
    console.log('⭐ User role set to:', req.userRole);
    
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    
    // Check if token is expired
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired', 
        expired: true 
      });
    }
    
    return res.status(401).json({ error: 'Failed to authenticate token' });
  }
};

// Helper to get user role and id from request
function getUserRoleAndId(req) {
  return {
    userId: req.userId,
    role: req.userRole,
  };
}

module.exports = {
  verifyToken,
  getUserRoleAndId,
};
