import express from 'express';
import { getUsers, createUser, getSingleUser, updateUser, deleteUser } from "../controllers/user.controller.js";
import { authenticateUser } from '../middleware/authmiddleware.js';

const userRouter = express.Router();

userRouter.get("/", authenticateUser, getUsers);

userRouter.get("/:id", authenticateUser, getSingleUser);

userRouter.post("/", createUser);

userRouter.put("/", authenticateUser, updateUser);

userRouter.patch("/");

userRouter.delete("/", deleteUser);

export default userRouter;