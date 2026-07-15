import { z } from "zod";

export const exchangeSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("limit"),
        side: z.enum(["buy", "sell"]),
        symbol: z.string().trim().min(1, {message: "symbol is required"}),
        qty: z.number().positive().min(1, {message: "quantity is required"}),
        price: z.number().positive().min(1, {message: "price is required"}),
    }),
    z.object({
        type: z.literal("market"),
        side: z.enum(["buy", "sell"]),
        symbol: z.string().trim().min(1, {message: "symbol is required"}),
        qty: z.number().positive().min(1, {message: "quantity is required"}),
        price: z.null().optional()
    })
])