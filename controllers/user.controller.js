import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

let users = [];

export const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany();
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
            req.status(500).json({ error: "User not found" });
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
            data: {name, email, password, bio, hashedPassword },
        });
        res.json(newUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};