import { prisma } from "../../prisma/db";

export default class userRepository {
   
    static signUp = async (email:string, password:string) =>{
        try {
            const response = await prisma.user.create({
                data: {
                    email,
                    password
                }
            })
            return response;
        } catch (error) {
            
        }
    }

    static signIn = async () =>{
        try {
            
        } catch (error) {
            
        }
    }

    static signOut = async () =>{
        try {
            
        } catch (error) {
            
        }
    }

}