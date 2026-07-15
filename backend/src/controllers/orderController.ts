import orderService from "../services/orderService";
import type { Request, Response } from "express";
import { exchangeSchema } from "../types/exchange-schema";
import { validationErrors } from "../utils/validationErrors";
import { createOrderEngone } from "../utils/engine";

const getUser = (req: any) =>{
    if(!req.user){
        throw new Error("Missing authenticated user");
    }
    return req.user;
}
export default class orderController {
    static getOrder = async (req:Request, res:Response): Promise<void> => {
        try {
            const parsedBody = exchangeSchema.safeParse(req.body);
            if(!parsedBody.success){
                validationErrors(res, parsedBody.error);
                return;
            }
            const user = getUser(req);
            const { type, price, qty, side, symbol } = parsedBody.data;

        const engineResponse = await createOrderEngone("create_order", {
            type,
            side,
            symbol,
            price: type === "limit" ? price : null,
            qty,
            userid: user.id
        })
        res.status(engineResponse.ok ? 200 : 400).json(engineResponse.ok ? engineResponse.data : {error: engineResponse.error});
        } catch (error) {
            res.json({ message: "Internal server error" });
        }
    }
}