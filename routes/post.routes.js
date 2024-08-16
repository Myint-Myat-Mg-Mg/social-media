import express from 'express';
import { getPosts, createPost, getSinglePost, updatePost, deletePost } from "../controllers/post.controller.js";
import upload from '../middleware/uploadfile.js';
import { authenticateUser } from '../middleware/authmiddleware.js';

const postRouter = express.Router();

postRouter.use(authenticateUser);

postRouter.get("/", getPosts);

postRouter.get("/:id", getSinglePost);

postRouter.post("/", createPost);

postRouter.put("/", updatePost);

postRouter.patch("/");

postRouter.delete("/", deletePost);

export default postRouter;