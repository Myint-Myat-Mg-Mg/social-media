import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const addReaction = async (req, res) => {
    const { postId, reactionType }  = req.body;
    const authorId = req.user.id;

    const validReaction =  ["LIKE", "LOVE", "HAHA", "SAD", "ANGRY"];
    if (!validReaction.includes(reactionType)) {
        return res.status(400).json({ error: "Invalid reaction type" });
    }

    try {
        const existingReaction = await prisma.like.findFirst({
            where: {
                postId: Number(postId),
                authorId: Number(authorId),
            }
        });

        if (existingReaction) {
            if (existingReaction.reactionType === reactionType) {
                await prisma.like.delete({
                    where: {
                        id: existingReaction.id
                    }
                });
                res.status(200).json({ message: `Remove ${reactionType} reaction from post` });
            } else {
                const updateReaction = await prisma.like.update({
                    where: {
                        id: existingReaction.id
                    },
                    data: {
                        reactionType: reactionType
                    }
                });
            res.status(200).json({ message: `Update reaction to ${reactionType}`, reaction: updateReaction });
            }
        } else {

         const newReaction = await prisma.like.create({
            data: { 
                authorId: Number(authorId), 
                postId: Number(postId),
                reactionType 
            },             
         });
         res.status(200).json({ message: `Added ${reactionType} reaction to the post` , reaction: newReaction});
        }
    } catch (error) {
        res.status(500).json({ error: "An error occurred while adding a reaction." });
    };
};

export const getReactionsForPost = async (req, res) => {
    const { postId } = req.params;
    try { 
        const reactions = await prisma.like.findMany({
            where: { postId: Number(postId) },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        res.status(200).json(reactions);
    } catch (error) {
        res.status(500).json({ error: "An error occurred while retrieving reactions." });
    };
};

export const getReactionsByType = async (req, res) => {
    const { postId, reactionType } = req.params;

    try {
        const reactions = await prisma.like.findMany({
            where: {
                postId: Number(postId),
                reactionType: reactionType,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        });

        res.status(200).json(reactions);
    } catch (error) {
        res.status(500).json({ error: "An error occurred while retrieving reactions." });
    }
};
 
