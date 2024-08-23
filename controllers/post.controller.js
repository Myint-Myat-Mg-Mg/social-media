import { PrismaClient } from "@prisma/client";
import { fileURLToPath } from "url";
import { dirname,join } from "path";
import uploadFile from "../middleware/uploadfile.js";

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getPosts = async (req, res) => {
    try {
        const posts = await prisma.post.findMany({
            include: {
                _count: {
                    select: {
                        likes: true
                    }
                }
            }
        });

        const newFormattedPost = posts.map(post => {
            return {
                id: post.id,
                title: post.title,
                content: post.content,
                authorId: post.authorId,
                image: post.image,
                createdAt: post.CreatedAt,
                updatedAt: post.UpdatedAt,
                reactionCount: post._count.likes 
            }
        })

        res.json(newFormattedPost);
        
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
            res.status(404).json({ error: "Post not found" });
        }
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createPost = async (req, res) => {
    try {
        const { title, content } = req.body;
        let imagePath = null;

        if (req.files && req.files.image) {
            imagePath = await uploadFile(req.files.image);
        }
        
        const newPost = await prisma.post.create({
            data: { authorId: req.user.id, title, content, image: imagePath },
        });
        res.json(newPost);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updatePost = async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    try {
        const post = await prisma.post.update({
            where: { id : Number(id) },
            data: { title, content }
        });
        
        if (!post) {
            res.status(404).json({ error: "Post not found" });
        }
        res.status(200).json(post);
    } catch (error) {
        res.status(500).josn({ error: error.message });
    };
};

export const deletePost = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.post.delete({
            where: { id: Number(id) } 
        });
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    };
};

  
  
  
  