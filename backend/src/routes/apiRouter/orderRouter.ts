import express from "express";
import orderController from "../../controllers/orderController";

export const router = express.Router();

router.get("/", orderController.getOrder);