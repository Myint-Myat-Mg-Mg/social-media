import express from 'express';
import { validateToken, userLogin, userRegister } from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post('/login', userLogin);

authRouter.get("/validate", (req, res) => {
    res.send("Validate route");
})
authRouter.get("/validate", validateToken);

authRouter.post("/register", userRegister);

export default authRouter;

