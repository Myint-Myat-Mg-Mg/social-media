import express from "express";
import { createStory, getStories, viewStory, deleteStory } from "../controllers/story.controller.js";
import { authenticateUser } from "../middleware/authmiddleware.js";

const storyRouter = express.Router();

storyRouter.post("/", authenticateUser, createStory);

storyRouter.get("/", authenticateUser, getStories);

storyRouter.post("/:id", authenticateUser, viewStory)

storyRouter.delete("/:id", authenticateUser, deleteStory)

export default storyRouter;