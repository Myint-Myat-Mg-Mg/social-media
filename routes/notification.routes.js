import express from "express";
import { getNotification, markAsRead, deleteNotification } from "../controllers/notification.controller.js";
import { authenticateUser } from "../middleware/authmiddleware.js";

const notificationRouter = express.Router();

notificationRouter.get("/", authenticateUser, getNotification);

notificationRouter.patch("/:id/read", authenticateUser, markAsRead);

notificationRouter.delete("/:id", authenticateUser, deleteNotification);


export default notificationRouter;