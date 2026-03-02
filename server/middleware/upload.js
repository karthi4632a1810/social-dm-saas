import multer from "multer";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            if (!token) return cb(new Error("No token"));

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || "secret"
            );

            const userFolder = path.join(
                process.cwd(),
                "uploads",
                "users",
                decoded.userId
            );

            // Create folder if not exists
            if (!fs.existsSync(userFolder)) {
                fs.mkdirSync(userFolder, { recursive: true });
            }

            cb(null, userFolder);
        } catch (err) {
            cb(err);
        }
    },

    filename: (req, file, cb) => {
        cb(null, "avatar.jpg");
        // always same name → overwrite
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only images allowed"), false);
    }
};

export const uploadAvatar = multer({
    storage,
    fileFilter,
    limits: { fileSize: 800 * 1024 }
});