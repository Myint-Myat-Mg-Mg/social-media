import { PrismaClient } from "@prisma/client";

const pirsma = new PrismaClient();

export const getComments = async (req, res) => {
    try {
        const comments = await pirsma.comment.findMany();
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getSingleComment = async (req, res) => {
    const {id} = req.params;
    try {
        const comment = await pirsma.comment.findUnique({
            where: { id: Number(id) }
        });
        if (!comment) {
            res.status(500).json({ error: "Comment not found" });
        }
        res.status(200).json(comment);
    } catch (error) {
        res.status(500).json({error: error.message });
    }
}

export const createComment = async (req, res) => {
    try {
        const { authorId, postId, content  } = req.body;
        const newComment = await pirsma.comment.create({ 
            data: { authorId, postId, content },
        });
        res.json(newComment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};