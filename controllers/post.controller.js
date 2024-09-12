import { PrismaClient } from "@prisma/client";
import { fileURLToPath } from "url";
import { dirname,join } from "path";
import uploadFile from "../middleware/uploadfile.js";

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getPosts = async (req, res) => {
    const { search } = req.query;
    const authorId = req.user.id;

    try {
        const searchConditions = search
        ? {
            OR: [
                {
                    title: {
                        contains: search,
                        mode: 'insensitive'
                    }
                },
                {
                    content: {
                        contains: search,
                        mode: 'insensitive'
                    }
                }
            ]
        }
        : {};

        const posts = await prisma.post.findMany({
            where: searchConditions,
            include: {
                _count: {
                    select: {
                        likes: true
                    }
                },
                author: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
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
                }
            },
            orderBy: {
                UpdatedAt: "desc"
            }
        });

        const newFormattedPost = posts.map(post => {
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
                author: {
                    id: post.author.id,
                    name: post.author.name,
                    image: post.author.image
                },
                createdAt: post.CreatedAt,
                updatedAt: post.UpdatedAt,
                isEdited: post.isEdited,
                reactionCount: reactionCount.all.count,
                reactions: reactionCount,
                userReactonType: userReactonType,
                comments: topLevelComments
            };
        });

        res.json({data: newFormattedPost});
        
    } catch (error) {
        res.status(500).json({ error: "An error occurred while fetching posts." });
    }
};

export const getFollowerPosts = async (req, res) => {
    const { search } = req.query;
    const authorId = req.user.id;

    try {
        const searchConditions = search
        ? {
            OR: [
                {
                    title: {
                        contains: search,
                        mode: 'insensitive'
                    }
                },
                {
                    content: {
                        contains: search,
                        mode: 'insensitive'
                    }
                }
            ]
        }
        : {};

        const followIds = await prisma.user.findFirst({ where:{id:authorId}, select:{following:true} })
        const ids = followIds.following.map((k) => k.followingId);
        ids.push(authorId);
        console.log(ids);

        const posts = await prisma.post.findMany({
            where: { ...searchConditions, authorId:{in:ids} },
            include: {
                _count: {
                    select: {
                        likes: true
                    }
                },
                author: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
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
                }
            },
            orderBy: {
                UpdatedAt: "desc"
            }
        });

        const newFormattedPost = posts.map(post => {
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
                author: {
                    id: post.author.id,
                    name: post.author.name,
                    image: post.author.image
                },
                createdAt: post.CreatedAt,
                updatedAt: post.UpdatedAt,
                isEdited: post.isEdited,
                reactionCount: reactionCount.all.count,
                reactions: reactionCount,
                userReactonType: userReactonType,
                comments: topLevelComments
            };
        });

        res.json({data: newFormattedPost});
        
    } catch (error) {
        res.status(500).json({ error: "An error occurred while fetching posts." });
    }
};

export const getSinglePost = async (req, res) => {
    const {id} = req.params;
    const authorId = req.user.id;

    try {
        const post = await prisma.post.findUnique({
            where: { id: Number(id)},
            include: {
                _count: {
                    select: {
                        likes: true
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
                        authorId: true,
                        author: {
                            select: {
                                id: true,
                                name: true,
                                image: true
                            }
                        },
                        createdAt: true,
                        updatedAt: true
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
                }
            }
        });

        if (!post) {
            res.status(404).json({ error: "Post not found" });
        }

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
    
            const newFormattedPost = {
                id: post.id,
                title: post.title,
                content: post.content,
                image: post.image,
                author: {
                    id: post.author.id,
                    name: post.author.name,
                    image: post.author.image
                },
                createdAt: post.CreatedAt,
                updatedAt: post.UpdatedAt,
                reactionCount: reactionCount.all.users.length,
                reactions: reactionCount,
                userReactonType: userReactonType,
                comments: topLevelComments
            };
        res.status(200).json(newFormattedPost);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createPost = async (req, res) => {
    try {
        const { title, content } = req.body;
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
            console.log("No image found in request.");
        }

        const newPost = await prisma.post.create({
            data: { authorId: req.user.id, title, content, image: imagePath },
        });

        res.json(newPost);
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ error: error.message });
    }
};

// export const createPost = async (req, res) => {
//     try {
//         const { title, content } = req.body;
//         let imagePath = null;

//         if (req.files && req.files.image) {
//             imagePath = await uploadFile(req.files.image);
//         }
        
//         const newPost = await prisma.post.create({
//             data: { authorId: req.user.id, title, content, image: imagePath },
//         });
//         res.json(newPost);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

export const updatePost = async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    let imagePath = null;

    try {

        if (req.files && req.files.image) {
            try {
                imagePath = await uploadFile(req.files.image);
                console.log("New image path received:", imagePath);
            } catch (uploadError) {
                console.log("Error uploading file:", uploadError);
                return res.status(500).json({ error: "Failed to upload image." });
            }
        }

        const updateData = { title, content, isEdited: true };

        if (imagePath) {
            updateData.image = imagePath;
        }

        const post = await prisma.post.update({
            where: { id : Number(id) },
            data: updateData
        });
        
        if (!post) {
            res.status(404).json({ error: "Post not found" });
        }
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    };
};

export const deletePost = async (req, res) => {
    const { id } = req.params;
    const authorId = req.user.id;

    try {
        const post = await prisma.post.findUnique ({
            where: { id: Number(id) },
            select: { authorId: true }
        });

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        
        if (post.authorId !== authorId) {
            return res.status(403).json({ error: "You do not have permission to delete this post" });
        }

        await prisma.post.delete({
            where: { id: Number(id) }
        });

        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    };
};

  
  
  
  