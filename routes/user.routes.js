import express from 'express';
import { getUsers, createUser, getSingleUser } from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.get("/", getUsers);

userRouter.get("/:id", getSingleUser);

userRouter.post("/", createUser);

userRouter.put("/");

userRouter.patch("/");

userRouter.delete("/");

export default userRouter;