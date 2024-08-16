import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// const secretKey = "helloworld";

const prisma = new PrismaClient();

export const generateToken = (userName, id) => {
    const token = jwt.sign(
        {
            userName: userName,
            id: id,
            generateDateTime: new Date()
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h"
        }
    );
    return token;
}

export const validateToken = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) return
    res.status(401).json({error: "Access Denied"});
    try {
        const decoded = jwt.varfy(token, process.env.JWT_SECRET);
        if (decoded) {
            console.log(decoded);
            next();
        }
    } catch (err) {
        res.status(401).json({error: "Invalid or expired token"});
    }
};

const userLogin = async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
        where: {
            email: email,
        },
        select: {
            name: true,
            id: true,
            email: true,
            password: true
        }
    });
    console.log(user.password, 'user password');

    try {
        if(!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({error: "Invalid email or passsword"});

        }

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {expiresIn: "1h"});
    
        res.json({ token });
        } catch (error) {
            console.log(error)
        res.status(500).json({ error: error.message });
        }

};

const userRegister = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const result = await prisma.user.create({
            data: {
                email: email,
                password: password,
                name 
            },  
            select: {
                id: true,
                name: true
            }

        });
        const newUser = result;
        res.status(201).json(newUser);
    } catch (err) {
        console.log("Error registering user:", err);
        res.status(400).json({ error: `Error registering user`});
    }
};

export { userLogin, userRegister };
