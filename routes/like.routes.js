import express from "express";
import { getLikesForPost, likePost, unlikePost } from "../controllers/like.controller.js";
import { authenticateUser } from "../middleware/authmiddleware.js";

const likeRouter = express.Router();

likeRouter.post("/", authenticateUser, likePost);

likeRouter.post("/unlike", authenticateUser, unlikePost);

likeRouter.get("/:postId", authenticateUser, getLikesForPost);

export default likeRouter;