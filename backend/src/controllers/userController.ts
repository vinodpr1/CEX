import userService from "../services/userService";
import type{ userType } from "../types/user.type";
export default class userController {
   
    static signUp = async (req:userType, res:any) => {
        try {
            console.log("req", req);
            const { email, password } = req;
            console.log("req", req);
            const response = await userService.signUp(email, password);
            console.log(response);
            return res.status(200).json({ 
                userId: response?.id, 
                message: "Signup success vv"
            });
        } catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static signIn = async (req:any, res:any) => {
        try {
            return res.json({Message: "Signin"});
        } catch (error) {
            res.json({ message: "Internal server error" });
        }
    }

    static logout = async (req:any, res:any) => {
        try {
            return res.json({Message: "Logout"});
        } catch (error) {
            res.json({ message: "Internal server error" });
        }
    }

}