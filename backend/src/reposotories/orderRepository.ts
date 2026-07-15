export default class orderRepository {
    static async createOrder(type:any, price:any, qty:any, side:any, symbol:any, user:any) {
        return {
            side: side,
        }
    }
}