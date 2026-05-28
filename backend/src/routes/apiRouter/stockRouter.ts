import express from "express";
import stockController from "../../controllers/stockController";

export const router = express.Router();

router.get("/", stockController.getStocks);