import mongoose from "mongoose";

const socialPlatformSchema = new mongoose.Schema(
    {
        platform: {
            type: String,
            enum: [
                "Instagram",
                "Facebook",
                "Whatsapp",
                "Youtube",
                "Linkedin",
                "Reddit",
                "Telegram",
                "Threads",
                "TikTok",
                "TwitterX",
                "Website",
            ],
            required: true,
            trim: true,
        },
        url: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { _id: false }
);

const contactCardSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },

        role: {
            type: String,
            required: true,
            trim: true,
        },

        content: {
            type: String,
            required: true,
            trim: true,
        },

        number: {
            type: String,
            trim: true,
        },

        image: {
            type: String, // URL or file path
            trim: true,
        },

        platforms: {
            type: [socialPlatformSchema],
            default: [],
        },
        pageViews: {
            type: Number,
            default: 0
        },
        visitors: {
            type: [String], // store visitor IDs
            default: []
        },
        uniqueVisitors: {
            type: Number,
            default: 0
        },

        isActive: {
            type: Boolean,
            default: true,
        },
        inTrash: {
            type: String,
            enum: ['yes', 'no'],
            default: 'no'
        },
        stats: [
            {
                date: { type: String }, // "2026-02-23"
                pageViews: { type: Number, default: 0 },
                uniqueVisitors: { type: Number, default: 0 },
            }
        ],
    },
    {
        timestamps: true,
    }
);

const ContactCard = mongoose.model("ContactCard", contactCardSchema);

export default ContactCard;