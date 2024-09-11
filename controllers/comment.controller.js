import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getComments = async (req, res) => {
    try {
        const comments = await prisma.comment.findMany({
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                }
            },
        });

        const commentsMap = {};

        comments.forEach(comment => {
            commentsMap[comment.id] = {
                id: comment.id,
                content: comment.content,
                postId: comment.postId,
                author: comment.author ? {
                    id: comment.author.id,
                    name: comment.author.name,
                    image: comment.author.image
                } : null,
                parentId: comment.parentId,
                createdAt: comment.createdAt,
                updatedAt: comment.updatedAt,
                isEdited: comment.isEdited,
                commentReplied: []
            };
        });

        const topLevelComments = [];

        comments.forEach(comment => {
            if (comment.parentId) {
                if (commentsMap[comment.parentId]) {
                    commentsMap[comment.parentId].commentReplied.push(commentsMap[comment.id]);
                }
            } else {
                topLevelComments.push(commentsMap[comment.id]);
            }
        });

        // const formattedComments = comments.map(comment => ({
        //     id: comment.id,
        //     content: comment.content,
        //     postId: comment.postId,
        //     author: comment.author ? {
        //         id: comment.author.id,
        //         name: comment.author.name,
        //         image: comment.author.image
        //     } : null,
        //     parentId: comment.parentId,
        //     createdAt: comment.createdAt,
        //     updatedAt: comment.updatedAt
        // }));

        res.json(topLevelComments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getSingleComment = async (req, res) => {
    const {id} = req.params;
    try {
        const comment = await prisma.comment.findUnique({
            where: { id: Number(id) },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                }
            }
        });
        if (!comment) {
            res.status(404).json({ error: "Comment not found" });
        }

        let parentComment = null;

        if (comment.parentId) {
            parentComment = await prisma.comment.findUnique({
                where: { id: comment.parentId },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            image: true
                        }
                    }
                }
            });
        }

        const formattedComment = {
            id: comment.id,
            content: comment.content,
            postId: comment.postId,
            author: {
                id: comment.author.id,
                name: comment.author.name,
                image: comment.author.image
            },
            parentId: comment.parentId,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
            commentReplied: []
        };

        if (parentComment) {
            const formattedParentComment = {
                id: parentComment.id,
                content: parentComment.content,
                postId: parentComment.postId,
                parentId: parentComment.parentId,
                createdAt: parentComment.createdAt,
                updatedAt: parentComment.updatedAt,
                author: {
                    id: parentComment.author.id,
                    name: parentComment.author.name,
                    image: parentComment.author.image
                },
                commentReplied: [formattedComment]
            };

            res.status(200).json(formattedParentComment);
        } else {
            res.status(200).json(formattedComment);
        }
    } catch (error) {
        res.status(500).json({error: error.message });
    }
};

export const createComment = async (req, res) => {
    const { postId, content, parentId } = req.body;
    const authorId = req.user.id;

    if (!postId || !content) {
        return res.status(400).json({ error: "PostId and content are required" });
    }

    try {
        if (parentId) {
            const parentComment = await prisma.comment.findUnique({
                where: { id: Number(parentId) }
            });

            if (!parentComment) {
                res.status(404).json({ error: "Comment does not exist" });
            }
        }

        const newComment = await prisma.comment.create ({ 
            data: { authorId, postId: Number(postId), content, parentId: parentId ? Number(parentId) : null },
        });
        res.json(newComment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateComment = async (req, res) => {
    const { id } = req.params;
    const { postId, content } = req.body;
    const authorId = req.user.id;
    try {
        const comment = await prisma.comment.findUnique({
            where: { id: Number(id) }
        });

        if (!comment) {
            res.status(404).json({ error: "Comment not found" });
        }

        if (comment.authorId !== authorId) {
            return res.status(200).json({ error: "You are not authorized to update this comment."});
        }

        const updateComment = await prisma.comment.update({
            where: { id: Number(id) },
            data: { authorId, postId: Number(postId), content, isEdited: true }
        });

        res.status(200).json(updateComment);
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
 };