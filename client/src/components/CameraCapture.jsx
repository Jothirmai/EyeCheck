import React, { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import "../styles/Camera.css";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const EyeCaptureInterface = () => {
  const [leftEyeFile, setLeftEyeFile] = useState(null);
  const [rightEyeFile, setRightEyeFile] = useState(null);

  const [leftEyeCaptured, setLeftEyeCaptured] = useState(false);
  const [rightEyeCaptured, setRightEyeCaptured] = useState(false);

  const [showWebcam, setShowWebcam] = useState(false);
  const [capturingFor, setCapturingFor] = useState(null);

  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);

  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Capture from webcam
  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return;
      const blob = dataURLtoBlob(imageSrc);
      handleImageSelected(blob, capturingFor);
    }
  }, [capturingFor]);

  // Convert base64 to Blob
  const dataURLtoBlob = (dataURL) => {
    const byteString = atob(dataURL.split(",")[1]);
    const mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) handleImageSelected(file, capturingFor);
  };

  // Save captured/uploaded image
  const handleImageSelected = (file, eye) => {
    if (eye === "left") {
      setLeftEyeFile(file);
      setLeftEyeCaptured(true);
    } else {
      setRightEyeFile(file);
      setRightEyeCaptured(true);
    }
    setShowWebcam(false);
    setCapturingFor(null);
  };

  // Submit images for prediction
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!leftEyeFile || !rightEyeFile) {
      alert("Please capture or upload both eyes before submitting!");
      return;
    }

    const formData = new FormData();
    formData.append("left_eye", leftEyeFile);
    formData.append("right_eye", rightEyeFile);

    try {
      setLoading(true);
      setPredictionResult(null);

      // Debug: log the FormData entries
      console.log([...formData.entries()]);

      const res = await fetch("http://localhost:3001/api/predict", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        alert(`Prediction failed: ${data.error || "Unknown error"}`);
        return;
      }

      setPredictionResult([
        { eye: "Left Eye", prediction: data.left_eye },
        { eye: "Right Eye", prediction: data.right_eye },
      ]);
    } catch (err) {
      setLoading(false);
      console.error("Prediction error:", err);
      alert("Failed to run prediction");
    }
  };

  const navigateToMedicalHistory = () => navigate("/history");
  const handleCapture = (eye) => { setCapturingFor(eye); setShowWebcam(true); };
  const handleCancelCapture = () => { setShowWebcam(false); setCapturingFor(null); };

  const videoConstraints = { width: 1280, height: 720, facingMode: "user" };

  return (
    <div className="app-container">
      <Navbar />
      <div className="main-content">
        <div className="eye-capture-container">
          {showWebcam && (
            <div className="webcam-overlay">
              <div className="webcam-modal">
                <h2>Capture {capturingFor === "left" ? "Left" : "Right"} Eye</h2>
                <p>You can either capture with webcam or upload from device</p>

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
                  <button onClick={capture} className="capture-webcam-btn">Capture with Webcam</button>
                  <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileUpload} />
                  <button onClick={() => fileInputRef.current.click()} className="upload-btn">Upload Image</button>
                  <button onClick={handleCancelCapture} className="cancel-btn">Cancel</button>
                </div>
              </div>
            </div>
          )}

          <div className="eye-capture-card">
            <div className="header"><h1>Capture The Eyes</h1></div>
            <div className="eyes-section">
              <div className="eyes-container">
                {["left", "right"].map((eye) => {
                  const captured = eye === "left" ? leftEyeCaptured : rightEyeCaptured;
                  return (
                    <div key={eye} className={`eye-box ${eye}-eye`}>
                      <h3>{eye === "left" ? "Left Eye" : "Right Eye"}</h3>
                      <div className="eye-preview">
                        {captured ? (
                          <div className="capture-success"><div className="success-icon">✓</div><p>Captured Successfully!</p></div>
                        ) : (
                          <div className="eye-placeholder"><div className="camera-icon">📷</div><p>Click capture to open options</p></div>
                        )}
                      </div>
                      <button className={`capture-btn ${captured ? "captured" : ""}`} onClick={() => handleCapture(eye)}>
                        {captured ? "Recapture / Upload" : "Capture / Upload"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="medical-history-section">
              <button type="button" onClick={navigateToMedicalHistory} className="submit-btn">Medical History</button>
              <button type="submit" onClick={handleSubmit} className="submit-btn" disabled={loading}>{loading ? "Predicting..." : "Submit & Predict"}</button>
            </div>

            {loading && <div className="spinner"></div>}

            {predictionResult && (
              <div className="prediction-result">
                <h2>Prediction Results:</h2>
                <ul>
                  {predictionResult.map((res, idx) => (
                    <li key={idx} style={{ color: res.prediction === "Normal" ? "green" : "red", fontWeight: "bold" }}>
                      {res.eye}: {res.prediction}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EyeCaptureInterface;
