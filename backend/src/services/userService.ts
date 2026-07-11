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

    static signIn = async (email:string, password:string) =>{
        try {
            const response = await userRepository.signIn(email, password);
            return response;
        } catch (error) {
            throw error;
        }
    }

}