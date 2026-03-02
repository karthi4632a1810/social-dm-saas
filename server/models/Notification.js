import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        // What kind of thing happened
        type: {
            type: String,
            enum: ["lead", "link", "form", "contact"],
            required: true
        },

        // What action happened
        action: {
            type: String,
            enum: ["created", "updated", "deleted"],
            default: "created"
        },

        // Reference to the related document (Lead or Link ID)
        refId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },

        // Who did this action (user id)
        actorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        // Extra info for public leads etc.
        meta: {
            customerName: { type: String, trim: true },
            source: { type: String, trim: true },
            formName: { type: String, trim: true },
            contactName: { type: String, trim: true },
            linkName: { type: String, trim: true }
        },

        // Who has read this notification
        // Store userIds here
        readBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],

        // Optional title for UI
        title: {
            type: String,
            trim: true
        },

        // Optional message for UI
        message: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true // adds createdAt & updatedAt automatically
    }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;