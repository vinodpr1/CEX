import userRepository from "../reposotories/userRepository";

export default class userService {

    static signUp = async (email:string, password:string) =>{
        try {
            const response = await userRepository.signUp(email, password);
            return response;
        } catch (error) {
            throw error;
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