import express from "express";
import { sharePost, getSharesByUser, getShare, updateShare, deleteShare } from "../controllers/share.controller.js";
import { authenticateUser } from "../middleware/authmiddleware.js";

const shareRouter = express.Router();

shareRouter.post("/", authenticateUser, sharePost);

shareRouter.get("/", authenticateUser, getSharesByUser);

shareRouter.get("/:id", authenticateUser, getShare)

shareRouter.put("/:id", authenticateUser, updateShare)

shareRouter.delete("/:id", authenticateUser, deleteShare)

export default shareRouter;
