import { useEffect } from "react";
import Home from "./pages/Home";
import { Routes, Route, useNavigate } from "react-router-dom";
import ChatPage from "./pages/ChatPage";
import RegisterForm from "./pages/auth/RegisterUser/RegisterForm";
import { Toaster } from "react-hot-toast";

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("token");
    if (!user) {
      navigate("/register");
    }
  }, [navigate]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
