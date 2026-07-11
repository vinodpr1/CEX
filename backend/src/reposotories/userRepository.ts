import { prisma } from "../../prisma/db";
import { createToken } from "../utils/auth";
export default class userRepository {
   
    static signUp = async (email:string, password:string) =>{
        const hashedPassword = await Bun.password.hash(password);
        try {
            const response = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword
                }
            })
            return {
                token: createToken({email: response.email, id: response.id.toString()}),
                userId: response.id,
                userName: response.email 
            }
        } catch (error) {
            throw error;
        }
    }

    static signIn = async (email:string, password:string) =>{
        try {
            const response = await prisma.user.findUnique({
                where: {
                    email: email
                }
            })
            if (!response) {
                throw new Error("User not found");
            }
            const isPasswordValid = await Bun.password.verify(password, response.password);
            if (!isPasswordValid) {
                throw new Error("Please check Username and password");
            }
            return {
                token: createToken({email: response.email, id: response.id.toString()}),
                userId: response.id,
                userName: response.email 
            }
        } catch (error) {
            throw error;
        }
    }

}