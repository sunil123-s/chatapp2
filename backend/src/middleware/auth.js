import jwt from "jsonwebtoken";
import prisma from "./../prisma/index.js";
import dotenv from "dotenv"
import { console } from "inspector";

dotenv.config();

const jwt_token = process.env.JWT_SECRET;
if(!jwt_token){
    console.log('jwt is not proivided')
}

export const protectedRoute = async(req,res,next) => {
    try {
        const getToken = req.headers.authorization;
        if (!getToken || !getToken.startsWith("Bearer")) {
          return res.status(401).json({ error: "Unauthorized" });
        }

        const token = getToken.split(" ")[1]

        const decoded = jwt.verify(token, jwt_token);
        if(!decoded) {return res.status(401).json({ error: "Unauthorized : invaild token" })};

        const user = await prisma.user.findUnique({
            where:{
                id:decoded.userId
            },
            select:{
                id:true,
                userName:true,
                fullName:true,
                profileImg:true
            }
        })
        if(!user){return res.status(404).json({ error: "User not found" });}

        req.user = user
        next()
    } catch (error) {
        console.error("Error in protectedRoute:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}