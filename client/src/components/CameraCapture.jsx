import React, { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import "../styles/Camera.css";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
// import Navbar from "./Navbar"; // Import the Navbar component

const EyeCaptureInterface = () => {
  const [leftEyeCaptured, setLeftEyeCaptured] = useState(false);
  const [rightEyeCaptured, setRightEyeCaptured] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const [capturingFor, setCapturingFor] = useState(null); // "left" or "right"
  const [medicalHistory, setMedicalHistory] = useState({
    condition: "",
    medications: "",
    allergies: "",
    previousSurgery: "",
  });

  const webcamRef = useRef(null);
  const navigate = useNavigate();

  // ✅ Capture + Upload API integration
  const capture = useCallback(async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return;

      // Convert base64 → Blob
      const byteString = atob(imageSrc.split(",")[1]);
      const mimeString = imageSrc.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });

      // Prepare FormData
      const formData = new FormData();
      formData.append("image", blob, `${capturingFor}_eye.jpg`);
      formData.append("eye", capturingFor);

      try {
        const res = await fetch("http://localhost:3001/api/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // ✅ ensure token stored on login
          },
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          alert(`Error: ${data.error || "Upload failed"}`);
          return;
        }

        console.log("API Response:", data);

        if (capturingFor === "left") {
          setLeftEyeCaptured(true);
        } else {
          setRightEyeCaptured(true);
        }

        alert("Image uploaded & processed successfully!");
      } catch (err) {
        console.error("Upload error:", err);
        alert("Failed to upload image");
      }

      // Close webcam modal
      setShowWebcam(false);
      setCapturingFor(null);
    }
  }, [capturingFor]);

  const navigatteToMedicalHistory = () => {
    navigate("/history");
  };

  const handleCapture = (eye) => {
    setCapturingFor(eye);
    setShowWebcam(true);
  };

  const handleCancelCapture = () => {
    setShowWebcam(false);
    setCapturingFor(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMedicalHistory((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // ✅ Submit full medical history + eye status
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/submit-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...medicalHistory,
          leftEyeCaptured,
          rightEyeCaptured,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(`Error: ${data.error || "Submission failed"}`);
        return;
      }

      alert("Form submitted successfully!");
      console.log("Submission Response:", data);
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to submit form");
    }
  };

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user",
  };

  return (
    <div className="app-container">
      {/* Add Navbar at the top */}
      <Navbar />
      
      <div className="main-content">
        <div className="eye-capture-container">
          {showWebcam && (
            <div className="webcam-overlay">
              <div className="webcam-modal">
                <h2>Capture {capturingFor === "left" ? "Left" : "Right"} Eye</h2>
                <p>
                  Position your {capturingFor === "left" ? "left" : "right"} eye in
                  the center of the frame
                </p>

                <div className="webcam-wrapper">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    className="webcam"
                  />
                </div>

                <div className="webcam-controls">
                  <button onClick={capture} className="capture-webcam-btn">
                    Capture Image
                  </button>
                  <button onClick={handleCancelCapture} className="cancel-btn">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="eye-capture-card">
            <div className="header">
              <h1>Capture The Eyes</h1>
            </div>

            <div className="eyes-section">
              <div className="eyes-container">
                <div className="eye-box left-eye">
                  <h3>Left Eye</h3>
                  <div className="eye-preview">
                    {leftEyeCaptured ? (
                      <div className="capture-success">
                        <div className="success-icon">✓</div>
                        <p>Captured Successfully!</p>
                      </div>
                    ) : (
                      <div className="eye-placeholder">
                        <div className="camera-icon">📷</div>
                        <p>Click capture to open camera</p>
                      </div>
                    )}
                  </div>
                  <button
                    className={`capture-btn ${leftEyeCaptured ? "captured" : ""}`}
                    onClick={() => handleCapture("left")}
                  >
                    {leftEyeCaptured ? "Recapture" : "Capture"}
                  </button>
                </div>

                <div className="eye-box right-eye">
                  <h3>Right Eye</h3>
                  <div className="eye-preview">
                    {rightEyeCaptured ? (
                      <div className="capture-success">
                        <div className="success-icon">✓</div>
                        <p>Captured Successfully!</p>
                      </div>
                    ) : (
                      <div className="eye-placeholder">
                        <div className="camera-icon">📷</div>
                        <p>Click capture to open camera</p>
                      </div>
                    )}
                  </div>
                  <button
                    className={`capture-btn ${rightEyeCaptured ? "captured" : ""}`}
                    onClick={() => handleCapture("right")}
                  >
                    {rightEyeCaptured ? "Recapture" : "Capture"}
                  </button>
                </div>
              </div>
            </div>

            <div className="medical-history-section">
              <button
                type="button"
                onClick={navigatteToMedicalHistory}
                className="submit-btn"
              >
                Medical History
              </button>
              <button type="submit" onClick={handleSubmit} className="submit-btn">
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EyeCaptureInterface;