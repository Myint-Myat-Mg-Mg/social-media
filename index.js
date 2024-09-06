import express from "express";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import postRouter from "./routes/post.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import followRouter from "./routes/follow.routes.js";
import fileUpload from "express-fileupload";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname,join } from 'path';
import swaggerUiExpress from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { options } from "./swagger.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import cors from "cors";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.port || 3000;
app.use(express.json());
app.use(fileUpload());
app.use(cors());

app.use("/users", userRouter);
app.use("/auth", authRouter);
app.use("/posts", postRouter);
app.use("/comments", commentRouter);
app.use("/likes", likeRouter);
app.use("/follows", followRouter);

const specs = swaggerJsdoc(options);
app.use(
  "/api-docs",
  swaggerUiExpress.serve,
  swaggerUiExpress.setup(specs)
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(port, () => 
    console.log(`app is listening on ${port}`));
