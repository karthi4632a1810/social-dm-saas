import express from "express";
import ContactCard from "../models/ContactCard.js";
import { protect } from "../middleware/auth.js";
import Notification from '../models/Notification.js';
import mongoose from "mongoose";
import { uploadContactAvatar } from "../middleware/uploadContact.js";
import fs from "fs";
import path from "path";

const router = express.Router();

// Get all contact cards
router.get("/", async (req, res) => {
    try {
        const {
            isActive,
            search,
            startDate,
            endDate,
            page = 1,
            limit = 10,
            trash = "yes"
        } = req.query;

        const query = {};
        query.inTrash = trash; // "yes" or "no"

        if (isActive !== undefined && isActive !== "") {
            query.isActive = isActive === "true";
        }

        // Date filter (flexible)
        if (startDate || endDate) {
            query.createdAt = {};

            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }

            if (endDate) {
                query.createdAt.$lte = new Date(endDate);
            }
        }

        if (search) {
            const or = [
                { fullName: { $regex: search, $options: "i" } },
                { role: { $regex: search, $options: "i" } },
                { content: { $regex: search, $options: "i" } },
                {
                    $expr: {
                        $regexMatch: {
                            input: { $toString: "$_id" },
                            regex: search,
                            options: "i",
                        },
                    },
                },
            ];

            if (mongoose.Types.ObjectId.isValid(search)) {
                or.push({ _id: new mongoose.Types.ObjectId(search) });
            }

            query.$or = or;
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const cards = await ContactCard.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await ContactCard.countDocuments(query);

        res.json({
            success: true,
            data: cards,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error("Error fetching contact cards:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});
// Get single contact card
router.get("/:id", async (req, res) => {
    try {
        const card = await ContactCard.findById(req.params.id);

        if (!card) {
            return res.status(404).json({ success: false, message: "Contact card not found" });
        }

        res.json({ success: true, data: card });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create contact card
router.post("/", protect, async (req, res) => {
    try {
        const { fullName, role, content, number, image, platforms, isActive } = req.body;

        if (!fullName || !role || !content) {
            return res.status(400).json({
                success: false,
                message: "fullName, role and content are required",
            });
        }

        const newCard = new ContactCard({
            fullName,
            role,
            content,
            number,
            image,
            platforms: platforms || [],
            isActive: isActive !== undefined ? isActive : true,
            inTrash: "no",
        });

        const savedCard = await newCard.save();

        // 👇 CREATE NOTIFICATION HERE
        await Notification.create({
            type: "contact",
            action: "created",
            refId: savedCard._id,
            actorId: req.user._id,   // who did it
            title: "New contact",
            message: "contact card created",
            meta: {
                contactName: savedCard.fullName
            },
            readBy: []
        });

        res.status(201).json({ success: true, data: savedCard });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update contact card
router.put("/:id", async (req, res) => {
    try {
        const {
            fullName,
            role,
            content,
            number,
            image,
            platforms,
            isActive,
            inTrash,
        } = req.body;

        const updateData = {};
        if (fullName !== undefined) updateData.fullName = fullName;
        if (role !== undefined) updateData.role = role;
        if (content !== undefined) updateData.content = content;
        if (number !== undefined) updateData.number = number;
        if (image !== undefined) updateData.image = image;
        if (platforms !== undefined) updateData.platforms = platforms;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (inTrash !== undefined) updateData.inTrash = inTrash;

        const updatedCard = await ContactCard.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedCard) {
            return res.status(404).json({ success: false, message: "Contact card not found" });
        }

        res.json({ success: true, data: updatedCard });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Count page views for ContactCard
router.post("/:id/view", async (req, res) => {
    try {
        const card = await ContactCard.findById(req.params.id);
        if (!card) {
            return res.status(404).json({ success: false, message: "Card not found" });
        }

        const today = new Date().toISOString().slice(0, 10);

        let dayStat = card.stats.find(s => s.date === today);

        if (!dayStat) {
            dayStat = {
                date: today,
                pageViews: 0,
                uniqueVisitors: 0
            };
            card.stats.push(dayStat);
        }

        // increment totals
        card.pageViews += 1;
        dayStat.pageViews += 1;

        await card.save();

        res.json({ success: true });
    } catch (err) {
        console.error("CONTACT CARD PAGE VIEW ERROR:", err);
        res.status(500).json({ success: false });
    }
});

// Count unique visitors for ContactCard
router.post("/:id/visit", async (req, res) => {
    try {
        const { visitorId } = req.body;

        if (!visitorId) {
            return res.status(400).json({
                success: false,
                message: "No visitorId"
            });
        }

        const card = await ContactCard.findById(req.params.id);
        if (!card) {
            return res.status(404).json({
                success: false,
                message: "Card not found"
            });
        }

        const today = new Date().toISOString().slice(0, 10);

        let dayStat = card.stats.find(s => s.date === today);

        if (!dayStat) {
            dayStat = {
                date: today,
                pageViews: 0,
                uniqueVisitors: 0
            };
            card.stats.push(dayStat);
        }

        // If visitor is new
        if (!card.visitors.includes(visitorId)) {
            card.visitors.push(visitorId);
            card.uniqueVisitors += 1;
            dayStat.uniqueVisitors += 1;

            await card.save();
        }

        res.json({
            success: true,
            uniqueVisitors: card.uniqueVisitors
        });

    } catch (err) {
        console.error("CONTACT CARD VISITOR ERROR:", err);
        res.status(500).json({ success: false });
    }
});

router.post("/:id/track", async (req, res) => {
    try {
        const { visitorId } = req.body;

        const card = await ContactCard.findById(req.params.id);
        if (!card) {
            return res.status(404).json({ success: false, message: "Card not found" });
        }

        const today = new Date().toISOString().slice(0, 10);

        let statIndex = card.stats.findIndex(s => s.date === today);

        // If today stat doesn't exist, create it
        if (statIndex === -1) {
            card.stats.push({
                date: today,
                pageViews: 0,
                uniqueVisitors: 0
            });

            statIndex = card.stats.length - 1;
        }

        // Increment page views
        card.pageViews += 1;
        card.stats[statIndex].pageViews += 1;

        // Handle unique visitor
        if (visitorId && !card.visitors.includes(visitorId)) {
            card.visitors.push(visitorId);
            card.uniqueVisitors += 1;
            card.stats[statIndex].uniqueVisitors += 1;
        }

        card.markModified("stats"); // ensure nested array updates

        await card.save();

        res.json({ success: true });

    } catch (err) {
        console.error("TRACK ERROR:", err);
        res.status(500).json({ success: false });
    }
});

router.put("/:id/avatar", uploadContactAvatar.single("avatar"), async (req, res) => {
    try {
        const card = await ContactCard.findById(req.params.id);
        if (!card) {
            return res.status(404).json({ success: false, message: "Card not found" });
        }

        // REMOVE CASE
        if (!req.file) {
            const folder = path.join(
                process.cwd(),
                "uploads",
                "contact",
                req.params.id
            );

            if (fs.existsSync(folder)) {
                fs.rmSync(folder, { recursive: true, force: true });
            }

            card.image = null;
            await card.save();

            return res.json({
                success: true,
                message: "Image removed",
                data: { image: card.image }
            });
        }

        // UPLOAD CASE
        card.image = `/uploads/contact/${req.params.id}/avatar.jpg`;
        await card.save();

        res.json({
            success: true,
            message: "Image uploaded",
            data: { image: card.image }
        });

    } catch (err) {
        console.error("Contact avatar error:", err);
        res.status(500).json({ success: false });
    }
});

// Move to trash (soft delete)
router.delete("/:id", async (req, res) => {
    try {
        const card = await ContactCard.findById(req.params.id);

        if (!card) {
            return res.status(404).json({ success: false, message: "Contact card not found" });
        }

        card.inTrash = "yes";
        card.isActive = false;
        await card.save();

        res.json({ success: true, message: "Contact card moved to trash", data: card });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Restore from trash
router.post("/:id/restore", async (req, res) => {
    try {
        const card = await ContactCard.findById(req.params.id);

        if (!card) {
            return res.status(404).json({ success: false, message: "Contact card not found" });
        }

        if (card.inTrash !== "yes") {
            return res.status(400).json({ success: false, message: "Card is not in trash" });
        }

        card.inTrash = "no";
        card.isActive = true;
        await card.save();

        res.json({ success: true, message: "Contact card restored", data: card });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Permanently delete
router.delete("/:id/permanent", async (req, res) => {
    try {
        const deletedCard = await ContactCard.findByIdAndDelete(req.params.id);

        if (!deletedCard) {
            return res.status(404).json({ success: false, message: "Contact card not found" });
        }

        res.json({ success: true, message: "Contact card permanently deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;