export default class balanceController {
    static getBalance = async (req:any, res:any) => {
        try {
            return res.json({Message: "balance"});
        } catch (error) {
            res.json({ message: "Internal server error" });
        }
    }
}