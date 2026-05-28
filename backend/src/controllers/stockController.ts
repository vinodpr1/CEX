export default class stockController {
    static getStocks = async (req:any, res:any) => {
        try {
            return res.json({Message: "Stock balance fetched successfully Vinodpr"});
        } catch (error) {
            res.json({ message: "Internal server error" });
        }
    }
}