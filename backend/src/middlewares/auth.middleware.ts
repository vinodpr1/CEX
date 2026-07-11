import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/auth";

export const authMiddleware = (req: Request, res:Response, next: NextFunction) =>{
    const authHeader = req.headers.authorization;
    if(!authHeader?.startsWith("Bearer ")){
        return res.status(401).json({ message: "Unauthorized" });
    }
    const token = req.headers.authorization?.split(" ")[1];
    if(!token){
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const user = verifyToken(token);
        (req as Request & { user: any }).user = user;
        next(); 
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized" });
    }
}