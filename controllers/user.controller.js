import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import { dirname,join } from "path";
import uploadFile from "../middleware/uploadfile.js";
import { title } from "process";

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let users = [];

export const getUsers = async (req, res) => {
    const { search } = req.query;

    try {
        const searchConditions = search
        ? {
            OR: [
                {
                    name: {
                        contains: search,
                        mode: 'insensitive'
                    }
                },
                {
                    email: {
                        contains: search,
                        mode: 'insensitive'
                    }
                }
            ]
        }
        : {};

        const users = await prisma.user.findMany({
            where: searchConditions,
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                bio: true,
                CreatedAt: true,
                UpdatedAt: true,
            }
        });
        const newFormattedUser = users.map(user => {
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
                bio: user.bio,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });

        res.json({data: newFormattedUser});
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "An error occurred while searching for users." });
    }
};

export const getSuggestUsers = async (req, res) => {
    const { search } = req.query;

    try {
        const searchConditions = search
        ? {
            OR: [
                {
                    name: {
                        contains: search,
                        mode: 'insensitive'
                    }
                },
                {
                    email: {
                        contains: search,
                        mode: 'insensitive'
                    }
                }
            ]
        }
        : {};

        const users = await prisma.user.findMany({
            where: searchConditions,
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                bio: true,
            }
        });
        const newFormattedUser = users.map(user => {
            return {
                id: user.id,
                name: user.name,
                image: user.image,
                bio: user.bio
            }
        });

        res.json({data: newFormattedUser});
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "An error occurred while searching for users." });
    }
};

export const getSingleUser = async (req, res) => {
    const {id} = req.params;
    const authorId = req.user.id;

    try {
        const user = await prisma.user.findUnique({
            where: { id: Number(id) },
            include: {
                followers: true,
                following: true,
                posts: {
                    include: {
                        comments: {
                            select: {
                                id: true,
                                parentId: true,
                                content: true,
                                author: {
                                    select: {
                                        id: true,
                                        name: true,
                                        image: true
                                    }
                                },
                                createdAt: true,
                                updatedAt: true,
                                isEdited: true
                            },
                            
                        },
                        _count: {
                            select: { likes: true }
                        },
                        likes: {
                            select: {
                                id: true,
                                reactionType: true,
                                authorId: true,
                                author: {
                                    select: {
                                        id: true,
                                        name: true,
                                        image: true
                                    }
                                }
                            }
                        } 
                    }            
                }
            }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const isFollowing = user.followers.some(follower => follower.followerId === authorId);

        const formattedPosts = user.posts.map(post => {
            const reactionCount = {
                all: {
                    users: []
                },
                like: [],
                love: [],
                haha: [],
                sad: [],
                angry: []
            };

            post.likes.forEach(like => {
                const reactionType = like.reactionType.toLowerCase();
                if (reactionCount.hasOwnProperty(reactionType)) {
                    reactionCount[reactionType].push({
                        id: like.author.id,
                        name: like.author.name,
                        image: like.author.image
                    });
                }

                reactionCount.all.users.push({
                    id: like.author.id,
                    name: like.author.name,
                    image: like.author.image
                });
            });

            const commentsMap = {};
            post.comments.forEach(comment => {
                commentsMap[comment.id] = {
                    id: comment.id,
                    parentId: comment.parentId,
                    content: comment.content,
                    author: {
                        id: comment.author.id,
                        name: comment.author.name,
                        image: comment.author.image
                    },
                    createdAt: comment.createdAt,
                    updatedAt: comment.updatedAt,
                    isEdited: comment.isEdited,
                    commentReplied: []
                };
            });

            const topLevelComments = [];
            post.comments.forEach(comment => {
                if (comment.parentId) {
                    if (commentsMap[comment.parentId]) {
                        commentsMap[comment.parentId].commentReplied.push(commentsMap[comment.id]);
                    }
                } else {
                    topLevelComments.push(commentsMap[comment.id]);
                }
            });

            return {
                id: post.id,
                title: post.title,
                content: post.content,
                image: post.image,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
                reactionCount: post._count.likes,
                reactions: reactionCount,
                comments: topLevelComments
            };
        });

        const newFormattedUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            password: user.password,
            image: user.image,
            bio: user.bio,
            createdAt: user.CreatedAt,
            updatedAt: user.UpdatedAt,
            followerCount: user.followers.length,
            followingCount: user.following.length,
            isFollowing,
            posts: formattedPosts
        };

        res.status(200).json(newFormattedUser);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: error.message });
    }
};



export const createUser = async (req, res) => {
    try {
        const { name, email, password, bio } = req.body;
        let imagePath = null;
        const defaultAvatarPath = "/path/to/default/avatar.png";

        if (req.files && req.files.image) {
            try {
                imagePath = await uploadFile(req.files.image);
                console.log("Image path received:", imagePath);
            } catch (uploadError) {
                console.error("Error uploading file:", uploadError);
                return res.status(500).json({ error: "Failed to upload image." });
            }
        } else {
            imagePath = defaultAvatarPath;
            console.log("No image found in request");
        }

        if (!name || !email || !password) {
            return res.status(400).json({ error: "Name,email and password are requried"});
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (!existingUser) {
            return res.status(400).json({ error: "Email is not registered. Please register first." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.update({
            where: { email },
            data: {
                name,
                password: hashedPassword,
                bio,
                image: imagePath
             },
        });
        res.json(newUser);    

    } catch (error) { 
        console.error("Error creating user:", error);
        res.status(500).json({ error: error.message });
    }
};

export const updateUser = async (req, res) => {
    const { name, email, bio, oldPassword, newPassword } = req.body;
    if (!name || !email ) {
        return res.status(400).json({ error: "Name and email are required." });
    } 
    
    if(newPassword && !oldPassword) {
        return res.status(400).json({ error: "Old password is required to set a new password." });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
        });
        
        if (!user) {
            res.status(404).json({ error: "User not found" });
        }

        if (oldPassword && newPassword) {
            const isMatch = await bcrypt.compare(oldPassword, user.password);

            if (!isMatch) {
                return res.status(404).json({ error: "Old password is incorrect"});
            }

            const hashedNewPassword = await bcrypt.hash(newPassword, 10);

            await prisma.user.update({
                where: { id: req.user.id },
                data: { password: hashedNewPassword }
            });
        }

        let imagePath = user.image;
        if (req.files && req.files.image) {
            try {
                imagePath = await uploadFile(req.files.image);
                console.log("Image path recevied;", imagePath);
            } catch (uploadError) {
                console.error("Error uploading file:", uploadError); 
                return res.status(500).json({ error: "Failed to upload image." });
            }
        } else {
            console.log("No new image found in request.")
        }

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: { name, email, bio, image: imagePath }
        });    

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "An error occurred while updating user details." });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;
    const loggedInUserId = req.user;

    try {
        if(Number(id) !== loggedInUserId) {
            return res.status(403).json({ error: "You do not have permission to delete this user." });
        }

        await prisma.$transaction(async (prisma) => {
            await prisma.comment.deleteMany({
                where: { authorId: Number(id) }
            })

            await prisma.post.deleteMany({
                where: { authorId: Number(id) }
            })

            await prisma.user.delete({
                where: { id: Number(id) }
            })

        })
 
        res.status(200).json({ message: "User and all related posts and comments are deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message});
    };
};