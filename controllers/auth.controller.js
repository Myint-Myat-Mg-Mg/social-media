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
    );
    return token;
}

// export const validateToken = async (req, res, next) => {
//     const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET);
//     if (!token) return
//     res.status(401).json({error: "Access Denied"});
//     try {
//         const decoded = await jwt.verify(token, process.env.JWT_SECRET);
//         if (decoded) {
//             console.log(decoded);
//             req.user = decoded;

           
//             const userId = user.id;
//             const tokenID = {
//                 tk,
//                 userId
//             }
//             return res.status(200).json({ tokenID });
//         }
//     } catch (err) {
//         res.status(401).json({error: "Invalid token"});
//     }
// };
export const validateUser = async (req, res) => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Access Denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await prisma.user.findUnique({
            where: { id: Number(decoded.id) },
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
                            }
                        },
                        _count: {
                            select: { likes: true }
                        }
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const newFormattedUser = {
            id: user.id,
            name: user.name,
            email: user.email,
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
        res.status(401).json({ error: "Invalid token" });
    }
};

const userLogin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(404).json({ error: "Email and password are requried"});
    } else {
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
    
        try {
            if(!user || !(await bcrypt.compare(password, user.password))) {
                return res.status(401).json({error: "Invalid email or passsword"});
    
            }
    
            const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET);
            const userId = user.id;

            const tokenID = {
                token,
                userId
            }

            res.json({ tokenID });
            } catch (error) {
                console.log(error)
            res.status(500).json({ error: error.message });
            }
    }

};

const userRegister = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: "Name, email and password are requried"});
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if(existingUser) {
            return res.status(400).json({ error: "Email is already in use" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await prisma.user.create({
            data: {
                email: email,
                password: hashedPassword,
                name 
            },  
            select: {
                id: true,
                name: true,
                email: true
            }

        });
        const newUser = result;
        res.status(201).json(newUser);

    } catch (err) {
        console.log("Error registering user:", err);
        res.status(400).json({ error: `Error registering user: ${err.message}`});
    }
};

export { userLogin, userRegister };
