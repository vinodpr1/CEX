import express from "express";
import depthController from "../../controllers/depthController";

export const router = express.Router();

router.get("/", depthController.getDepth);