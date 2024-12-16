
import { ChatState } from "../../context/ChatProvider";
import { FaEye } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import { getuser, getFullUser } from "../../hooks/GetUser";
import Profile from "../navbar/Profile";
import GroupProfile from "../GroupChat/GroupProfile";
import Spinner from "../util/Spinner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import ScrollChat from "./ScrollChat";
import { io } from "socket.io-client";
import useToggle from "../../hooks/useToggle";

const EndPoint = "http://localhost:8000"; 
console.log("endpoint:", EndPoint)
let socket;

const ChatsMessages = () => {
  const [message, setMessage] = useState([]);
  const [newmessage, setNewMessage] = useState();
  const [socketConnected, setsocketConnected] = useState(false);
  const { user, selectedChat, notification, setnotification } = ChatState();
  const queryClient = useQueryClient();

  const profile = useToggle()

  // Socket setup
  useEffect(() => {
    socket = io(EndPoint, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    if (user) {
      socket.emit("setup", user);
    }

    socket.on("connected", () => {
      setsocketConnected(true);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    return () => {
      socket.disconnect();
      socket.off();
    };
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    socket.on("message received", (newMessageReceived) => {
      if (!newMessageReceived || !newMessageReceived.chat) {
        console.error("Invalid message received");
        return;
      }

      if (!selectedChat || selectedChat.id !== newMessageReceived.chat.id) {
        const alreadyNotified = notification?.some(
          (n) => n.id === newMessageReceived.id
        );

        if (!alreadyNotified) {
          setnotification((prev) => {
            const prevNotifications = Array.isArray(prev) ? prev : [];
            return [newMessageReceived, ...prevNotifications];
          });
        }
      } else {
        setMessage((prev) => [...prev, newMessageReceived]);
      }
    });

    return () => socket.off("message received");
  }, [selectedChat, notification, socket]);

  useEffect(() => {
    if (selectedChat && socket) {
      socket.emit("join chat", selectedChat.id);
    }
  }, [selectedChat]);

  // Fetch messages
  const {data: allmessages,isLoading,refetch,} = useQuery({
    queryKey: ["fetchMessage", selectedChat?.id],
    queryFn: async () => {
      if (!selectedChat?.id) return [];
      const res = await axios.get(
        `/message/${selectedChat.id}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      return res.data;
    },
    enabled: !!selectedChat?.id,
    onSuccess: (data) => {
      setMessage(data);
      socket.emit("join chat", selectedChat?.id);
    },
    onError: (error) => {
      console.error("Error fetching messages:", error);
    },
  });

  useEffect(() => {
    if (selectedChat) {
      setMessage([]);
      refetch();
    }
  }, [selectedChat, refetch]);

  // Sending messages
  const { mutate: sending } = useMutation({
    mutationFn: async (messageData) => {
      const res = await axios.post(
        `/message/send`,
        messageData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      console.log(res.data)
      return res.data;
    },
    onSuccess: (data) => {
      setNewMessage("");
      socket.emit("new message", data);
      setMessage((prev) => [...prev, data]);
      queryClient.invalidateQueries(["fetchMessage", selectedChat?.id]);
    },
    onError: (error) => {
      console.error("Error sending message:", error);
    },
  });

  const sendMessage = (e) => {
    e.preventDefault();
    if (newmessage?.trim() && selectedChat) {
      const messageData = {
        content: newmessage.trim(),
        chatId: selectedChat.id,
      };
      sending(messageData);
    }
  };

  return (
    <div className="relative h-[90vh]">
      {!selectedChat ? (
        <div className="h-full flex justify-center items-center bg-gray-800 text-white text-center">
          <div>
            <span className="font-semibold text-lg sm:text-xl md:text-2xl underline">
              {user.fullName}
            </span>
            <p className="mt-2 text-sm sm:text-base md:text-lg">
              Please select a user to start chatting.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full bg-gray-800">
          {/* Chat Header */}
          <div className="flex justify-between items-center p-4 bg-[rgb(19,26,43)] text-white ">
            <div className="text-base sm:text-lg md:text-xl truncate">
              {!selectedChat.isGroupChat
                ? `To: ${getuser(user, selectedChat.users).toUpperCase()}`
                : selectedChat?.chatName.toUpperCase()}
            </div>
            <button
              className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-red-400 rounded-full hover:bg-red-500 transition"
              onClick={profile.open}
              aria-label="View Profile"
            >
              <FaEye />
            </button>
          </div>

          {/* Chat Messages with Input */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Spinner />
                </div>
              ) : (
                <ScrollChat message={message} loggedInUser={user.id} />
              )}
            </div>
            <div className="p-2">
              <form
                onSubmit={sendMessage}
                className="flex items-center gap-2 border rounded-lg overflow-hidden"
              >
                <input
                  type="text"
                  className="flex-1 p-2 outline-none text-sm sm:text-base bg-[rgb(19,16,43)] text-white"
                  placeholder="Type a message..."
                  value={newmessage || ""}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={!selectedChat}
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 hover:bg-blue-600 transition"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {profile.isOpen && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center p-4 z-50"
          onClick={profile.close}
        >
          <div
            className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedChat.isGroupChat ? (
              <GroupProfile group={selectedChat} />
            ) : (
              <Profile user={getFullUser(user, selectedChat.users)} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatsMessages;
