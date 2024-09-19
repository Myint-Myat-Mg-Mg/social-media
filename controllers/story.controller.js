import { uploadFiles } from '../middleware/uploadfile.js'
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createStory = async (req, res) => {
    try {
        const { content } = req.body;
        const authorId = req.user.id;
        let imagePath = null;

        if (req.files && req.files.image) {
            console.log("Received file:", req.files.image);
            imagePath = await uploadFiles(req.files.image);
            console.log("Uploaded image path:", imagePath);
        }

        const expirationTime = new Date();
        expirationTime.setHours(expirationTime.getHours() + 24);

        const newStory = await prisma.story.create({
            data: {
                authorId,
                content,
                image: imagePath,
                expiresAt: expirationTime,
            },
        });

        res.status(201).json(newStory);
    } catch (error) {
        console.error("Error creating story:", error);
        res.status(500).json({ error: "Error creating story." });
    }
};

export const getStories = async (req, res) => {
    try {
        const currentTime = new Date();
        const stories = await prisma.story.findMany({
            where: {
                expiresAt: {
                    gt: currentTime,  // Fetch stories that haven't expired
                },
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    },
                },
                views: {
                    select: {
                        viewer: {
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
                createdAt: 'desc'
            }
        });

        res.status(200).json(stories);
    } catch (error) {
        console.error("Error fetching stories:", error);
        res.status(500).json({ error: "Error fetching stories." });
    }
};

export const viewStory = async (req, res) => {
    const { storyId } = req.params;
    const viewerId = req.user.id;

    try {
        const story = await prisma.story.findUnique({
            where: { id: Number(storyId) },
            include: {
                views: true
            }
        });

        if (!story || story.expiresAt <= new Date()) {
            return res.status(404).json({ error: "Story not found or has expired." });
        }

        const hasViewed = story.views.some(view => view.viewerId === viewerId);

        if (!hasViewed) {
            await prisma.storyView.create({
                data: {
                    storyId: story.id,
                    viewerId,
                }
            });
        }

        res.status(200).json({ message: "Story viewed successfully" });
    } catch (error) {
        console.error("Error viewing story:", error);
        res.status(500).json({ error: "Error viewing story." });
    }
};

export const deleteStory = async (req, res) => {
    const { storyId } = req.params;
    const authorId = req.user.id;

    try {
        const story = await prisma.story.findUnique({
            where: { id: Number(storyId) },
            select: { authorId: true }
        });

        if (!story) {
            return res.status(404).json({ error: "Story not found" });
        }

        if (story.authorId !== authorId) {
            return res.status(403).json({ error: "You are not allowed to delete this story." });
        }
        
        await prisma.storyView.deleteMany({
            where: { storyId: Number(storyId) }
        });

        await prisma.story.delete({
            where: { id: Number(storyId) }
        });

        res.status(200).json({ message: "Story deleted successfully." });
    } catch (error) {
        console.error("Error deleting story:", error.message);
        res.status(500).json({ error: "Error deleting story. Please try again" });
    }
};




