import express from 'express';
import { getPosts, createPost, getSinglePost } from "../controllers/post.controller.js";
import upload from '../middleware/uploadfile.js';

const postRouter = express.Router();

postRouter.get("/", getPosts);

postRouter.get("/:id", getSinglePost);

postRouter.post("/", createPost);

postRouter.put("/");

postRouter.patch("/");

postRouter.delete("/");

export default postRouter;