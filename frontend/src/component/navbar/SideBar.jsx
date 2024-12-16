
import { ChatState } from "../../context/ChatProvider";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import { CiSearch } from "react-icons/ci";
import toast from "react-hot-toast";
import useSearch from "../../hooks/useSearch";

const SideBar = ({ isOpen, onClose }) => {
  const { user, setselectedChat, chat, setchat } = ChatState();

  const { isSearch, setisSearch, search, isLoading } = useSearch();

  // Mutation for creating a chat
  const { mutate: createChat } = useMutation({
    mutationFn: async (friendsId) => {
      const res = await axios.post(
        `/chat/creatChat`,
        { friendsId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      return res.data;
    },
    onSuccess: (data) => {
      if (!chat.some((c) => c.id === data.id)) {
        setchat((prevChats) => [data, ...prevChats]); // Add new chat to the list
        setselectedChat(data); // Set the newly created chat as selected
      } else {
        toast.success("Chat already exists!");
      }
      onClose(); // Close the sidebar
    },
    onError: (error) => {
      console.error("Error creating chat:", error);
      toast.error(error?.response?.data?.error || "Something went wrong");
    },
  });

  const handleCreateChat = (friendsId) => {
    createChat(friendsId);
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-[300px] bg-[rgb(9,14,26)] text shadow-lg border transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      } z-50`}
    >
      {/* Search Section */}
      <div className="p-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="w-full p-2 border rounded-lg border-none focus:outline-none focus:ring-0 border-b-gray-400 bg-gray-700"
            placeholder="Search username"
            value={isSearch}
            onChange={(e) => setisSearch(e.target.value)}
          />
          <button
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            onClick={() => setisSearch(isSearch.trim())}
            aria-label="Search"
          >
            <CiSearch size={20} />
          </button>
        </div>
      </div>

      {/* Search Results */}
      <div className="p-4">
        {isLoading ? (
          <p className="text-center text-gray-500">Searching...</p>
        ) : search && search.length > 0 ? (
          <ul>
            {search.map((user) => (
              <li
                key={user.id}
                className="flex items-center gap-3 p-3 border-b rounded-lg hover:bg-gradient-to-r from-[rgb(247,44,94)] to-[rgb(139,32,197)] text-white cursor-pointer"
                onClick={() => handleCreateChat(user.id)}
              >
                <img
                  className="w-10 h-10 rounded-full"
                  src={
                    user?.profileImg
                      ? user?.profileImg
                      : "/avatar-placeholder.png"
                  }
                  alt={user?.fullName}
                />
                <div>
                  <h1 className="text-sm font-semibold">{user.fullName}</h1>
                  <p className="text-xs text-gray-500">
                    Username: {user.userName}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          !isLoading && (
            <p className="text-center text-gray-500 mt-4">
              {isSearch.trim()
                ? "No results found"
                : "Start typing to search for users"}
            </p>
          )
        )}
      </div>
    </div>
  );
};

export default SideBar;
