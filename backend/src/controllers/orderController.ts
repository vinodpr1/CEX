import orderService from "../services/orderService";
import type { Request, Response } from "express";
import { exchangeSchema } from "../types/exchange-schema";
import { validationErrors } from "../utils/validationErrors";
import { createOrderEngone } from "../utils/engine";
import { redisClient } from "../index";

const getUser = (req: any) =>{
    if(!req.user){
        throw new Error("Missing authenticated user");
    }
    return req.user;
}
export default class orderController {
    static createOrder = async (req:Request, res:Response): Promise<void> => {
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
        await redisClient.lPush("create_order", JSON.stringify({type, side, symbol, price: type === "limit" ? price : null, qty, userid: user.id}));
        // res.status(engineResponse.ok ? 200 : 400).json(engineResponse.ok ? engineResponse.data : {error: engineResponse.error});
        res.json({ message: "Order created successfully" });
        } catch (error) {
            console.error(error);
            res.json({ message: "Internal server error" });
        }
    }
}