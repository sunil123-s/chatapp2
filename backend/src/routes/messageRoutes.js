import express from "express"
import { protectedRoute } from "../middleware/auth.js"
import prisma from "../prisma/index.js";

const router = express.Router()

router.post("/send",protectedRoute,async(req,res) => {
    try {
        const { content, chatId } = req.body;
        const senderId = req.user.id;

         if (!content || !chatId) {
           console.log("Invalid data passed into request");
           return res.sendStatus(400);
         }

       const message = await prisma.message.create({
          data:{
            senderId,
            content,
            chatId
          },
          include:{
            sender:{
                select:{
                    id:true,
                    userName:true,
                    profileImg:true,
                }
            },
            chat:{
                include:{
                    users:{
                        select:{
                            id:true,
                            userName:true,
                            profileImg:true
                        }
                    }
                }
            }   
          }
       });

       await prisma.chat.update({
         where: { id: chatId },
         data: {
           latestMessage: {
             connect: { id: message.id },
           },
         },
       });

       
      res.status(200).json(message)
    } catch (error) {
        console.log(error)
         res.status(400).json(error.message)
    }
})

router.get('/:chatId',protectedRoute,async(req,res) => {
    try {
        const chatId = req.params.chatId;

        const messageById = await prisma.message.findMany({
          where: {
            chatId,
          },
          include: {
            sender: {
              select: {
                userName: true,
                profileImg: true,
              },
            },
            chat: {
              include:{
                users:{
                  select:{
                    id:true,
                    profileImg:true,
                    userName:true,
                  }
                }
              }
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        });
        res.status(200).json(messageById);
    } catch (error) {
         console.log(error);
         res.status(400).json(error.message);
    }
})


export default router 