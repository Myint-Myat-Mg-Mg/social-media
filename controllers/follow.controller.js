import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const followUser = async (req, res) => {
    const { followingId } = req.body;
    const followerId = req.user.id;

    if (followingId === followerId) {
        return res.status(400).json({ error: "You cannot follow yourself." });
    }

    try {
        const existingFollow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId: Number(followingId)
                }
            }
        });

        if (existingFollow) {
            return res.status(400).json({ error: "You are already following this user." });
        }

        const newFollow = await prisma.follow.create({
            data: {
                followerId,
                followingId: Number(followingId)
            }
        });

        res.status(200).json({ message: "Successfully followed the user.", follow: newFollow });
    } catch (error) {
        res.status(500).json({ error: "An error occurred while following the user." });
    }
};

export const unfollowUser = async (req, res) => {
    const { followingId } = req.body;
    const followerId = req.user.id;

    try {
        const existingFollow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId: Number(followingId)
                }
            }
        });

        if (!existingFollow) {
            return res.status(400).json({ error: "You are not following this user." });
        }

        await prisma.follow.delete({
            where: {
                id: existingFollow.id
            }
        });

        res.status(200).json({ message: "Successfully unfollowed the user." });
    } catch (error) {
        res.status(500).json({ error: "An error occurred while unfollowing the user." });
    }
};
