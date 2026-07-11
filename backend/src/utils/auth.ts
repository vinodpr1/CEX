import  jwt  from 'jsonwebtoken';

interface tokenPayload {
    email: string,
    id: string
}

export const createToken =(payload: tokenPayload)=>{
    return jwt.sign( payload , process.env.JWT_SECRET || "", {expiresIn: '7d'});
}

export const verifyToken = (token: string) =>{
    return jwt.verify(token, process.env.JWT_SECRET || "");
}