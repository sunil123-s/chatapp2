import prisma from "./../prisma/index.js";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { upload } from "../middleware/multer.js";

const router = express.Router();

dotenv.config();
const jwt_token = process.env.JWT_SECRET;
if (!jwt_token) {
  console.log("jwt is not provided");
}

const storage = multer.memoryStorage();
const localupload = multer({ storage }).single("profileImg");

router.post("/signup", localupload, async (req, res) => {
  try {
    const { userName, fullName, password } = req.body;
    const profileImg = req.file;

    if (!userName || !password || !fullName) {
      return res.status(400).json({ error: "required field" });
    }

    const existingUser = await prisma.user.findUnique({ where: { userName } });

    if (existingUser) {
      return res.status(401).json({ error: "User already exists" });
    }

    let profileImgUrl = null;
    if (profileImg) {
      try {
        const uploadProfileImg = () => {
          return new Promise((resolve, reject) => {
            cloudinary.uploader
              .upload_stream(
                {
                  folder: "profiles",
                },
                (error, result) => {
                  if (error) {
                    console.error("Cloudinary upload error:", error);
                    reject(new Error("Error uploading profile image"));
                  } else {
                    resolve(result.secure_url); // Resolve with the URL
                  }
                }
              )
              .end(profileImg.buffer); // Pass the file buffer
          });
        };

        profileImgUrl = await uploadProfileImg();
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    }

    const hassedPasword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        userName,
        fullName,
        password: hassedPasword,
        profileImg: profileImgUrl,
      },
    });

    const token = jwt.sign({ userId: newUser.id }, jwt_token, {
      expiresIn: "7d",
    });

    res.status(201).json({
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        userName: newUser.userName,
        profileImg: newUser.profileImg || null,
        token: token,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ error: "internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { userName, password } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: {
        userName,
      },
    });

    if (!existingUser) {
      return res.status(401).json({ error: "user Not found" });
    }

    const isValidPassword = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isValidPassword) {
      return res.status(401).json({ error: "wrong password" });
    }

    const token = jwt.sign({ userId: existingUser.id }, jwt_token, {
      expiresIn: "7d",
    });

    res.status(201).json({
      user: {
        id: existingUser.id,
        userName: existingUser.userName,
        fullName: existingUser.fullName,
        profileImg: existingUser.profileImg,
        token: token,
      },
    });
  } catch (error) {
    console.error("Login error details:", {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

export default router;
