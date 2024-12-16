import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ChatProvider from "./context/ChatProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ChatProvider>
          <App />
        </ChatProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
