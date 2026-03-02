import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);

const user = await User.create({
    name: "Admin",
    email: "admin@test.com",
    password: "123456",
    role: "admin",
    isActive: true
});

console.log("USER CREATED");
console.log("Email:", user.email);
console.log("Password: 123456");

process.exit();