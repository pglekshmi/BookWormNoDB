import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const secret_key=process.env.secret_key;

const extractToken = (cookieString, tokenName) => {
    const cookies = cookieString.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === tokenName) {
            return value;
        }
    }
    return null;
};


const authenticate=async(req,res,next)=>{
    
    const value=req.headers.cookie ;
    const token = extractToken(value,"authToken");
    
    if (!token) {
        return res.status(401).json({ message: 'Access Denied' });
      }
      try {
        console.log(token);
        console.log(secret_key,"secret key");
        const data = jwt.decode(token);
        console.log(data);
        const verified = jwt.verify(token,secret_key);
        console.log(verified.UserRole);
        
        req.user = verified.UserRole;
        req.name = verified.UserName;
        next();
      } catch (error) {
        res.status(400).json({ message: 'Invalid Token' });
      }
}

export default authenticate;