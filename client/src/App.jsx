import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Splash from "./components/Splash";
import ProfileCard from "./components/Profile";
import EyeCaptureInterface from "./components/CameraCapture";
import MedicalHistoryPage from "./components/MedicalHistory";

function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/splash" element={<Splash />} />
          <Route path="/camera" element={<EyeCaptureInterface />} />
          <Route path="/profile" element={<ProfileCard />} />
          <Route path="/history" element={<MedicalHistoryPage />} />

        </Routes>
      </Router>
    </>
  );
}

export default App;
