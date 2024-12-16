import { ChatState } from "../../context/ChatProvider";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React, { useState  } from "react";
import { getuser } from "../../hooks/GetUser";
import CreateGroupChat from "../GroupChat/CreateGroupChat";
import useToggle from "../../hooks/useToggle";

const ChatUser = () => {
  const [loggedUser, setLoggedUser] = useState();

  const group = useToggle();
  const {
    user,
    selectedChat,
    setselectedChat,
    chat,
    setchat,
    notification,
    setnotification,
  } = ChatState();
  

  const { data:allmessages } = useQuery({
    queryKey: ["chatData"],
    queryFn: async () => {
      const res = await axios.get(
        `/chat/allmessages`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      return res.data;
    },
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      setLoggedUser(JSON.parse(localStorage.getItem("token")));
      setchat(data);
    },
  });

  const handleSelectedChat = (userchat) => {
    setselectedChat(userchat);
    const notificationRemove = notification.filter(
      (n) => n.chatId !== userchat.id
    );
    setnotification(notificationRemove);
  };

  return (
    <div className="bg-[rgb(19,26,43)] h-[90vh]">
      {/* Chat Header */}
      <div className="bg-[rgb(19,26,43)] z-10 flex justify-between p-4 items-center border-b shadow-md gap-2">
        <h1 className="font-semibold text-lg sm:text-xl lg:text-2xl text-gray-300">
          Chats
        </h1>
        <button
          className="font-semibold text-sm sm:text-base border-2 px-2 py-1 sm:p-2 rounded-lg text-white bg-gradient-to-r from-[rgb(167,29,49)] to-[rgb(63,13,18)] transition-colors duration-200"
          onClick={group.open}
        >
          Create Group
        </button>
      </div>

      {/* Chat List Section */}
      <div className="p-4">
        {!chat?.length && (
          <p className="text-gray-500 text-center text-base sm:text-xl lg:text-2xl">
            Search and add users to chat
          </p>
        )}

        {/* Chat Items */}
        <div className="space-y-2">
          {chat.map((userchat) => (
            <div
              key={userchat.id}
              className={`flex justify-between items-center text-white border rounded-lg p-3 cursor-pointer transition-colors duration-200  ${
                selectedChat === userchat
                  ? "bg-gradient-to-r from-[rgb(247,44,94)] to-[rgb(139,32,197)]"
                  : "text-white bg-[rgb(16,21,36)]"
              }`}
              onClick={() => handleSelectedChat(userchat)}
            >
              <h1 className="text-sm sm:text-base lg:text-lg truncate flex-1 mr-2">
                {!userchat?.isGroupChat ? (
                  <span>
                    {loggedUser && getuser(loggedUser, userchat.users)}
                  </span>
                ) : (
                  <span>{userchat?.chatName}</span>
                )}
              </h1>
              {notification.some((n) => n.chatId === userchat.id) && (
                <div className="min-w-[1.5rem] h-6 rounded-full bg-red-600 text-white text-center text-sm flex items-center justify-center">
                  {notification.filter((n) => n.chatId === userchat.id).length}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {group.isOpen && (
        <div
          className="fixed inset-0 z-50 bg-gray-800 bg-opacity-50 flex items-center justify-center p-4"
          onClick={group.close}
        >
          <div
            className="w-full max-w-md bg-white rounded-lg"
            onClick={(e) => {
              e.stopPropagation();
              console.log("Inner modal clicked");
            }}
          >
            <CreateGroupChat />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatUser;
