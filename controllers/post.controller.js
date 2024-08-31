import { PrismaClient } from "@prisma/client";
import { fileURLToPath } from "url";
import { dirname,join } from "path";
import uploadFile from "../middleware/uploadfile.js";

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getPosts = async (req, res) => {
    const { search } = req.query;

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
                        name: true
                    }
                },
                comments: {
                    select: {
                        id: true,
                        content: true,
                        authorId: true,
                        author: {
                            select: {
                                name: true
                            }
                        },
                        createdAt: true,
                        updatedAt: true
                    }
                }
            }
        });

        const newFormattedPost = posts.map(post => {
            return {
                id: post.id,
                title: post.title,
                content: post.content,
                authorName: post.author.name,
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
            }
        });

        res.json({data: newFormattedPost});
        
    } catch (error) {
        res.status(500).json({ error: "An error occurred while fetching posts." });
    }
};

export const getSinglePost = async (req, res) => {
    const {id} = req.params;
    try {
        const post = await prisma.post.findUnique({
            where: { id: Number(id)},
            include: {
                _count: {
                    select: {
                        likes: true
                    }
                },
                comments: {
                    select: {
                        id: true,
                        content: true,
                        authorId: true,
                        author: {
                            select: {
                                name: true
                            }
                        },
                        createdAt: true,
                        updatedAt: true
                    }
                }
            }
        });
        if (!post) {
            res.status(404).json({ error: "Post not found" });
        }

        const newFormattedPost = {
                id: post.id,
                title: post.title,
                content: post.content,
                authorId: post.authorId,
                image: post.image,
                createdAt: post.CreatedAt,
                updatedAt: post.UpdatedAt,
                reactionCount: post._count.likes,
                comments: post.comments.map(comment => ({
                    id: comment.id,
                    content: comment.content,
                    authorId: comment.authorId,
                    authorName: comment.author.name,
                    createdAt: comment.createdAt,
                    updatedAt: comment.updatedAt
                }))
            }
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

        const updateData = { title, content };

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
        res.status(500).josn({ error: error.message });
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

  
  
  
  