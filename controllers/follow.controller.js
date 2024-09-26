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

        const follower = await prisma.user.findUnique({
            where: { id: followerId },
            select: { name: true }
        })

        if (!follower || !follower.name) {
            return res.status(400).json({ error: "Follower's name not found." });
        }


        await prisma.notification.create({
            data: {
                type: 'follow',  // Notification type
                content: `${follower.name} started following you`,  // Notification message
                authorId: Number(followingId),  // The followed user (receiver)
                senderId: followerId          // The follower (sender)
            }
        });

        res.status(200).json({ message: "Successfully followed the user.", follow: newFollow });
    } catch (error) {
        console.error("Error following user:", error);
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
        console.log(error, "logging error")
        res.status(500).json({ error: "An error occurred while unfollowing the user." });
    }
};

export const getFollowUsers = async (req, res) => {
    const userId = req.user.id;

    try {
        const following = await prisma.follow.findMany({
            where: {
                followerId: userId
            },
            include: {
                following: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        bio: true
                    }
                }
            }
        });

        const followers = await prisma.follow.findMany({
            where: {
                followingId: userId
            },
            include: {
                follower: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        bio: true
                    }
                }
            }
        });

        const followingUsers = following.map(follow => follow.following);
        const followerUsers = followers.map(follow => follow.follower);

        res.status(200).json({ followingUsers, followerUsers });
    } catch (error) {
        console.error("Error fetching follow data:", error);
        res.status(500).json({ error: "An error occurred while fetching follow data." });
    }
};
