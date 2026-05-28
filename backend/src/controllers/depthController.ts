export default class depthController {
    static getDepth = async (req:any, res:any) => {
        try {
            return res.json({Message: "Depth"});
        } catch (error) {
            res.json({ message: "Internal server error" });
        }
    }
}