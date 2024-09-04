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
    try {
        const user = await prisma.user.findUnique({
            where: { id: Number(id) },
            include: {
                posts: {
                    include: {
                        comments: {
                            select: {
                                id: true,
                                content: true,
                                author: {
                                    select: {
                                        name: true
                                    }
                                },
                                createdAt: true,
                                updatedAt: true
                            },
                            
                        },
                        _count: {
                            select: { likes: true }
                        } 
                    }            
                }
            }
        });

        if (!user) {
            return req.status(404).json({ error: "User not found" });
        }

        const newFormattedUser = {
                id: user.id,
                name: user.name,
                email: user.email,
                password: user.password,
                image: user.image,
                bio: user.bio,
                createdAt: user.CreatedAt,
                updatedAt: user.UpdatedAt,
                posts: user.posts.map(post => ({
                    id: post.id,
                    title: post.title,
                    content: post.content,
                    image: post.image,
                    createdAt: post.CreatedAt,
                    updatedAt: post.UpdatedAt,
                    reactionCount: post._count.likes,
                    comments: post.comments.map(comment => ({
                        id: comment.id,
                        content: comment.content,
                        authorName: comment.author.name,
                        createdAt: comment.createdAt,
                        updatedAt: comment.updatedAt
                    }))
                }))
            };

        res.status(200).json(newFormattedUser);
    } catch (error) {
        console.error("Error fetching user:", error);
        req.status(500).json({ error: error.message });
    }
};

export const createUser = async (req, res) => {
    try {
        const { name, email, password, bio } = req.body;
        let imagePath = null;

        if (req.files && req.files.image) {
            try {
                imagePath = await uploadFile(req.files.image);
                console.log("Image path received:", imagePath);
            } catch (uploadError) {
                console.error("Error uploading file:", uploadError);
                return res.status(500).json({ error: "Failed to upload image." });
            }
        } else {
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
    if (!name || !email || (newPassword && !oldPassword)) {
        return res.status(400).json({ error: "Name, email, old password (if changing password), and new password are required." });
    } else {
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
                    res.status(404).json({ error: "Old password is incorrect"});
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
                    console.error("Error uploading file:", uploadErro);
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
            res.status(500).json({ error: error.message });
        }

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