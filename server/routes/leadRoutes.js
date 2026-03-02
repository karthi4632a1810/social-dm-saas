import express from 'express';
import Lead from '../models/Lead.js';
import Link from '../models/Link.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';
import mongoose from "mongoose";


const router = express.Router();

// Get all leads with optional filters
router.get('/', async (req, res) => {
  try {
    const { status, platform, startDate, endDate, search, page = 1, limit = 10 } = req.query;

    const query = {};

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
        or.push({ _id: search });
      }

      query.$or = or;
    }


    const skip = (parseInt(page) - 1) * parseInt(limit);

    const leads = await Lead.find(query)
      .populate('linkId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Lead.countDocuments(query);

    res.json({
      success: true,
      data: leads,
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

// Get single lead by ID
router.get('/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('linkId');

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    res.json({ success: true, data: lead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new lead
router.post('/', protect, async (req, res) => {
  try {
    const { name, number, link, linkId, email, platform, location, status } = req.body;

    const newLead = new Lead({
      name,
      number,
      link,
      linkId,
      email,
      platform,
      location,
      status: status || 'pending'
    });

    const savedLead = await newLead.save();

    // 👇 CREATE NOTIFICATION HERE
    await Notification.create({
      type: "lead",
      action: "created",
      refId: savedLead._id,
      actorId: req.user._id,   // who created it
      title: "New Lead",
      message: "Lead created",
      readBy: []
    });

    res.status(201).json({ success: true, data: savedLead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Public endpoint to create lead (for form submissions)
router.post('/public', async (req, res) => {
  try {
    const { name, number, link, linkId, email, platform, location, status } = req.body;

    // Validate required fields
    if (!name && !email && !number) {
      return res.status(400).json({
        success: false,
        message: 'At least one of name, email, or number is required'
      });
    }

    const newLead = new Lead({
      name: name || 'Anonymous',
      number: number || '0000000000',
      link: link || '',
      linkId: linkId || null,
      email: email || 'noemail@example.com',
      platform: platform || 'Website',
      location: location || '',
      status: status || 'pending'
    });

    const savedLead = await newLead.save();

    // 👇 Attach lead to link daily stats
    if (linkId) {
      const linkDoc = await Link.findById(linkId);
      if (linkDoc) {
        const today = new Date().toISOString().slice(0, 10);

        let dayStat = linkDoc.stats.find(s => s.date === today);
        if (!dayStat) {
          dayStat = {
            date: today,
            pageViews: 0,
            clicks: 0,
            uniqueVisitors: 0,
            leads: []
          };
          linkDoc.stats.push(dayStat);
        }

        // prevent duplicates
        if (!dayStat.leads.includes(savedLead._id)) {
          dayStat.leads.push(savedLead._id);
        }

        // make sure mongoose saves nested array
        linkDoc.markModified("stats");
        await linkDoc.save();
      }
    }

    // 👇 CREATE NOTIFICATION HERE (public form, no user)
    await Notification.create({
      type: "lead",
      action: "created",
      refId: savedLead._id,
      actorId: null,           // system / public
      title: "New Lead",
      message: "Lead submitted",
      meta: {
        customerName: name || "Someone",
        source: platform || "Website"
      },
      readBy: []
    });

    res.status(201).json({ success: true, data: savedLead });
  } catch (error) {
    console.error("PUBLIC LEAD ERROR:", error); // 👈 ADD THIS
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update lead
router.put('/:id', async (req, res) => {
  try {
    const { name, number, link, linkId, email, platform, location, status } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (number) updateData.number = number;
    if (link) updateData.link = link;
    if (linkId) updateData.linkId = linkId;
    if (email) updateData.email = email;
    if (platform) updateData.platform = platform;
    if (location) updateData.location = location;
    if (status) updateData.status = status;

    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('linkId');

    if (!updatedLead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    res.json({ success: true, data: updatedLead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete lead
router.delete('/:id', async (req, res) => {
  try {
    const deletedLead = await Lead.findByIdAndDelete(req.params.id);

    if (!deletedLead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk delete leads
router.post('/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No lead IDs provided'
      });
    }

    await Lead.deleteMany({ _id: { $in: ids } });

    res.json({
      success: true,
      message: `${ids.length} leads deleted successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


export default router;
