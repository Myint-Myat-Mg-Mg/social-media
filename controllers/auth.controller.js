import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const secretKey = "helloworld";

const prisma = new PrismaClient();

export const generateToken = (userName, id) => {
    const token = jwt.sign(
        {
            userName: userName,
            id: id,
            generateDateTime: new Date()
        },
        secretKey,
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
        const decoded = jwt.varfy(token, secretKey);
        if (decoded) {
            console.log(decoded);
            next();
        }
    } catch (err) {
        res.status(401).json({error: "Invalid token"});
    }
};

const userLogin = async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
        where: {
            email: email,
            password: password,
            
        },
        select: {
            name: true,
            id: true
        }
    });
    console.log(user);

    if(user) {
        const token = generateToken(user.name, user.id);
        res.json({
            message: "Login successful",
            token: token
        });
    }  else {
        res.status(401).json({
            message: "Invalid email or password"
        });

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
