import express from "express";
import { followUser, unfollowUser } from "../controllers/follow.controller.js";
import { authenticateUser } from "../middleware/authmiddleware.js";

const followRouter = express.Router();

followRouter.post("/follow", authenticateUser, followUser);

followRouter.post("/unfollow", authenticateUser, unfollowUser);

export default followRouter;

