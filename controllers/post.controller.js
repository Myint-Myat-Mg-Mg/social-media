import { PrismaClient } from "@prisma/client";
import { fileURLToPath } from "url";
import { dirname,join } from "path";
import uploadFile from "../middleware/uploadfile.js";

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getPosts = async (req, res) => {
    try {
        const posts = await prisma.post.findMany();
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getSinglePost = async (req, res) => {
    const {id} = req.params;
    try {
        const post = await prisma.post.findUnique({
            where: { id: Number(id)}
        });
        if (!post) {
            res.status(500).json({ error: "Post not found" });
        }
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createPost = async (req, res) => {
    try {
        const { authorId, title, content } = req.body;
        let imagePath = null;

        if (req.files && req.files.image) {
            imagePath = await uploadFile(req.files.image);
        }
        const newPost = await prisma.post.create({
            data: { authorId: parseInt(authorId, 10), title, content, image: imagePath },
        });
        res.json(newPost);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


  
  
  
  