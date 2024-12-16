
import React, { useState } from "react";
import {useSignup}  from "../../../hooks/useSignup"
import toast from "react-hot-toast";
import { useLogin } from "../../../hooks/useLogin";
import { useNavigate } from "react-router-dom";

const RegisterForm = () => {
  const [isSignUp, setisSignUp] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    userName: "",
    password: "",
    profileImg: "",
  });
  const navigate = useNavigate();

  const {signup,isLoading: signLoading,isError: signIsError,error: signError,} = useSignup();
  const {login,isLoading: loginLoading,isError: loginisError,error: loginError,} = useLogin();

  const handelLoginAndSignup = () => {
    setisSignUp(!isSignUp);
  };

  const handelSubmit = (e) => {
    e.preventDefault();
    if (isSignUp) {
      signup(formData, {
        onSuccess: (response) => {
          toast.success("User created");
          localStorage.setItem("token", JSON.stringify(response.user));
          navigate("/");
          setFormData({fullName: "",userName: "",password: "",profileImg: "",});
        },
        onError: () => {
          toast.error("Something went wrong");
        },  
      });
    } else {
      login(formData, {
        onSuccess: (response) => {
          toast.success("Logged in");
          localStorage.setItem("token", JSON.stringify(response.user));
          navigate("/");
          setFormData({ userName: "", password: "" });
        },
        onError: () => {
          console.log(error.response.data.error);
          toast.error("Something went wrong");
        },
      });
    }
  };

  const handleInfo = (e) => {
    const { name, files, value } = e.target;

    setFormData(
      {...formData, [name]: files ? files[0] : value}
    )};

  const formTitle = isSignUp ? "Sign Up" : "Login";
  const accountPrompt = isSignUp ? "Already have an account?" : "Don't have an account?";
  const togglePrompt = isSignUp ? "Login" : "Create";

  return (
    <>
      <div
        className="flex items-center justify-center h-screen bg-cover bg-center"
        style={{ backgroundImage: 'url("/background.avif")' }}
      >
        <div className="relative w-full md:w-1/2 px-6 py-8 flex justify-center items-center">
          <div className="relative bg-white bg-opacity-30 backdrop-blur-md p-8 rounded-lg shadow-lg w-full max-w-md">
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6 text-center">
              {formTitle}
            </h1>
            <form onSubmit={handelSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInfo}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleInfo}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInfo}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    name="profileImg"
                    onChange={handleInfo}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
              {(signError || loginError) && (
                <p className="text-red-500 text-center text-sm mt-2">
                  {signError?.response?.data?.error ||
                    loginError?.response?.data?.error}
                </p>
              )}
              <button
                type="submit"
                disabled={signLoading || loginLoading}
                className="w-full py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
              >
                {formTitle}
              </button>
              <p className="text-center text-sm mt-4">
                {accountPrompt}
                <span
                  className="text-blue-500 hover:underline cursor-pointer"
                  onClick={handelLoginAndSignup}
                >
                  {togglePrompt}
                </span>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterForm;
