import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const likePost = async (req, res) => {
    const { postId }  = req.body;
    const authorId = req.user.id;
    try {
         const newLike = await prisma.like.create({
            data: { 
                authorId, 
                postId: Number(postId) 
            },             
         });
         res.status(200).json(newLike);
    } catch (error) {
        req.status(500).json({ error: error.message });
    };
};

export const unlikePost = async (req, res) => {
    const { postId } = req.body;
    const authorId = req.user.id;

    try {
        await prisma.like.deleteMany({
            where: {
                authorId: authorId,
                postId: Number(postId)
            }
        });
        res.status(200).json({ message: "Like removed" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const getLikesForPost = async (req, res) => {
    const { postId } = req.params;
    try { 
        const likes = await prisma.like.findMany({
            where: { postId: Number(postId) },
            include: {
                author: {
                    select: {
                        name: true
                    }
                }
            }
        });
        res.status(200).json(likes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    };
};
 
