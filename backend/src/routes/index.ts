import express from "express";
import { router as apiRouter } from "./apiRouter/index";

export const router = express.Router();

router.use("/v1", apiRouter);