import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getNotification = async (req, res) => {
    try {
        const authorId = req.user.id;
        const notifications = await prisma.notification.findMany({
            where: { authorId },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
                post: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json({notifications});
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const authorId = req.user.id;

        const notification = await prisma.notification.updateMany({
            where: {
                id: parseInt(id),
                authorId,
            },
            data: {
                isRead: true,
            },
        });

        if (notification.count === 0) {
            return res.status(404).json({ error: "Notification not found or not owned by the user" });
        }

        res.json({ message: "Notification marked as read" });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ error: "Failed to mark notification as read" });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const authorId = req.user.id;

        const notification = await prisma.notification.deleteMany({
            where: {
                id: parseInt(id),
                authorId,
            },
        });

        if (notification.count === 0) {
            return res.status(404).json({ error: "Notification not found or not owned by the user" });
        }

        res.json({ message: "Notification deleted successfully" });
    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({ error: "Failed to delete notification" });
    }
};
