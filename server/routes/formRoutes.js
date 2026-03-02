import express from 'express';
import Form from '../models/Form.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';
import mongoose from "mongoose";


const router = express.Router();

// Get all forms
router.get('/', async (req, res) => {
  try {
    const {
      isActive,
      search,
      startDate,
      endDate,
      deleted,
      page = 1,
      limit = 10,
      trash = "yes"
    } = req.query;

    const query = {};
    query.inTrash = trash;

    // Handle deleted forms
    if (deleted === 'true') {
      query.isDeleted = true;
    } else {
      query.isDeleted = { $ne: true };
    }

    // isActive filter
    if (isActive !== undefined && isActive !== 'undefined' && isActive !== '') {
      query.isActive = isActive === 'true';
    }

    // Date filter
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Search filter
    if (search) {
      const or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
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

      if (mongoose.Types.ObjectId.isValid(search)) {
        or.push({ _id: new mongoose.Types.ObjectId(search) });
      }

      query.$or = or;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const forms = await Form.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Form.countDocuments(query);

    res.json({
      success: true,
      data: forms,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});


// Get single form by ID
router.get('/:id', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ success: false, message: 'Form not found' });
    }

    // Allow viewing deleted forms (for restore functionality)
    // But you can add a check here if needed: if (form.isDeleted && !req.query.includeDeleted) { ... }

    res.json({ success: true, data: form });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new form
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, title, paragraph, buttonColor, fields, isActive } = req.body;

    if (!name || !fields || fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Name and at least one field are required'
      });
    }

    const newForm = new Form({
      name,
      description,
      title,
      paragraph,
      buttonColor: buttonColor || '#3b82f6',
      fields,
      isActive: isActive !== undefined ? isActive : true,
      isDeleted: false // Explicitly set to false
    });

    const savedForm = await newForm.save();

    // 👇 CREATE NOTIFICATION HERE
    await Notification.create({
      type: "form",
      action: "created",
      refId: savedForm._id,
      actorId: req.user._id,   // who did it
      title: "New Form",
      message: "Form created",
      meta: {
        formName: savedForm.name
      },
      readBy: []
    });

    res.status(201).json({ success: true, data: savedForm });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update form
router.put('/:id', async (req, res) => {
  try {
    const { name, description, title, paragraph, buttonColor, fields, isActive, inTrash } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (title !== undefined) updateData.title = title;
    if (paragraph !== undefined) updateData.paragraph = paragraph;
    if (buttonColor !== undefined) updateData.buttonColor = buttonColor;
    if (fields) updateData.fields = fields;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (inTrash !== undefined) updateData.inTrash = inTrash;

    const updatedForm = await Form.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedForm) {
      return res.status(404).json({ success: false, message: 'Form not found' });
    }

    res.json({ success: true, data: updatedForm });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete form (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ success: false, message: 'Form not found' });
    }

    // Soft delete
    form.isDeleted = true;
    form.deletedAt = new Date();
    form.isActive = false;
    await form.save();

    res.json({ success: true, message: 'Form deleted successfully', data: form });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Restore deleted form
router.post('/:id/restore', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ success: false, message: 'Form not found' });
    }

    if (!form.isDeleted) {
      return res.status(400).json({ success: false, message: 'Form is not deleted' });
    }

    // Restore form
    form.isDeleted = false;
    form.deletedAt = null;
    form.isActive = true;
    await form.save();

    res.json({ success: true, message: 'Form restored successfully', data: form });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Permanently delete form
router.delete('/:id/permanent', async (req, res) => {
  try {
    const deletedForm = await Form.findByIdAndDelete(req.params.id);

    if (!deletedForm) {
      return res.status(404).json({ success: false, message: 'Form not found' });
    }

    res.json({ success: true, message: 'Form permanently deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Clear all forms (for development/testing - use with caution!)
router.delete('/clear/all', async (req, res) => {
  try {
    const result = await Form.deleteMany({});

    res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} form(s)`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
