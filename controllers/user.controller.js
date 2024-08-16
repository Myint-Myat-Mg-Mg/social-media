import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

let users = [];

export const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
               email: true,
               bio: true,
               image: true

            }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
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
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateUser = async (req, res) => {
    const { name, email, bio, oldPassword, newPassword } = req.body;
    try {
        const user = await prisma.user.update({
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