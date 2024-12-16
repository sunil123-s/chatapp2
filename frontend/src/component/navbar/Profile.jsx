
import React from "react";

const generateBio = (userName) => {
  const bioStrings = [
    `Hello, I'm ${userName}, and I love chatting!`,
    `This is ${userName}, always ready for a good conversation.`,
    `I'm ${userName}, excited to connect with new people.`,
    `${userName} here! Let's talk about anything and everything.`,
  ];  
  return bioStrings[Math.floor(Math.random() * bioStrings.length)];
};

const Profile = ({ user }) => {
   const userBio = generateBio(user?.userName || "Guest");
  return (
    <>
      <div className="border rounded-lg p-4 max-w-md mx-auto bg-[rgb(19,26,35)] text-white ">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-lg sm:text-2xl font-bold">{user?.fullName}</h1>
          <img
            className="rounded-full w-24 h-24 sm:w-32 sm:h-32"
            src={
              user?.profileImg
                ? user?.profileImg
                : "/avatar-placeholder.png"
            }
            alt={user ? user.fullName[0] : "G"}
          />
        </div>
        <div className="mt-6">
          <div className="flex gap-2">
            <h1 className="font-semibold">Username:</h1>
            <span>{user?.userName}</span>
          </div>
          <div className="flex gap-2 mt-3">
            <h1 className="font-semibold">Bio:</h1>
            <span>{userBio}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
