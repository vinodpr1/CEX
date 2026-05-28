import express from "express";
import balanceController from "../../controllers/balanceController.ts";

export const router = express.Router();

router.get("/", balanceController.getBalance);