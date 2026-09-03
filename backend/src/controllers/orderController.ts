import type { Request, Response } from "express";
import { exchangeSchema } from "../types/exchange-schema";
import { validationErrors } from "../utils/validationErrors";
import { yeildOrderEngine } from "../utils/engine";
import { redisClient } from "../index";
import { QUEUE_NAME } from "../utils/engine";

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

        let identifier = Math.random();
        const yeildOrderPromise = yeildOrderEngine(identifier);
        await redisClient.lPush("incoming_order", JSON.stringify({type: type, side: side, symbol: symbol, price: type === "limit" ? price : null, qty: qty, userid: user.id, identifier: identifier, queueName: QUEUE_NAME}));
        const engineResponse = await yeildOrderPromise;
        console.log("engineResponse kkkkkkkkk", engineResponse);
        // res.status(engineResponse.ok ? 200 : 400).json(engineResponse.ok ? engineResponse.data : {error: engineResponse.error});
        res.json({ message: "Order created successfully" });
        } catch (error) {
            console.error(error);
            res.json({ message: "Internal server error" });
        }
    }
}