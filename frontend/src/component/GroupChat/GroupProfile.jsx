
import { ChatState } from '../../context/ChatProvider';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import React,{useState} from 'react'
import toast from 'react-hot-toast';
import { IoMdClose } from "react-icons/io";
import useSearch from '../../hooks/useSearch';

const GroupProfile = ({group}) => {
  const [newGroupName, setnewGroupName] = useState("")

  const {user,selectedChat,setselectedChat} = ChatState()
  const { isSearch, setisSearch, search, isLoading } = useSearch();

  const queryClient = useQueryClient()

  const {mutate:renameGroup} = useMutation({
    mutationFn: async() => {
      const res = await axios.put(
        `/chat/rename`,
        {
          chatName: newGroupName,
          id: group.id,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      return res.data
    },
    onSuccess:(data) => {
      toast.success("Group Name changed")
      setselectedChat(data)
      queryClient.invalidateQueries({ queryKey: ["chatdata"] });
      setnewGroupName("");
    },
    onError:(error) => {
      console.log(error)
    }
    })

  const updateChatName = (e) => {
    e.preventDefault()
    renameGroup()
  }

   const { mutate: addnewUser } = useMutation({
     mutationFn: async (user1) => {
       const res = await axios.put(
         `/chat/groupadd`,
         {
           id: selectedChat.id,
           newusersId: user1.id,
         },
         {
           headers: {
             Authorization: `Bearer ${user.token}`,
           },
         }
       );
       return res.data;
     },
     onSuccess: (data) => {
       toast.success("click Add button ");
       setselectedChat(data)
       queryClient.invalidateQueries({ queryKey: ["chatdata"] });
     },
     onError: () => {
       toast.error("Failed to add user to group");
     },
   });
   
  const addToGroup = (user1) => {
    if(selectedChat.users.find((u) => u.id === user1.id)){
        toast("user already exists!", {icon: "👏",});
        return;
    }
    if(selectedChat.groupAdmin.id !== user.id){
        toast.error("only Admin can add Someone")
        return;
    }
    addnewUser(user1)
  }

  const { mutate: remove } = useMutation({
    mutationFn: async (user1) => {
      const res = await axios.put(
        `/chat/groupremove`,
        {
          id: selectedChat.id,
          removeUserid: user1.id,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success("user removed");
      queryClient.invalidateQueries({ queryKey: ["chatdata"] });
    },
    onError: () => {
      toast.error("Failed to remove user from group");
    },
  });

  const removeUser = (user1) => {
     if (selectedChat.groupAdmin.id !== user.id && user1.id !== user.id) {
       toast.error("only admin can remove someone ");
       return;
     }
     if(user.id === user1) {
       toast.success("your are leaving this group")
     }
     remove(user1)
  }


  return (
    <div className="bg-[rgb(12,19,35)] text-white w-full max-w-lg mx-auto p-4 rounded-lg shadow-lg overflow-y-auto">
      <h1 className="text-center text-2xl lg:text-3xl font-semibold">
        {group?.chatName.toUpperCase()}
      </h1>
      <div className="flex flex-wrap mt-4">
        {group.users.map((user) => (
          <span
            key={user.id}
            className="inline-flex items-center border-none px-2 py-1 bg-gradient-to-r from-[rgb(255,150,93)] to-[rgb(255,64,86)] text-white  rounded-lg mr-2 mb-2"
          >
            {user.userName}
            <IoMdClose
              className="ml-2 cursor-pointer"
              onClick={() => removeUser(user)}
            />
          </span>
        ))}
      </div>
      <form onSubmit={updateChatName} className="mt-4 ">
        <input
          type="text"
          placeholder="New Group Name"
          value={newGroupName}
          onChange={(e) => setnewGroupName(e.target.value)}
          className="border p-2 rounded-lg w-full mb-2 border-b-gray-400 text-black"
        />
        <button className="bg-gradient-to-r from-[rgb(76,247,14)] to-[rgb(111,109,69)] text-white p-2 w-full rounded-lg">
          Update Name
        </button>
      </form>
      <form className="mt-4">
        <input
          type="text"
          placeholder="Search users"
          value={isSearch}
          onChange={(e) => setisSearch(e.target.value)}
          className="border p-2 rounded-lg w-full mb-2 text-black"
        />
        <button className="bg-gradient-to-r from-[rgb(107,115,255)] to-[rgb(0,13,255)] text-white p-2 w-full rounded-lg">
          Add User
        </button>
      </form>
      <button
        className="bg-gradient-to-r from-[rgb(61,12,17)] to-[rgb(216,0,50)] text-white p-2 w-full mt-4 rounded-lg"
        onClick={() => removeUser(user)}
      >
        Leave Group
      </button>
      {isLoading ? (
        <p className="text-center mt-4">Loading...</p>
      ) : search?.length > 0 ? (
        <ul className="mt-4">
          {search.slice(0, 4).map((user) => (
            <li
              key={user.id}
              className="flex items-center gap-2 p-2 border rounded-lg mb-2 hover:text-white hover:bg-gradient-to-r from-[rgb(247,44,94)] to-[rgb(139,32,197)] cursor-pointer"
              onClick={() => addToGroup(user)}
            >
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
                <p className="text-sm hover:text-white text-gray-500">
                  @{user.userName}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-600 mt-4">No results found.</p>
      )}
    </div>
  );
}

export default GroupProfile