import { getImageUrl } from "./api";

export const buildNotificationUI = (n) => {
    const actorName = n.actorId?.name || "System";

    let title = "Notification";
    let message = n.message || "You have a new notification";
    let image = getImageUrl("/uploads/default-avatar.jpg");
    let link = "";

    const source = n.meta?.source?.toLowerCase();

    if (source) {
        image = `/notification/${source}.png`;
    }

    // FORM
    if (n.type === "form" && n.action === "created") {
        const src = n.actorId?.avatar;
        title = actorName;
        message = `${actorName} created a new form`;
        image = src ? getImageUrl(src) : getImageUrl("/uploads/default-avatar.jpg");
        link = `/manage-forms?search=${n.refId}`
    }

    // contact
    if (n.type === "contact" && n.action === "created") {
        const src = n.actorId?.avatar;
        title = actorName;
        message = `${actorName} created a new contact`;
        image = src ? getImageUrl(src) : getImageUrl("/uploads/default-avatar.jpg");
        link = `/manage-cards?search=${n.refId}`
    }

    // LEAD (public)
    if (n.type === "lead" && n.message === "Lead submitted") {
        const customer = n.meta?.customerName || "Someone";
        const src = n.meta?.source;

        title = customer;
        message = `${customer} submitted a lead from ${src}`;
        image = `/notification/${src.toLowerCase()}.png`;
        link = `/all-leads?search=${n.refId}`
    }

    // LINK
    if (n.type === "link" && n.action === "created") {
        const platform = n.meta?.source;
        const src = n.actorId?.avatar;

        title = actorName;
        message = `${actorName} created a new link for ${platform}`;
        image = src ? getImageUrl(src) : getImageUrl("/uploads/default-avatar.jpg");
        link = `/manage-short-links?search=${n.refId}`
    }

    return { title, message, image, link };
};