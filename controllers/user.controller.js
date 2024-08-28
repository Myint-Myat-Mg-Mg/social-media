import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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
            where: { id: Number(id) }
        });
        if (!user) {
            req.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        req.status(500).json({ error: error.message });
    }
};

export const createUser = async (req, res) => {
    try {
        const { name, email, password, bio } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ error: "Name,email and password are requried"});
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    bio
                 },
            });
            res.json(newUser);
        }
    } catch (error) {
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
                const updatedUser = await prisma.user.update({
                    where: { id: req.user.id },
                    data: { name, email, bio }
                });
    
            res.status(200).json(updatedUser);
        } catch (error) {
            res.status(500).json({ error: error.message });
        };

    }
    
};

export const deleteUser = async (req, res) => {
    const { id } = req.params.id;
    try {
        await prisma.user.delete({
            where: { id: Number(id) }
        }); 
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        req.status(500).json({ error: error.message});
    };
};