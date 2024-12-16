
import { ChatState } from "../../context/ChatProvider";
import React from "react";
import { FaChevronDown } from "react-icons/fa6";
import SideBar from "./SideBar";
import Profile from "./Profile";
import { useNavigate } from "react-router-dom";
import useToggle from "../../hooks/useToggle";


const NavBar = () => {

  const sidebar = useToggle()
  const options = useToggle()
  const profile = useToggle()
  const { user } = ChatState();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/register");
  };

  return (
    <div className="relative w-full h-[80px] bg-[rgb(12,19,35)] text-white">
      <div className="flex justify-between items-center px-4 py-2">
        {/* Search Button */}
        <div className="relative">
          <button
            className="text-sm sm:text-base lg:text-lg px-3 py-2 border-2 rounded-lg"
            onClick={sidebar.toggle}
          >
            Search User
          </button>
        </div>

        {/* App Title */}
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">Chat App</h1>
        </div>

        {/* Profile and Options */}
        <div className="flex items-center gap-3 relative">
          <div
            className="flex items-center gap-2 cursor-pointer hover:bg-[rgb(35,43,61)] p-2 rounded-lg"
            onClick={options.toggle}
          >
            <img
              className="rounded-full w-8 h-8 sm:w-10 sm:h-10"
              src={
                user?.profileImg
                  ? user?.profileImg
                  : "/avatar-placeholder.png"
              }
              alt={user ? user.fullName[0].toUpperCase() : "G"}
            />
            <FaChevronDown className="text-xs sm:text-sm md:text-base" />
          </div>
        </div>
      </div>

      {/* Sidebar */}
      {sidebar.isOpen && (
        <div
          className="fixed inset-0 z-20 bg-gray-800 bg-opacity-50 flex"
          onClick={sidebar.close}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <SideBar isOpen={sidebar.open} onClose={sidebar.close} />
          </div>
        </div>
      )}

      {/* Options Menu */}
      {options.isOpen && (
        <div
          className="absolute top-[70px] right-4 z-10 bg-[rgb(19,26,43)] border rounded-md shadow-md border-none"
          onClick={options.close}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col">
              <button
                className="hover:bg-[rgb(35,43,61)] rounded-lg px-4 py-2"
                onClick={profile.open}
              >
                My Profile
              </button>
              <button
                className="hover:bg-[rgb(35,43,61)] rounded-lg px-4 py-2"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {profile.isOpen && (
        <div
          className="fixed inset-0 z-10 bg-gray-800 bg-opacity-50 flex justify-center items-center p-4"
          onClick={profile.close}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <Profile user={user} />
          </div>
        </div>
      )}
    </div>
  );
};

export default NavBar;

