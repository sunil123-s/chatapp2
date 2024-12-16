
import { ChatState } from '../../context/ChatProvider'
import { useMutation,useQueryClient } from '@tanstack/react-query'
import React,{useState} from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { IoMdClose } from "react-icons/io";
import useSearch from '../../hooks/useSearch'

const CreateGroupChat = () => {
  const [groupName, setgroupName] = useState("");
  const [selecteduser, setselecteduser] = useState([]);

  const { user, chat, setchat } = ChatState();
  const {isSearch,setisSearch,search,isLoading} = useSearch()
  const queryClient = useQueryClient()

  const { mutate: createGroup, isLoading: isGrouping } = useMutation({
    mutationFn: async () => {
      const res = await axios.post(
        `/chat/creategroup`,
        {
          groupName,
          friendsId: selecteduser.map((user) => user.id),
        },
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
      toast.success("Group chat created");
      setchat([data, ...chat]);
      queryClient.invalidateQueries({ queryKey: ["chatData"] });
       setgroupName("");
       setselecteduser([]);
       setisSearch("");
    },
  });

  const handelGroup = (userToAdd) => {
    if (selecteduser.includes(userToAdd)) {
      return toast.error("User already added.");
    }
    setselecteduser([...selecteduser, userToAdd]);
  };

    const handelSubmit = (e) => {
      e.preventDefault();
      if (!groupName || selecteduser.length === 0) {
        return toast.error("Please fill out all fields.");
      }
      createGroup();
    };

  const handelDelete = (deleteId) => {
    setselecteduser(selecteduser.filter((r) => r.id !== deleteId.id));
  };

  return (
    <div className="bg-[rgb(19,26,43)] text-white w-full max-w-lg p-6 rounded-lg shadow-lg">
      <h1 className="text-center text-2xl lg:text-3xl font-medium mb-4">
        Create Group Chat +
      </h1>
      <form className="flex flex-col" onSubmit={handelSubmit}>
        <input
          className="border p-2 mb-4 rounded-lg w-full text-black"
          type="text"
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setgroupName(e.target.value)}
        />
        <input
          className="border p-2 rounded-lg w-full text-black"
          type="text"
          placeholder="Add friends (e.g., John, Jane)"
          value={isSearch}
          onChange={(e) => setisSearch(e.target.value)}
        />
        <button
          type="submit"
          className="bg-gradient-to-t from-[rgb(107,115,255)] to-[rgb(0,13,255)] text-white p-2 mt-4 rounded-lg hover:bg-blue-700"
        >
          Create Group
        </button>
      </form>
      <div className="mt-4">
        {selecteduser.map((user) => (
          <span
            key={user.id}
            className="inline-flex items-center border px-2 py-1 bg-purple-700 text-white rounded-lg mr-2 mb-2"
          >
            {user.userName}
            <IoMdClose
              className="ml-2 cursor-pointer"
              onClick={() => handelDelete(user)}
            />
          </span>
        ))}
      </div>
      {isLoading ? (
        <p className="text-center mt-4">Loading...</p>
      ) : search?.length > 0 ? (
        <ul>
          {search.slice(0, 4).map((user) => (
            <li
              key={user.id}
              className="p-2 border rounded-lg mb-2 hover:bg-gradient-to-r from-[rgb(247,44,94)] to-[rgb(139,32,197)] text-white  cursor-pointer"
              onClick={() => handelGroup(user)}
            >
              <div className="flex items-center gap-2">
                <img
                  className="w-10 h-10 rounded-full"
                  src={
                    user?.profileImg
                      ? user?.profileImg
                      : "/avatar-placeholder.png"
                  }
                  alt={user.userName}
                />
                <div>
                  <p>{user.fullName}</p>
                  <p className="text-sm text-gray-500">@{user.userName}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-600 mt-4 ">No results found.</p>
      )}
    </div>
  );
};


export default CreateGroupChat;
