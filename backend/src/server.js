// import express from "express";
// import dotenv from "dotenv";
// import chatRoutes from "./routes/chatRoute.js";
// import authRoutes from "./routes/authRoutes.js";
// import userRoutes from "./routes/userRoutes.js";
// import messageRoutes from "./routes/messageRoutes.js";
// import path from "path";
// import { fileURLToPath } from "url";
// import { createServer } from "http";
// import { Server } from "socket.io";
// import cors from "cors"

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// dotenv.config();
// const PORT = process.env.PORT || 8000;
// const app = express();

// app.use((err, req, res, next) => {
//   console.error("Error:", err);
//   res.status(500).json({ error: err.message });
// });

// const corsOptions = {
//   origin: ["http://localhost:5173"], 
//   methods: ["GET", "POST", "PUT", "DELETE"], 
//   allowedHeaders: ["Content-Type", "Authorization"], 
// };

// app.use(cors(corsOptions));

// app.use(express.json());
// app.use("/uploads", express.static(path.join(__dirname, "./public/uploads")));
// app.use(express.urlencoded({ extended: true }));
// app.use("/api/auth", authRoutes);
// app.use("/api/chat", chatRoutes);
// app.use("/api/user", userRoutes);
// app.use("/api/message", messageRoutes);

// const __dirname1 = path.resolve();

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname1, "/frontend/dist")));
//   app.get("*", (req, res) => {
//     res.sendFile(path.resolve(__dirname1, "frontend", "dist", "index.html"));
//   });
// }

// const server = createServer(app);

// const BaseUrl =
//   process.env.NODE_ENV === "production"
//     ? "https://chat-app-qot2.vercel.app"
//     : "http://localhost:8000";

// const io = new Server(server, {
//   pingTimeout: 60000,
//   cors: {
//     origin: BaseUrl,
//     methods: ["GET", "POST"],
//   },
// });

// io.on("connection", (socket) => {
//   socket.on("setup", (userData) => {
//     if (!userData || !userData.id) {
//       return;
//     }

//     socket.userData = userData;
//     socket.join(userData.id);
//     socket.emit("connected"); // Add this line
//   });

//   socket.on("join chat", (room) => {
//     socket.join(room);
//   });

//   socket.on("new message", (newMessageReceived) => {
//     const chat = newMessageReceived.chat;

//     if (!chat.users) {
//       return;
//     }

//     chat.users.forEach((user) => {
//       // If message is from sender, skip
//       if (user.id === newMessageReceived.senderId) {
//         return;
//       }

//       socket.in(user.id).emit("message received", newMessageReceived);
//     });
//   });

//   socket.on("disconnect", () => {
//     if (socket.userData) {
//       socket.leave(socket.userData.id);
//     } else {
//       console.log("User disconnected without setup");
//     }
//   });
// });

// server.listen(PORT, () => {
//   console.log(`server is running on port ${PORT}`);
// });


import express from "express";
import dotenv from "dotenv";
import chatRoutes from "./routes/chatRoute.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

dotenv.config();
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const PORT = process.env.PORT || 8000;

const app = express();

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: err.message });
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const corsOptions = {
  origin: "http://localhost:8000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);
app.use("/user", userRoutes);
app.use("/message", messageRoutes);

const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname1, "frontend", "dist", "index.html"));
  });
}

const server = createServer(app);

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:8000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("setup", (userData) => {
    if (!userData || !userData.id) {
      return;
    }

    socket.userData = userData;
    socket.join(userData.id);
    socket.emit("connected"); // Add this line
  });

  socket.on("join chat", (room) => {
    socket.join(room);
  });

  socket.on("new message", (newMessageReceived) => {
    const chat = newMessageReceived.chat;

    if (!chat.users) {
      return;
    }

    chat.users.forEach((user) => {
      // If message is from sender, skip
      if (user.id === newMessageReceived.senderId) {
        return;
      }

      socket.in(user.id).emit("message received", newMessageReceived);
    });
  });

  socket.on("disconnect", () => {
    if (socket.userData) {
      socket.leave(socket.userData.id);
    } else {
      console.log("User disconnected without setup");
    }
  });
});

server.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
