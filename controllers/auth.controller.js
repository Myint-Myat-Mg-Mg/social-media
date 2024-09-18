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
    const authorId = req.user.id;

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
                        images: {
                            select: {
                                imageUrl: true
                            }
                        },
                        author: {
                            select: {
                                id: true,
                                name: true,
                                image: true
                            }
                        },
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
                            }
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
                        },
                        shares: {
                            select: {
                                id: true,
                                author: {
                                    select: {
                                        id: true,
                                        name: true,
                                        image: true
                                    }
                                }
                            }
                        },
                        _count: {
                            select: { likes: true, shares: true }
                        }
                    },
                    orderBy: {
                        UpdatedAt: "desc"
                    }
                },
                likes: {
                    include: {
                        post: {
                            include: {
                                images: {
                                    select: {
                                        imageUrl: true
                                    }
                                },
                                author: {
                                    select: {
                                        id: true,
                                        name: true,
                                        image: true
                                    }
                                },
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
                                    }
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
                                },
                                shares: {
                                    select: {
                                        id: true,
                                        author: {
                                            select: {
                                                id: true,
                                                name: true,
                                                image: true
                                            }
                                        }
                                    }   
                                },
                                _count: {
                                     select: { likes: true, shares: true }
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

        const reactedPosts = user.likes.filter(like => like.post.author.id !== authorId)
        .map(like => {
            const post = like.post;

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
                
                
            let userReactonType = null;
    
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

                    if (like.authorId === authorId) {
                        userReactonType = reactionType;
                    }
                });

                const shareUsers = post.shares.map(share => ({
                    id: share.author.id,
                    name: share.author.name,
                    image: share.author.image
                }))
    
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
                    images: post.images.map(image => image.imageUrl),
                    author: {
                        id: post.author.id,
                        name: post.author.name,
                        image: post.author.image
                    },
                    createdAt: post.CreatedAt,
                    updatedAt: post.UpdatedAt,
                    isEdited: post.isEdited,
                    reactionCount: reactionCount.all.users.length,
                    reactions: reactionCount,
                    userReactonType: userReactonType,
                    comments: topLevelComments,
                    shareCount: post._count.shares,
                    shareUsers: shareUsers
                };
            });

            const newFormattedUser = {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
                bio: user.bio,
                createdAt: user.CreatedAt,
                updatedAt: user.UpdatedAt,
                posts: user.posts.map(post => {
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
    
                    let userReactonType = null;
    
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
    
                        if (like.authorId === authorId) {
                            userReactonType = reactionType;
                        }
                    });

                    const shareUsers = post.shares.map(share => ({
                        id: share.author.id,
                        name: share.author.name,
                        image: share.author.image
                    }));
    
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
                        images: post.images.map(image => image.imageUrl),
                        author: {
                            id: post.author.id,
                            name: post.author.name,
                            image: post.author.image
                        },
                        createdAt: post.createdAt,
                        updatedAt: post.updatedAt,
                        isEdited: post.isEdited,
                        reactionCount: reactionCount.all.users.length,
                        reactions: reactionCount,
                        userReactonType: userReactonType,
                        comments: topLevelComments,
                        shareCount: post._count.shares,
                        shareUsers: shareUsers
                        
                    };
                }),
                reactedPosts
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
