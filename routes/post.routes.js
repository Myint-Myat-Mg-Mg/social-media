import express from 'express';
import { getPosts, getFollowerPosts, createPost, getSinglePost, updatePost, deletePost } from "../controllers/post.controller.js";
import upload from '../middleware/uploadfile.js';
import { authenticateUser } from '../middleware/authmiddleware.js';

const postRouter = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Posts:
 *       type: object
 *       required:
 *         - authorId
 *         - title
 *         - content
 *         - image
 *       properties:
 *         authorId:
 *           type: int
 *           description: Id of user
 *         title:
 *           type: string
 *           description: Title of post
 *         content:
 *           type: text
 *           description: Description of post
 *       example:
 *         authorId: 2
 *         title: "Chilling"
 *         content: "Chilling with cofe"
 */

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: POST API description
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Posts'
 *     responses:
 *       200:
 *         description: The created post.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Posts'
 *       500:
 *         description: Some server error
 *
 */


/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: POST API description
 * /posts:
 *   get:
 *     summary: Get all posts
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: Get post succes.
 *       500:
 *         description: Some server error
 *
 */


/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: POST API description
 * /posts/{id}:
 *   put:
 *     summary: Update a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Posts'
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       404:
 *         description: Post not found
 */

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts] 
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post ID
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       404:
 *         description: Post not found
 */

postRouter.use(authenticateUser);

postRouter.get("/", getPosts);

postRouter.get("/followers", getFollowerPosts);

postRouter.get("/:id", getSinglePost);

postRouter.post("/", createPost);

postRouter.put("/:id", updatePost);

postRouter.patch("/");

postRouter.delete("/:id", deletePost);

export default postRouter;