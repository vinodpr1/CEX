import express from "express";
import orderController from "../../controllers/orderController";
import { authMiddleware } from "../../middlewares/auth.middleware";

export const router = express.Router();

router.post("/", authMiddleware, orderController.createOrder);