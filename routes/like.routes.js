import express from "express";
import { getReactionsForPost, addReaction, getReactionsByType } from "../controllers/like.controller.js";
import { authenticateUser } from "../middleware/authmiddleware.js";

const likeRouter = express.Router();

likeRouter.post("/reactions", authenticateUser, addReaction);

likeRouter.get("/posts/:postId/reactions", authenticateUser, getReactionsForPost);

likeRouter.get("/posts/:postId/reactions/:reactionType", authenticateUser, getReactionsByType);

export default likeRouter;