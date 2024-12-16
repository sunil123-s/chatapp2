import express from "express"
import prisma from '../prisma/index.js';
import { protectedRoute } from "../middleware/auth.js";

const router = express.Router()

router.post('/creatChat',protectedRoute,async(req, res ) => {
    try {
        const userId = req.user.id;
        const { friendsId } = req.body;

        if (!userId) {
          return res.status(400).json({ error: "User ID is required" });
        }   
        if (!friendsId) {
          return res.status(400).json({ error: "Friend ID is required" });
        }
        
        const existingChat = await prisma.chat.findFirst({
          where: {
            isGroupChat: false,
            AND :[
              {users:{some:{id: userId}}},
              {users:{some:{id: friendsId}}}
            ]
          },
          include: {
            users: true,
            latestMessage: true,
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              include: {
                sender: true,
              },
            },
          },
        });

        if(!existingChat){
         const newChat = await prisma.chat.create({
           data: {
             isGroupChat: false,
             users: {
               connect: [{ id: userId }, { id: friendsId }],
             },
           },
         });

         const newlyChat = await prisma.chat.findUnique({
           where: { id: newChat.id },
           include: {
             users: true,
             latestMessage: true,
             messages: {
               orderBy: { createdAt: "desc" },
               take: 1,
               include: {
                 sender: true,
               },
             },
           },
         });
           return res.status(201).json(newlyChat);
        }
        return res.status(201).json(existingChat);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
})

router.get('/allmessages',protectedRoute,async(req, res ) => {
    try {
        const userId = req.user.id;
          if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
          }
        
        const allChats = await prisma.chat.findMany({
          where: {
            users: {
              some: { id: userId },
            },
          },
          include: {
            users: true,
            groupAdmin: true,
            latestMessage: {
              include: {
                sender: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });
        res.status(200).json(allChats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
})

router.post('/creategroup',protectedRoute,async(req, res ) => {
    try {
        let {friendsId,groupName} = req.body;
        const userId = req.user.id;

        if(!friendsId || !groupName ) {
            return res.status(400).json({error:"pls fill required field"})
        }
        if(friendsId.length < 2){  return res
          .status(400)
          .json({ error: "A group chat requires at least 2 users" });}

          if (typeof friendsId === "string") {
            friendsId = JSON.parse(friendsId);
          }
         
          if(!friendsId.includes(userId)){
            friendsId.push(userId)
          }


          const groupChat = await prisma.chat.create({
            data: {
              chatName: groupName,
              isGroupChat: true,
              users: {
                connect: friendsId.map((id) => ({ id })),
              },
              groupAdmin: {
                connect: { id: userId },
              },
            },
            include: {
              users: true,
              groupAdmin: true,
            },
          });

           await prisma.user.update({
            where:{
              id:userId
            },
            data:{
              isAdmin:true
            }
           })
          res.status(200).json({data:groupChat})
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
})

router.put('/rename',protectedRoute,async(req, res ) => {
    try {
        const { chatName, id } = req.body;
        
        if (!chatName || !id) {
          return res.status(401).json({ errro: "pls provied both field" });
        }

        const newGroupName = await prisma.chat.update({
          where: {
            id
          },
          data: {
            chatName,
          },
          include: {
            groupAdmin: true,
            users: true,
          },
        });

        res.status(200).json(newGroupName)
    } catch (error) {
          console.error(error);
          res.status(500).json({ error: "Something went wrong" });
    }
    
})

router.put("/groupadd", protectedRoute, async (req, res) => {
  try {
    const { id, newusersId } = req.body;

    const addUser = await prisma.chat.update({
      where: {
        id
      },
      data: {
        users: {
          connect: {
            id: newusersId,
          },
        },
      },
      include: {
        users: true,
        groupAdmin: true,
      },
    });

    res.status(200).json(addUser)
  } catch (error) {
     console.error(error);
     res.status(500).json({ error: "Something went wrong" });
  }
});

router.put("/groupremove", protectedRoute, async (req, res) => {
    try {
        const {id,removeUserid} = req.body
        console.log(id)
        console.log("remove:",removeUserid)
            if (!removeUserid) {
                return res.status(400).json({ error: "No user ID provided to remove" });
             }
        
        const removeUser = await prisma.chat.update({
          where: {
            id,
          },
          data: {
            users: {
              disconnect: {
                id: removeUserid,
              },
            },
          },
          include: {
            users: true,
            groupAdmin: true,
          },
        });
        
        res.status(200).json(removeUser);
    } catch (error) {
         console.error(error);
         res.status(500).json({ error: "Something went wrong" });
    }
});

export default router
