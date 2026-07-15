import orderRepository from "../reposotories/orderRepository";
export default class orderService {
    static createorder = async (type:any, price:any, qty:any, side:any, symbol:any, userid:any) =>{
        try {
            const response = await orderRepository.createOrder(type, price, qty, side, symbol, userid);
            return response;
        } catch (error) {
            throw error 
        }
    }
}