import { useQuery, useQueryClient } from "@tanstack/react-query";
import SearchBar from "./components/SearchBar.jsx"
import Dashboard from "./components/Dashboard.jsx"
import VideoPage from './components/VideoPage.jsx'
import './App.css';
import {Routes, Route, Navigate } from "react-router-dom"
import Login from "./components/Auth/Login.jsx";
import SignUpPage from "./components/Auth/SignUpPage.jsx";
import HomePage from "./components/Homepage.jsx";
import VideoDetails from "./components/VideoDetails.jsx";

function App() {
  const queryClient = useQueryClient();

  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch("http://localhost:5000/user", {
          credentials: "include", 
        });
        const data = await res.json();
        if (data.error) return null;
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        console.log("authUser is here:", data);
        return data;
      } catch (error) {
        return null;
      }
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        Loading ..
      </div>
    );  
  }

  return (
    <div>
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route 
          path="/login" 
          element={
            !authUser ? (
              <Login onLoginSuccess={() => queryClient.invalidateQueries(["authUser"])} />
            ) : (
              <Navigate to="/" />
            )
          } 
        />
        <Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to='/' />} />
        <Route path="/video/:id" element={authUser ? <VideoDetails /> : <Navigate to='/' />} />
      </Routes>
    </div>
  );
}

export default App;
