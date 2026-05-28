import express from "express";
import { router as  balanceRouter } from "./balanceRouter";
import { router as depthRouter} from "./depthRouter";
import { router as fillsRouter} from "./fillsRouter";
import { router as orderRouter} from "./orderRouter";
import { router as stockRouter} from "./stockRouter";
import { router as signInRouter} from "./userRouter";

export const router = express.Router();

router.use("/balance", balanceRouter);
router.use("/depth", depthRouter);
router.use("/fills", fillsRouter);
router.use("/order", orderRouter);
router.use("/stock", stockRouter);
router.use("/user", signInRouter);