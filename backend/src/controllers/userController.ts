import userService from "../services/userService";
import type {Request, Response} from 'express';
import { userType } from "../types/user.type";
import { validationErrors } from "../utils/validation";
export default class userController {
   
    static signUp = async (req:Request, res:Response): Promise<void> => {
        try {
            const parsedBody = userType.safeParse(req.body);
            if(!parsedBody.success){
                validationErrors(res, parsedBody.error);
                return;
            }
            const { email, password } = parsedBody.data;
            const response = await userService.signUp(email, password);
            res.status(201).json({ 
                userId: response?.userId, 
                userName: response?.userName,
                token: response?.token,
                message: "Signup success vv"
            });
        } catch (error) {
            res.status(409).json({ error: "username already exists" });
        }
    }

    static signIn = async (req:any, res:any) => {
        try {
            const parsedBody = userType.safeParse(req.body);
            if(!parsedBody.success){
                validationErrors(res, parsedBody.error);
                return;
            }
            const { email, password } = parsedBody.data;
            const response = await userService.signIn(email, password);
            res.status(201).json({ 
                userId: response?.userId, 
                userName: response?.userName,
                token: response?.token,
                message: "Signun success"
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Internal server error";
            const status = message === "User not found" ? 404 : 401;
            res.status(status).json({ message });
        }
    }
}