export default class orderController {
    static getOrder = async (req:any, res:any) => {
        try {
            return res.json({Message: "Order"});
        } catch (error) {
            res.json({ message: "Internal server error" });
        }
    }
}