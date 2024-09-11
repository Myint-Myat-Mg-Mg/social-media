import express from 'express';
import { getUsers, createUser, getSingleUser, updateUser, deleteUser } from "../controllers/user.controller.js";
import { authenticateUser } from '../middleware/authmiddleware.js';

const userRouter = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Users:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - bio
 *       properties:
 *         name:
 *           type: string
 *           description: Name of user
 *         email:
 *           type: string
 *           description: Email of user
 *         password:
 *            type: string
 *            description: Password of user
 *         bio:
    *         type: string
    *         description: about user
 *       example:
 *         name: "Myint Myat Mg Mg"
 *         email: "email@gmail.com"
 *         password: "password"
 *         bio: "Developer"
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: USER API description
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Users'
 *     responses:
 *       200:
 *         description: The created user.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Users'
 *       500:
 *         description: Some server error
 *
 */


/**
 * @swagger
 * tags:
 *   name: Users
 *   description: USER API description
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Get user succes.
 *       500:
 *         description: Some server error
 *
 */


/**
 * @swagger
 * tags:
 *   name: Users
 *   description: USER API description
 * /users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Users'
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users] 
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */

userRouter.get("/", authenticateUser, getUsers);

userRouter.get("/:id", authenticateUser, getSingleUser);

userRouter.post("/", createUser);

userRouter.put("/", authenticateUser, updateUser);

userRouter.patch("/");

userRouter.delete("/", authenticateUser, deleteUser);

export default userRouter;
