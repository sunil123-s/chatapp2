
import React, { useState } from "react";
import ChatBox from "../component/content/ChatBox";
import ChatUser from "../component/content/ChatUser";
import { ChatState } from "../context/ChatProvider";
import NavBar from "../component/navbar/NavBar"
import SideBar from "../component/navbar/SideBar";

const Home = () => {
  const { user } = ChatState();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="relative w-full h-screen">
      {/* NavBar */}
      {user && <NavBar />}

      {/* SideBar */}
      {user && <SideBar isOpen={isSidebarOpen} onClose={closeSidebar} />}

      {/* Main Content */}
      <div
        className={`flex transition-all duration-300 ${
          isSidebarOpen ? "ml-[300px]" : "ml-0"
        }`}
      >
        {/* ChatUser Section */}
        <div className="w-4/12">
          {user && <ChatUser/>}
        </div>

        {/* ChatBox Section */}
        <div className="w-8/12">{user && <ChatBox />}</div>
      </div>
    </div>
  );
};

export default Home;
