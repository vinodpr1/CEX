export default class fillsController {
    static getFills = async (req:any, res:any) => {
        try {
            return res.json({Message: "Fills"});
        } catch (error) {
            res.json({ message: "Internal server error" });
        }
    }
}