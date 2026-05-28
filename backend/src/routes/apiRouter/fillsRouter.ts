import express from "express";
import fillsController from "../../controllers/fillsController";

export const router = express.Router();

router.get("/", fillsController.getFills);