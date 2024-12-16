
import React, { useRef, useEffect } from "react";

const ScrollChat = ({ message, loggedInUser }) => {
  const messageRef = useRef(null);

  useEffect(() => {
    messageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  return (
    <div className="p-4 space-y-4 w-full max-w-screen-lg mx-auto">
      {message &&
        message.map((mess, index) => {
          const isSentByLoggedInUser = mess.senderId === loggedInUser;
          const isLastMessageSentByUser =
            index === message.length - 1 ||
            message[index + 1].senderId !== mess.senderId;
         
          return (
            <div
              key={index}
              className={`flex ${
                isSentByLoggedInUser ? "justify-end" : "justify-start"
              }`}
            >
              {!isSentByLoggedInUser && isLastMessageSentByUser && (
                <div className="flex items-center mr-2">
                  <img
                    className="rounded-full w-8 h-8 md:w-9 md:h-9 self-start"
                    src={mess?.sender?.profileImg ? mess?.sender?.profileImg : "/avatar-placeholder.png"}
                    alt={`${mess.sender.userName}'s profile`}
                  />
                </div>
              )}
              {!isSentByLoggedInUser && !isLastMessageSentByUser && (
                <div className="w-9 mr-2"></div>
              )}
              <div
                className={`max-w-[75%] md:max-w-[60%] lg:max-w-[50%] rounded-lg p-3 text-sm break-words ${
                  isSentByLoggedInUser
                    ? "bg-gradient-to-r from-[rgb(247,44,94)] to-[rgb(139,32,197)] text-white rounded-br-none"
                    : "bg-gradient-to-r from-[rgb(255,150,93)] to-[rgb(255,64,86)] text-white rounded-bl-none"
                }`}
              >
                {mess.content}
              </div>
            </div>
          );
        })}
      <div ref={messageRef}></div>
    </div>
  );
};

export default ScrollChat;
