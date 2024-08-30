import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getComments = async (req, res) => {
    try {
        const comments = await prisma.comment.findMany();
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getSingleComment = async (req, res) => {
    const {id} = req.params;
    try {
        const comment = await prisma.comment.findUnique({
            where: { id: Number(id) }
        });
        if (!comment) {
            res.status(404).json({ error: "Comment not found" });
        }
        res.status(200).json(comment);
    } catch (error) {
        res.status(500).json({error: error.message });
    }
}

export const createComment = async (req, res) => {
    try {
        const { authorId, postId, content  } = req.body;
        const newComment = await prisma.comment.create({ 
            data: { authorId, postId, content },
        });
        res.json(newComment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateComment = async (req, res) => {
    const { id } = req.params;
    const { authorId, postId, content } = req.body;
    try {
        const comment = await prisma.comment.update({
            where: { id: Number(id) },
            data: { authorId, postId, content }
        });

        if (!comment) {
            res.status(404).json({ error: "Comment not found" });
        }
        res.status(200).json(comment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    };
};

export const deleteComment = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.comment.delete({
            where: { id: Number(id) }
        });
        res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    };
 }