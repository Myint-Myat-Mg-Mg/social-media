import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const sharePost = async (req, res) => {
    const { postId, title } = req.body;
    const authorId = req.user.id;

    try {
        const post = await prisma.post.findUnique({
            where: { id: Number(postId) },
            include: { author: {
                select: {
                    id: true,
                    name: true,
                    image: true
                }
            }}
        });

        if (!post) {
            return res.status(404).json({ error: "Post not found." });
        }

        const existingShare = await prisma.share.findFirst({
            where: { authorId, postId: Number(postId) },
        });

        if (existingShare) {
            return res.status(400).json({ error: "You have already shared this post." });
        }

        const newShare = await prisma.share.create({
            data: {
                authorId,
                postId: Number(postId),
                title
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                },
                post: {
                    include: {
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

        const newFormattedShare = {
            message: "Post shared successfully.",
            share: {
                id: newShare.id,
                title: newShare.title,
                shareUser: {
                    id: newShare.author.id,
                    name: newShare.author.name,
                    image: newShare.author.image
                },
                createdAt: newShare.createdAt,
                updatedAt: newShare.updatedAt,
                post: {
                    id: newShare.post.id,
                    title: newShare.post.title,
                    content: newShare.post.content,
                    image: newShare.post.image,
                    author: {
                        id: newShare.post.author.id,
                        name: newShare.post.author.name,
                        image: newShare.post.author.image
                    },
                    CreatedAt: newShare.post.CreatedAt,
                    UpdatedAt: newShare.post.UpdatedAt,
                    isEdited: newShare.post.isEdited,
                    
                }
            }
        }

        res.status(200).json({ message: "Post shared successfully.", share: newFormattedShare });
    } catch (error) {
    console.error("Error sharing post:", error);
    res.status(500).json({ error: "An error occurred while sharing the post." });
  }
};

export const getSharesByUser = async (req, res) => {
    const authorId = req.user.id;

    try {
        const shares = await prisma.share.findMany({
            where: { authorId },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                },
                post: {
                    include: { author: {
                        select: {
                            id: true,
                            name: true,
                            image: true
                        }
                    } }
                }
            }
        });

        const newFormattedShare = shares.map(share => ({
            id: share.id,
            title: share.title,
            shareUser: {
                id: share.author.id,
                name: share.author.name,
                image: share.author.image
            },
            createdAt: share.createdAt,
            updatedAt: share.updatedAt,
            post: {
                id: share.post.id,
                title: share.post.title,
                content: share.post.content,
                image: share.post.image,
                author: {
                    id: share.post.author.id,
                    name: share.post.author.name,
                    image: share.post.author.image
                },
                createdAt: share.post.CreatedAt,
                updatedAt: share.post.UpdatedAt,
                isEdited: share.post.isEdited
            }
        }));

        res.status(200).json({ newFormattedShare });
    } catch (error) {
        console.error("Error fetching shares:", error);
        res.status(500).json({ error: "An error occurred while fetching shared posts." });
    }
};

export const getShare = async (req, res) => {
    const { id } = req.params;

    try {
        const share = await prisma.share.findUnique({
            where: { id: Number(id) },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                },
                post: {
                    include: { 
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

        if (!share) {
            return res.status(404).json({ error: "Share not found." });
        }

        const newFormattedShare = {
            id: share.id,
            title: share.title,
            shareUser: {
                id: share.author.id,
                name: share.author.name,
                image: share.author.image
            },
            createdAt: share.createdAt,
            updatedAt: share.updatedAt,
            post: {
                id: share.post.id,
                title: share.post.title,
                content: share.post.content,
                image: share.post.image,
                author: {
                    id: share.post.author.id,
                    name: share.post.author.name,
                    image: share.post.author.image
                },
                createdAt: share.post.CreatedAt,
                updatedAt: share.post.UpdatedAt,
                isEdited: share.post.isEdited
            }
        };

        res.status(200).json({ share: newFormattedShare });
    } catch (error) {
        console.error("Error fetching share:", error);
        res.status(500).json({ error: "An error occurred while fetching the share." });
    }
};

export const updateShare = async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;
    const authorId = req.user.id;

    try {
        const share = await prisma.share.findUnique({
            where: { id: Number(id) },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                },
                post: {
                    include: { 
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

        if (!share) {
            return res.status(404).json({ error: "Share not found." });
        }

        if (share.authorId !== authorId) {
            return res.status(403).json({ error: "You are not authorized to edit this share." });
        }

        const updatedShare = await prisma.share.update({
            where: { id: Number(id) },
            data: { title },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                },
                post: {
                    include: { author: {
                        select: {
                            id: true,
                            name: true,
                            image: true
                        }
                    } }
                }
            }
        });

        const newFormattedShare = {
            id: updatedShare.id,
            title: updatedShare.title,
            shareUser: {
                id: updatedShare.author.id,
                name: updatedShare.author.name,
                image: updatedShare.author.image
            },
            createdAt: updatedShare.createdAt,
            updatedAt: updatedShare.updatedAt,
            post: {
                id: updatedShare.post.id,
                title: updatedShare.post.title,
                content: updatedShare.post.content,
                image: updatedShare.post.image,
                author: {
                    id: updatedShare.post.author.id,
                    name: updatedShare.post.author.name,
                    image: updatedShare.post.author.image
                },
                createdAt: updatedShare.post.CreatedAt,
                updatedAt: updatedShare.post.UpdatedAt,
                isEdited: updatedShare.post.isEdited
            }
        }

        res.status(200).json({ message: "Share updated successfully.", share: newFormattedShare });
    } catch (error) {
        console.error("Error updating share:", error);
        res.status(500).json({ error: "An error occurred while updating the share." });
    }
};

export const deleteShare = async (req, res) => {
    const { id } = req.params;
    const authorId = req.user.id;

    try {
        const share = await prisma.share.findUnique({
            where: { id: Number(id) },
        });

        if (!share) {
            return res.status(404).json({ error: "Share not found." });
        }

        if (share.authorId !== authorId) {
            return res.status(403).json({ error: "You are not authorized to delete this share." });
        }

        await prisma.share.delete({
            where: { id: Number(id) }
        });

        res.status(200).json({ message: "Share deleted successfully." });
    } catch (error) {
        console.error("Error deleting share:", error);
        res.status(500).json({ error: "An error occurred while deleting the share." });
    }
};

