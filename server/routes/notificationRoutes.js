import express from "express";
import Notification from "../models/Notification.js";

const router = express.Router();

// Get notifications for current user
// You must have auth middleware that sets req.user
router.get("/", async (req, res) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { page = 1, limit = 10 } = req.query;

        const query = {}; // you can add filters later if you want (type, read/unread, etc.)

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate("actorId", "name email role avatar");

        // Add isRead flag per user
        const result = notifications.map(n => {
            const obj = n.toObject();
            obj.isRead = obj.readBy.some(id => id.toString() === userId.toString());
            return obj;
        });

        const total = await Notification.countDocuments(query);

        res.json({
            success: true,
            data: result,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Mark a notification as read
router.put("/:id/read", async (req, res) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { id } = req.params;

        await Notification.updateOne(
            { _id: id },
            { $addToSet: { readBy: userId } } // prevents duplicates
        );

        res.json({ success: true, message: "Notification marked as read" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put("/read-all", async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        await Notification.updateMany(
            { readBy: { $ne: userId } },      // only those not read
            { $addToSet: { readBy: userId } }  // add user to readBy
        );

        res.json({ success: true, message: "All notifications marked as read" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
// Get unread count for current user
router.get("/unread/count", async (req, res) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const count = await Notification.countDocuments({
            readBy: { $ne: userId }
        });

        res.json({ success: true, count });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;