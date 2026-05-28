import express from "express";
import userController from "../../controllers/userController.ts";
export const router = express.Router();

router.post("/signup", userController.signUp);
router.post("/signin", userController.signIn);
router.post("/signout", userController.logout);