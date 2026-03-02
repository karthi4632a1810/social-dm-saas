import express from 'express';
import Link from '../models/Link.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';
import mongoose from "mongoose";

const router = express.Router();

const updateDailyStats = async (linkId, type) => {
    const link = await Link.findById(linkId);
    if (!link) return;

    const today = new Date().toISOString().slice(0, 10);

    let dayStat = link.stats.find(s => s.date === today);
    if (!dayStat) {
        dayStat = { date: today, pageViews: 0, clicks: 0, uniqueVisitors: 0 };
        link.stats.push(dayStat);
    }

    if (type === "view") dayStat.pageViews += 1;
    if (type === "click") dayStat.clicks += 1;
    if (type === "visitor") dayStat.uniqueVisitors += 1;

    await link.save();
};

// Public endpoint to get link by slug and increment click (for redirects)
router.get('/public/slug/:slug', async (req, res) => {
    try {
        const link = await Link.findOne({ slug: req.params.slug })
            .populate('formId', 'name description fields title paragraph buttonColor');

        if (!link) {
            return res.status(404).json({ success: false, message: 'Link not found' });
        }

        const today = new Date().toISOString().slice(0, 10);

        let dayStat = link.stats.find(s => s.date === today);

        if (!dayStat) {
            // ✅ first click: create with clicks = 1
            dayStat = { date: today, pageViews: 0, clicks: 1, uniqueVisitors: 0 };
            link.stats.push(dayStat);
        } else {
            // ✅ next clicks: just increment
            dayStat.clicks += 1;
        }

        // ✅ always increment total clicks
        link.clicks += 1;

        // (optional but safe)
        link.markModified("stats");

        await link.save();

        res.json({ success: true, data: link });
    } catch (error) {
        console.error("PUBLIC CLICK ERROR:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all links with optional filters
router.get('/', async (req, res) => {
    try {
        const { status, platform, startDate, endDate, search, page = 1, limit = 10, trash = "yes" } = req.query;

        const query = {};
        query.inTrash = trash;
        if (status && status !== 'all') {
            query.status = status;
        }

        if (platform && platform !== 'all') {
            query.platform = platform;
        }

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (search) {
            const or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { number: { $regex: search, $options: "i" } },
                { link: { $regex: search, $options: "i" } },

                // Partial match on _id (string version)
                {
                    $expr: {
                        $regexMatch: {
                            input: { $toString: "$_id" },
                            regex: search,
                            options: "i"
                        }
                    }
                }
            ];

            // Exact match if it's a valid ObjectId
            if (mongoose.Types.ObjectId.isValid(search)) {
                or.push({ _id: new mongoose.Types.ObjectId(search) });
            }

            query.$or = or;
        }
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const links = await Link.find(query)
            .populate('formId', 'name description fields')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Link.countDocuments(query);

        res.json({
            success: true,
            data: links,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


// Get all links dat by date wise  ✅ PUT THIS FIRST
router.get('/all/by-date', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const pipeline = [
            { $unwind: "$stats" }
        ];

        if (startDate && endDate) {
            const start = new Date(startDate).toISOString().slice(0, 10);
            const end = new Date(endDate).toISOString().slice(0, 10);

            pipeline.push({
                $match: {
                    "stats.date": { $gte: start, $lte: end }
                }
            });
        }

        pipeline.push(
            {
                $group: {
                    _id: "$stats.date",
                    clicks: { $sum: "$stats.clicks" },
                    pageViews: { $sum: "$stats.pageViews" },
                    uniqueVisitors: { $sum: "$stats.uniqueVisitors" },
                    leads: {
                        $sum: { $size: { $ifNull: ["$stats.leads", []] } }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    clicks: 1,
                    pageViews: 1,
                    uniqueVisitors: 1,
                    leads: 1
                }
            },
            { $sort: { date: 1 } }
        );

        const result = await Link.aggregate(pipeline);

        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get single link by ID  ✅ PUT THIS AFTER
router.get('/:id', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const link = await Link.findById(req.params.id)
            .populate('formId', 'name description fields');

        if (!link) {
            return res.status(404).json({ success: false, message: 'Link not found' });
        }

        let stats = link.stats || [];

        if (startDate && endDate) {
            const start = new Date(startDate).toISOString().slice(0, 10);
            const end = new Date(endDate).toISOString().slice(0, 10);

            stats = stats.filter(s => s.date >= start && s.date <= end);
        }

        res.json({
            success: true,
            data: {
                ...link.toObject(),
                stats
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create new link
router.post('/', protect, async (req, res) => {
    try {
        const { link_name, slug, link, platform, status, destinationType, formId, whatsappNumber, whatsappMessage } = req.body;

        // Check if slug already exists
        const existingLink = await Link.findOne({ slug });
        if (existingLink) {
            return res.status(400).json({ success: false, message: 'Slug already exists' });
        }

        // Validate based on destination type
        if (destinationType === 'url' && !link) {
            return res.status(400).json({ success: false, message: 'URL is required for URL destination type' });
        }
        if (destinationType === 'form' && !formId) {
            return res.status(400).json({ success: false, message: 'Form ID is required for form destination type' });
        }
        if (destinationType === 'whatsapp' && (!whatsappNumber || !whatsappMessage)) {
            return res.status(400).json({ success: false, message: 'WhatsApp number and message are required for WhatsApp destination type' });
        }

        const newLink = new Link({
            link_name,
            slug,
            link: destinationType === 'url' ? link : undefined,
            formId: destinationType === 'form' ? formId : undefined,
            whatsappNumber: destinationType === 'whatsapp' ? whatsappNumber : undefined,
            whatsappMessage: destinationType === 'whatsapp' ? whatsappMessage : undefined,
            destinationType: destinationType || 'url',
            platform,
            status: status || 'active',
            clicks: 0
        });

        const savedLink = await newLink.save();

        // 👇 CREATE NOTIFICATION HERE
        await Notification.create({
            type: "link",
            action: "created",
            refId: savedLink._id,
            actorId: req.user._id,   // who did it
            title: "New Link",
            message: "Link created",
            meta: {
                source: savedLink.platform,
                linkName: savedLink.link_name
            },
            readBy: []
        });

        res.status(201).json({ success: true, data: savedLink });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// // Update link
router.put('/:id', async (req, res) => {
    try {
        const { link_name, slug, link, platform, status, inTrash, clicks, destinationType, formId, whatsappNumber, whatsappMessage } = req.body;

        const updateData = {};
        if (link_name) updateData.link_name = link_name;
        if (slug) updateData.slug = slug;
        if (platform) updateData.platform = platform;
        if (status) updateData.status = status;
        if (inTrash) updateData.inTrash = inTrash;
        if (clicks !== undefined) updateData.clicks = clicks;
        if (destinationType) updateData.destinationType = destinationType;

        // Update destination based on type
        if (destinationType === 'url') {
            updateData.link = link;
            updateData.formId = undefined;
            updateData.whatsappNumber = undefined;
            updateData.whatsappMessage = undefined;
        } else if (destinationType === 'form') {
            updateData.formId = formId;
            updateData.link = undefined;
            updateData.whatsappNumber = undefined;
            updateData.whatsappMessage = undefined;
        } else if (destinationType === 'whatsapp') {
            updateData.whatsappNumber = whatsappNumber;
            updateData.whatsappMessage = whatsappMessage;
            updateData.link = undefined;
            updateData.formId = undefined;
        }

        // Check if slug is being updated and if it already exists
        if (slug) {
            const existingLink = await Link.findOne({ slug, _id: { $ne: req.params.id } });
            if (existingLink) {
                return res.status(400).json({ success: false, message: 'Slug already exists' });
            }
        }

        const updatedLink = await Link.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedLink) {
            return res.status(404).json({ success: false, message: 'Link not found' });
        }

        res.json({ success: true, data: updatedLink });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// count page views
router.post("/:id/view", async (req, res) => {
    try {
        const link = await Link.findById(req.params.id);
        if (!link) return res.status(404).json({ success: false });

        const today = new Date().toISOString().slice(0, 10);

        let dayStat = link.stats.find(s => s.date === today);
        if (!dayStat) {
            dayStat = { date: today, pageViews: 0, clicks: 0, uniqueVisitors: 0 };
            link.stats.push(dayStat);
        }

        // increment both
        link.pageViews += 1;
        dayStat.pageViews += 1;

        await link.save();

        res.json({ success: true });
    } catch (err) {
        console.error("PAGE VIEW COUNT ERROR:", err);
        res.status(500).json({ success: false });
    }
});


// count visitors
router.post("/:id/visit", async (req, res) => {
    try {
        const { visitorId } = req.body;

        if (!visitorId) {
            return res.status(400).json({ success: false, message: "No visitorId" });
        }

        const link = await Link.findById(req.params.id);
        if (!link) {
            return res.status(404).json({ success: false, message: "Link not found" });
        }

        // If this visitor is new, count them
        if (!link.visitors.includes(visitorId)) {
            link.visitors.push(visitorId);
            link.uniqueVisitors += 1;
            await link.save();

            // update daily stats ONLY when new visitor
            await updateDailyStats(req.params.id, "visitor");
        }

        res.json({ success: true, uniqueVisitors: link.uniqueVisitors });
    } catch (err) {
        console.error("VISITOR COUNT ERROR:", err);
        res.status(500).json({ success: false });
    }
});

// Delete link
router.delete('/:id', async (req, res) => {
    try {
        const deletedLink = await Link.findByIdAndDelete(req.params.id);

        if (!deletedLink) {
            return res.status(404).json({ success: false, message: 'Link not found' });
        }

        res.json({ success: true, message: 'Link deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Increment click count
router.post('/:id/click', async (req, res) => {
    try {
        const link = await Link.findById(req.params.id);
        if (!link) {
            return res.status(404).json({ success: false, message: 'Link not found' });
        }

        const today = new Date().toISOString().slice(0, 10);

        let dayStat = link.stats.find(s => s.date === today);
        if (!dayStat) {
            dayStat = { date: today, pageViews: 0, clicks: 0, uniqueVisitors: 0 };
            link.stats.push(dayStat);
        }

        // increment both
        link.clicks += 1;
        dayStat.clicks += 1;

        await link.save();

        res.json({ success: true, data: link });
    } catch (error) {
        console.error("CLICK COUNT ERROR:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get link by slug (for redirect purposes) - Protected
router.get('/slug/:slug', async (req, res) => {
    try {
        const link = await Link.findOne({ slug: req.params.slug }).populate('formId', 'name description fields title paragraph buttonColor');

        if (!link) {
            return res.status(404).json({ success: false, message: 'Link not found' });
        }

        res.json({ success: true, data: link });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


export default router;
