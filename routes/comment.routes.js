import express from 'express';
import { getComments, createComment, getSingleComment, updateComment, deleteComment } from "../controllers/comment.controller.js";

const commentRouter = express.Router();

commentRouter.get("/", getComments);

commentRouter.get("/:id", getSingleComment);

commentRouter.post("/", createComment);

commentRouter.put("/", updateComment);

commentRouter.patch("/");

commentRouter.delete("/", deleteComment);

export default commentRouter;