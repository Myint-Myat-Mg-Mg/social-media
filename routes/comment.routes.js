import express from 'express';
import { getComments, createComment, getSingleComment } from "../controllers/comment.controller.js";

const commentRouter = express.Router();

commentRouter.get("/", getComments);

commentRouter.get("/:id", getSingleComment);

commentRouter.post("/", createComment);

commentRouter.put("/");

commentRouter.patch("/");

commentRouter.delete("/");

export default commentRouter;