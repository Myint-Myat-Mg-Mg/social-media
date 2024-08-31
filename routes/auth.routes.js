import express from 'express';
import { validateUser, userLogin, userRegister } from "../controllers/auth.controller.js";
import { authenticateUser } from '../middleware/authmiddleware.js';

const authRouter = express.Router();

/**
 * @swagger
 *  components:
 *  securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *  security:
 *    - bearerAuth: []
 */


/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: Email
 *         schema:
 *           type: string
 *         description: Email of the user
 *       - in: path
 *         name: Password
 *         schema:
 *           type: string
 *         description: Password of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                email:
 *                  type: string
 *                password:
 *                  type: string
 *             example:
 *                 "username": "mm@gmail.com"
 *                 "passowrd": "mm1234"             
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /auth/validate:
 *   get:
 *     summary: Validate user token
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: Token
 *         schema:
 *           type: string
 *         description: Token of the user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *       401:
 *         description: Invalid token
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: Username
 *         schema:
 *           type: string
 *         description: Name of the user
 *       - in: path
 *         name: Email
 *         schema:
 *           type: string
 *         description: Email of the user
 *       - in: path
 *         name: Password
 *         schema:
 *           type: string
 *         description: Password of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                username:
 *                  type: string
 *                email:
 *                  type: string
 *                password:
 *                  type: string
 *             example:
 *                 "username": "myint myat"
 *                 "email": "mm@gmail.com"
 *                 "passowrd": "mm1234"
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */

authRouter.post('/login', userLogin);

// authRouter.get("/validate", (req, res) => {
//     res.send("Validate route");
// })
authRouter.get("/validate", authenticateUser, validateUser);

authRouter.post("/register", userRegister);

export default authRouter;

