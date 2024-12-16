import { createContext, useContext, useEffect } from "react"
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ChatContext = createContext()

const ChatProvider = ({children}) => {
  const [user, setuser] = useState();
  const [selectedChat, setselectedChat] = useState();
  const [chat, setchat] = useState([]);
  const [notification, setnotification] = useState([]);

  const navigate = useNavigate();

   useEffect(() => {
     const userInfo = JSON.parse(localStorage.getItem("token"));
     if (userInfo) {
       setuser(userInfo);
     } else {
       navigate("/register");
     }
   }, [navigate]);

  return (
    <ChatContext.Provider
      value={{
        user,
        setuser,
        selectedChat,
        setselectedChat,
        chat,
        setchat,
        notification,
        setnotification,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
    return useContext(ChatContext);
}

export default ChatProvider