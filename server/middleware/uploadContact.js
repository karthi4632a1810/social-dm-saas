import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            const contactId = req.params.id;

            if (!contactId) {
                return cb(new Error("No contact card ID"));
            }

            const uploadPath = path.join(
                process.cwd(),
                "uploads",
                "contact",
                contactId
            );

            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            }

            cb(null, uploadPath);
        } catch (err) {
            cb(err);
        }
    },

    filename: (req, file, cb) => {
        cb(null, "avatar.jpg");
    }
});

export const uploadContactAvatar = multer({
    storage,
    limits: { fileSize: 800 * 1024 }
});