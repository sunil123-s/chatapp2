import express from "express"
import prisma from "../prisma/index.js";
import { protectedRoute } from "../middleware/auth.js";

const router = express.Router()

router.get('/allUser',protectedRoute,async(req,res) => {
    try {
        const userId = req.user.id;
        if(!userId){return res.status(400).json({error:"unAutherzaie"})}
        
        const allChats = await prisma.user.findMany({
            where:{
                id:{
                    not:userId
                }
            },
            select:{
                id:true,
                fullName:true,
                profileImg:true
            }   
        })
         res.status(200).json(allChats);
    } catch (error) {
         console.log("error:", error.message);
         res.status(400).json({ error: "internal error " });
    }
})

router.get("/searchUser",protectedRoute, async (req, res) => {
  try {
    const search = req.query.search;
    const userName = req.user.userName.toLowerCase()

    if (!search) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const searchUser = await prisma.user.findMany({
      where: {
        userName: {
          not: userName,
        },
        userName: {
          contains: search,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        userName: true,
        fullName: true,
        profileImg: true,
      },
    });

    res.status(200).json(searchUser);
  } catch (error) {}
});


export default router