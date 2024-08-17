import express from 'express';
import { getComments, createComment, getSingleComment, updateComment, deleteComment } from "../controllers/comment.controller.js";

const commentRouter = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Comments:
 *       type: object
 *       required:
 *         - authorId
 *         - postId
 *         - content
 *       properties:
 *         authorId:
 *           type: int
 *           description: Id of user
 *         postId:
 *           type: int
 *           description: Id of post
 *         content:
 *           type: text
 *           description: Description of post
 *       example:
 *         authorId: 3
 *         postId: 2
 *         content: "so fine"
 */

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: COMMENT API description
 * /comments:
 *   post:
 *     summary: Create a new comment
 *     tags: [Comments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comments'
 *     responses:
 *       200:
 *         description: The created comment.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comments'
 *       500:
 *         description: Some server error
 *
 */


/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: COMMENT API description
 * /comments:
 *   get:
 *     summary: Get all comments
 *     tags: [Comments]
 *     responses:
 *       200:
 *         description: Get comment succes.
 *       500:
 *         description: Some server error
 *
 */


/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: COMMENT API description
 * /comments/{id}:
 *   put:
 *     summary: Update a comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comments'
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       404:
 *         description: Comment not found
 */

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments] 
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       404:
 *         description: Comment not found
 */

commentRouter.get("/", getComments);

commentRouter.get("/:id", getSingleComment);

commentRouter.post("/", createComment);

commentRouter.put("/", updateComment);

commentRouter.patch("/");

commentRouter.delete("/", deleteComment);

export default commentRouter;