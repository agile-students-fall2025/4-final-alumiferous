import {v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME_PROFILE,
    api_key: process.env.CLOUDINARY_API_KEY_PROFILE,
    api_secret: process.env.CLOUDINARY_API_SECRET_PROFILE
});

export default cloudinary;