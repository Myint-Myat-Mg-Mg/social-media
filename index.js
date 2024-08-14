import express from "express";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import postRouter from "./routes/post.routes.js";
import commentRouter from "./routes/comment.routes.js";
import fileUpload from "express-fileupload";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname,join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;
app.use(express.json());
app.use(fileUpload());

app.use("/users", userRouter);
app.use("/auth", authRouter);
app.use("/posts", postRouter);
app.use("/comments", commentRouter);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(port, () => 
    console.log(`app is listening on ${port}`));
